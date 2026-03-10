import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { motion } from "framer-motion";
import { getToken } from "../../lib/auth.js";

const TYPE_LABEL = {
  SALE: "Sales",
  PURCHASE: "Purchase",
  RECEIPT: "Receipt",
  PAYMENT: "Payment",
  SALES_RETURN: "Sales Return",
  PURCHASE_RETURN: "Purchase Return",
  JOURNAL: "Journal",
  JOURNAL_DR: "Journal",
  JOURNAL_CR: "Journal",
};

function nNum(x) {
  const v = Number(x || 0);
  return Number.isFinite(v) ? v : 0;
}

function fmt(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "0";
}

function fmtBlank(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "";
}

function fmtMoney(n) {
  const x = nNum(n);
  return x
    ? x.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";
}

function amountMeta(r) {
  const debit = nNum(r?.debit);
  const credit = nNum(r?.credit);

  if (debit > 0) return { sign: "+", value: debit, kind: "plus" };
  if (credit > 0) return { sign: "-", value: credit, kind: "minus" };
  return { sign: "", value: 0, kind: "zero" };
}

function getDefaultFYRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const fyStartYear = month >= 3 ? year : year - 1;

  const from = `${fyStartYear}-04-01`;
  const to = now.toISOString().slice(0, 10);

  return { from, to };
}

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [opening, setOpening] = useState(0);
  const [closing, setClosing] = useState(0);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [openRowId, setOpenRowId] = useState("");
  const [dateErr, setDateErr] = useState("");

  const fy = getDefaultFYRange();

  const [from, setFrom] = useState(fy.from);
  const [to, setTo] = useState(fy.to);

  function fmtDateISO(iso) {
    if (!iso) return "-";

    const raw = String(iso).slice(0, 10);
    const d = new Date(`${raw}T00:00:00`);

    if (Number.isNaN(d.getTime())) return "-";

    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-GB", { month: "short" });
    const yyyy = d.getFullYear();

    return `${dd}-${mmm}-${yyyy}`;
  }

  function clampRange(nextFrom, nextTo) {
    if (!nextFrom || !nextTo) {
      return { from: nextFrom, to: nextTo, err: "" };
    }

    if (nextFrom > nextTo) {
      return {
        from: nextFrom,
        to: nextFrom,
        err: "To date cannot be earlier than From date.",
      };
    }

    return { from: nextFrom, to: nextTo, err: "" };
  }

  function onChangeFrom(val) {
    const out = clampRange(val, to);
    setFrom(out.from);
    setTo(out.to);
    setDateErr(out.err);
  }

  function onChangeTo(val) {
    const out = clampRange(from, val);
    setFrom(out.from);
    setTo(out.to);
    setDateErr(out.err);
  }

  const load = async ({ firstLoad = false } = {}) => {
    setErr("");
    setLoading(true);

    let timer;

    if (firstLoad) {
      setPageLoading(true);
      setLoadingProgress(0);

      timer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return 95;
          const inc = prev < 35 ? 7 : prev < 65 ? 4 : 2;
          return Math.min(prev + inc, 95);
        });
      }, 120);
    }

    try {
      const r = await api.transactions({ from, to });

      const items = Array.isArray(r?.items)
        ? r.items
        : Array.isArray(r)
        ? r
        : [];

      const sorted = items
        .slice()
        .sort((a, b) =>
          String(b?.date || "").localeCompare(String(a?.date || ""))
        );

      setRows(sorted);
      setOpening(Number(r?.opening || 0));
      setClosing(Number(r?.closing || 0));
    } catch (e) {
      setErr(e?.message || "Failed");
      setRows([]);
      setOpening(0);
      setClosing(0);
    } finally {
      setLoading(false);

      if (firstLoad) {
        clearInterval(timer);
        setLoadingProgress(100);
        setTimeout(() => {
          setPageLoading(false);
        }, 250);
      }
    }
  };

  useEffect(() => {
    load({ firstLoad: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 150);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  function rowKey(r) {
    return String(
      r?.id ||
        `${r?.date || ""}-${r?.voucherNo || ""}-${r?.voucherType || r?.type || ""}`
    );
  }

  function fileHref(p, token) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const u = p?.url || "";
    return `${base}${u}${u.includes("?") ? "&" : "?"}token=${encodeURIComponent(
      token || ""
    )}`;
  }

  const onExport = () => {
    const token = getToken();

    if (!token) {
      setErr("Session expired. Please login again.");
      return;
    }

    const url = api.exportLedgerPdf(from, to, token);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const tableRows = useMemo(() => rows || [], [rows]);

  function buildParticulars(r) {
  const debit = nNum(r?.debit);
  const credit = nNum(r?.credit);
  const side = debit > 0 ? "To" : credit > 0 ? "By" : "To";

  const typeRaw = String(r?.voucherType || r?.type || "").toUpperCase();
  const narration = String(r?.narration || "").trim();

  if (
    typeRaw === "JOURNAL" ||
    typeRaw === "JOURNAL_DR" ||
    typeRaw === "JOURNAL_CR"
  ) {
    const txt = narration && narration !== "-" ? narration : "Journal";
    return `${side} ${txt}`;
  }

  const label =
    TYPE_LABEL[typeRaw] || (typeRaw ? typeRaw.replaceAll("_", " ") : "Entry");

  let p = `${side} ${label}`;
  if (narration && narration !== "-") p += ` — ${narration}`;
  return p;
}

  if (pageLoading) {
    return <DashboardLoader progress={loadingProgress} label="Loading Transactions" />;
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 sm:p-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_180px_at_12%_0%,rgba(59,130,246,0.08),transparent_55%),radial-gradient(760px_220px_at_95%_0%,rgba(245,158,11,0.08),transparent_60%)]" />

        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="text-lg sm:text-xl font-extrabold star-animated-gradient-text">
              Transactions
            </div>
            <div className="text-sm text-slate-500 mt-1">
              All your entries are shown here (New → Old).
            </div>

            <div className="mt-3 flex gap-2 flex-wrap text-xs">
              <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
                Opening: <b className="text-slate-900">{fmt(opening)}</b>
              </span>
              <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
                Closing: <b className="text-slate-900">{fmt(closing)}</b>
              </span>
            </div>
          </div>

          <div className="w-full xl:w-auto flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_1fr] gap-2 items-center">
              <span className="text-slate-500 text-sm font-medium">From</span>

              <input
                type="date"
                value={from}
                onChange={(e) => onChangeFrom(e.target.value)}
                className="input h-10"
              />

              <span className="text-slate-500 text-sm font-medium">To</span>

              <input
                type="date"
                value={to}
                onChange={(e) => onChangeTo(e.target.value)}
                className="input h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:gap-2">
              <button
                className="btn-ghost w-full sm:w-auto"
                onClick={() => load()}
                type="button"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                className="btn-gradient w-full sm:w-auto"
                onClick={onExport}
                type="button"
              >
                Export Ledger
              </button>
            </div>
          </div>
        </div>

        {dateErr ? (
          <div className="relative mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {dateErr}
          </div>
        ) : null}
      </motion.div>

      {err ? (
        <div className="card p-5 text-sm text-red-700">Error: {err}</div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="w-full overflow-x-hidden">
          <table className="hidden md:table w-full table-auto">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Voucher</th>
                <th className="px-4 py-3">Particulars</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Debit</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Credit</th>
                <th className="px-4 py-3 text-right whitespace-nowrap w-[56px]">
                  👁️
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td className="px-4 py-10" colSpan={6}>
                    <InlineTableLoader text="Refreshing transactions..." />
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => {
                  const k = rowKey(r);
                  const isOpen = openRowId === k;
                  const particulars = buildParticulars(r);
                  const pdfs = Array.isArray(r?.pdfs) ? r.pdfs : [];

                  return (
                    <FragmentRows
                      key={k}
                      keyValue={k}
                      desktop
                      row={r}
                      isOpen={isOpen}
                      particulars={particulars}
                      pdfs={pdfs}
                      fmtDateISO={fmtDateISO}
                      fmtBlank={fmtBlank}
                      setOpenRowId={setOpenRowId}
                      fileHref={fileHref}
                    />
                  );
                })
              )}
            </tbody>
          </table>

          <table className="md:hidden w-full table-fixed">
            <colgroup>
              <col style={{ width: "24%" }} />
              <col style={{ width: "38%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>

            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-[11px] text-slate-500">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Particulars</th>
                <th className="px-2 py-2 text-right">Amount</th>
                <th className="px-2 py-2 text-right">👁️</th>
              </tr>
            </thead>

            <tbody className="text-[11px]">
              {loading ? (
                <tr>
                  <td className="px-2 py-8" colSpan={4}>
                    <InlineTableLoader text="Refreshing transactions..." small />
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td className="px-2 py-4 text-slate-500" colSpan={4}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => {
                  const k = rowKey(r);
                  const isOpen = openRowId === k;
                  const particulars = buildParticulars(r);
                  const amt = amountMeta(r);
                  const pdfs = Array.isArray(r?.pdfs) ? r.pdfs : [];

                  return (
                    <FragmentRows
                      key={k}
                      keyValue={k}
                      desktop={false}
                      row={r}
                      isOpen={isOpen}
                      particulars={particulars}
                      pdfs={pdfs}
                      amt={amt}
                      fmtDateISO={fmtDateISO}
                      fmtMoney={fmtMoney}
                      setOpenRowId={setOpenRowId}
                      fileHref={fileHref}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="text-xs text-slate-500 text-center">
        Thank you for choosing SERVICE INDIA. Need help? Contact support from your company.
      </div>
    </div>
  );
}

function DashboardLoader({ progress = 0, label = "Loading" }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(420px_180px_at_20%_0%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(420px_180px_at_100%_0%,rgba(245,158,11,0.10),transparent_60%)]" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-amber-500 animate-spin" />
          </div>

          <div className="mt-5 text-xl font-extrabold text-slate-900">
            {label}
          </div>

          <div className="mt-1 text-sm text-slate-500">
            Please wait while we prepare your data
          </div>

          <div className="mt-6 w-full">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Loading</span>
              <span>{Math.min(100, Math.max(0, progress))}%</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ ease: "easeOut", duration: 0.25 }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-pulse [animation-delay:150ms]" />
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineTableLoader({ text = "Loading...", small = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div
        className={
          small
            ? "h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 border-r-amber-500 animate-spin"
            : "h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 border-r-amber-500 animate-spin"
        }
      />
      <div className={small ? "text-[11px] text-slate-500" : "text-sm text-slate-500"}>
        {text}
      </div>
    </div>
  );
}

function FragmentRows({
  keyValue,
  desktop,
  row,
  isOpen,
  particulars,
  pdfs,
  amt,
  fmtDateISO,
  fmtBlank,
  fmtMoney,
  setOpenRowId,
  fileHref,
}) {
  const token = getToken();

  if (desktop) {
    return (
      <>
        <tr className="border-b hover:bg-slate-50/70">
          <td className="px-4 py-3 whitespace-nowrap">{fmtDateISO(row?.date)}</td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {row?.voucherNo || "—"}
          </td>
          <td
            className="px-4 py-3 max-w-[620px] truncate"
            title={particulars}
          >
            {particulars}
          </td>
          <td className="px-4 py-3 text-right">{fmtBlank(row?.debit)}</td>
          <td className="px-4 py-3 text-right">{fmtBlank(row?.credit)}</td>

          <td className="px-4 py-3 text-right w-[56px]">
            {pdfs.length ? (
              <button
                type="button"
                className="attachBtn attachBtn--grad"
                title="View attachments"
                onClick={() =>
                  setOpenRowId((prev) => (prev === keyValue ? "" : keyValue))
                }
              >
                <span className="attachBtn__icon" aria-hidden="true">
                  ⬇
                </span>
              </button>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </td>
        </tr>

        {isOpen &&
          pdfs.map((p, idx) => (
            <tr
              key={`${keyValue}-pdf-${p?.id || idx}`}
              className="border-b bg-slate-50/60"
            >
              <td className="px-4 py-3" colSpan={6}>
                <a
                  href={fileHref(p, token)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                  title={p?.name || `PDF ${idx + 1}`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-slate-50">
                    📄
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">
                      PDF {idx + 1}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[520px]">
                      {p?.name || "Attachment"}
                    </div>
                  </div>
                  <span className="ml-auto text-xs font-bold text-slate-600">
                    Open →
                  </span>
                </a>
              </td>
            </tr>
          ))}
      </>
    );
  }

  return (
    <>
      <tr className="border-b">
        <td className="px-2 py-2 align-top whitespace-nowrap">
          {fmtDateISO(row?.date)}
        </td>

        <td className="px-2 py-2 align-top">
          <div className="whitespace-normal break-words leading-4 font-semibold">
            {particulars}
          </div>

          <div className="mt-0.5 text-[10px] text-slate-500 whitespace-nowrap">
            V. No.:{" "}
            <span className="font-semibold text-slate-600">
              {row?.voucherNo || "—"}
            </span>
          </div>
        </td>

        <td
          className={
            "px-2 py-2 text-right font-extrabold whitespace-nowrap " +
            (amt?.kind === "plus"
              ? "text-emerald-600"
              : amt?.kind === "minus"
              ? "text-rose-600"
              : "text-slate-400")
          }
        >
          {amt?.kind === "zero" ? "" : `${amt?.sign}${fmtMoney(amt?.value)}`}
        </td>

        <td className="px-2 py-2 text-right">
          {pdfs.length ? (
            <button
              type="button"
              className="attachBtn attachBtn--grad"
              onClick={() =>
                setOpenRowId((prev) => (prev === keyValue ? "" : keyValue))
              }
              title="Attachments"
            >
              <span className="attachBtn__icon" aria-hidden="true">
                ⬇
              </span>
            </button>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
      </tr>

      {isOpen &&
        pdfs.map((p, idx) => (
          <tr
            key={`${keyValue}-mpdf-${p?.id || idx}`}
            className="border-b bg-slate-50/60"
          >
            <td className="px-2 py-2" colSpan={4}>
              <a
                href={fileHref(p, token)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2"
                title={p?.name || `PDF ${idx + 1}`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border bg-slate-50">
                  📄
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold">PDF {idx + 1}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[210px]">
                    {p?.name || "Attachment"}
                  </div>
                </div>
                <span className="ml-auto text-[11px] font-bold text-slate-600 whitespace-nowrap">
                  Open →
                </span>
              </a>
            </td>
          </tr>
        ))}
    </>
  );
}