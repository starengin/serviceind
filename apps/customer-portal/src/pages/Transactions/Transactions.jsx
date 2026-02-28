import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { motion } from "framer-motion";
import { getToken } from "../../lib/auth.js";
import AttachmentMenu from "../../components/ui/AttachmentMenu";

export default function Transactions() {
  const [openAttachId, setOpenAttachId] = useState("");
  const [rows, setRows] = useState([]);
  const [opening, setOpening] = useState(0);
  const [closing, setClosing] = useState(0);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState(() => {
    const d = new Date(Date.now() - 30 * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  // ✅ date format: dd-MMM-yyyy
  function fmtDateISO(iso) {
    if (!iso) return "-";
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-GB", { month: "short" });
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
  }

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const q = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

      // ✅ Must return: { opening, closing, items }
      const r = await api.transactions(q);

      const items = Array.isArray(r.items) ? r.items : [];
      const sorted = items
        .slice()
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));

      setRows(sorted);
      setOpening(Number(r.opening || 0));
      setClosing(Number(r.closing || 0));
    } catch (e) {
      setErr(e.message || "Failed");
      setRows([]);
      setOpening(0);
      setClosing(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);


  const onExport = () => {
    const token = getToken();
    if (!token) {
      setErr("Session expired. Please login again.");
      return;
    }
    const url = api.exportLedgerPdf(from, to, token);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ✅ Always show opening + closing rows (even if no txns)
  const tableRows = useMemo(() => {
    if (loading) return [];

const openingRow = {
  __type: "OPENING",
  id: "opening",
  date: from,
  voucherNo: "—",
  voucherType: "—",
  narration:
    opening > 0
      ? "To Opening Balance"
      : opening < 0
      ? "By Opening Balance"
      : "Opening Balance",
  debit: opening > 0 ? opening : 0,
  credit: opening < 0 ? Math.abs(opening) : 0,
  runningBalance: opening,
  pdfs: [],
};

    const closingRow = {
      __type: "CLOSING",
      id: "closing",
      date: to,
      voucherNo: "—",
      voucherType: "—",
      narration: "By Closing Balance",
      debit: closing > 0 ? closing : 0,
      credit: closing < 0 ? Math.abs(closing) : 0,
      runningBalance: closing,
      pdfs: [],
    };

    // ✅ if no txns => just opening + closing
    if (!rows.length) return [openingRow, closingRow];

    // ✅ txns exist => opening + txns + closing
    return [openingRow, ...rows, closingRow];
  }, [rows, from, to, opening, closing, loading]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Transactions</div>
            <div className="text-sm text-slate-500">
              All your entries are shown here (Old → New).
            </div>

            <div className="mt-2 flex gap-2 flex-wrap text-xs text-slate-600">
              <span className="px-2 py-1 rounded-full bg-slate-100">
                Opening: <b>{fmt(opening)}</b>
              </span>
              <span className="px-2 py-1 rounded-full bg-slate-100">
                Closing: <b>{fmt(closing)}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="text-slate-500">From</span>
            <div className="flex gap-2 items-center">
              <input
  type="date"
  value={from}
  onChange={(e) => setFrom(e.target.value)}
  className="border rounded-xl px-3 h-10"
/>
 <span className="text-slate-500">To</span>
<input
  type="date"
  value={to}          
  onChange={(e) => setTo(e.target.value)}
  className="border rounded-xl px-3 h-10"
/>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={load}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button className="btn-gradient" onClick={onExport}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {err ? <div className="card p-5 text-sm text-red-700">Error: {err}</div> : null}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-auto">
          <table className="min-w-[980px] w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Voucher</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Narration</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">Attachment</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      r.__type === "OPENING" || r.__type === "CLOSING"
                        ? "border-b bg-slate-50 font-semibold"
                        : "border-b last:border-b-0 hover:bg-slate-50/60"
                    }
                  >
                    <td className="px-4 py-3">{fmtDateISO(r.date)}</td>
                    <td className="px-4 py-3 font-medium">{r.voucherNo || "-"}</td>
                    <td className="px-4 py-3">{r.voucherType || "-"}</td>
                    <td className="px-4 py-3 max-w-[420px] truncate" title={r.narration || ""}>
                      {r.narration || "-"}
                    </td>

                    {/* ✅ Zero => Blank */}
                    <td className="px-4 py-3 text-right">{fmtBlank(r.debit)}</td>
                    <td className="px-4 py-3 text-right">{fmtBlank(r.credit)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {fmtBlank(r.runningBalance)}
                    </td>

                    <td className="px-4 py-3 text-right">
  {r.__type === "OPENING" || r.__type === "CLOSING" ? (
    <span className="text-xs text-slate-400">—</span>
  ) : (
    <AttachmentMenu
      pdfs={r.pdfs || []}
      rowId={String(r.id || `${r.date}-${r.voucherNo}`)}
      openId={openAttachId}
      setOpenId={setOpenAttachId}
      makeUrl={(p, idx, token) => {
        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const u = p.url || "";
        return `${base}${u}${u.includes("?") ? "&" : "?"}token=${encodeURIComponent(token || "")}`;
      }}
    />
  )}
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="text-xs text-slate-500 text-center">
        Thank you for choosing STAR. Need help? Contact support from your company.
      </div>
    </div>
  );
}

// header badges me 0 bhi dikhana hai, so fmt keeps 0
function fmt(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "0";
}

// table me 0 blank chahiye
function fmtBlank(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "";
}