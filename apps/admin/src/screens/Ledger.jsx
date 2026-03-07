import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { getToken } from "../lib/auth.js";
import AttachmentMenu from "../components/ui/AttachmentMenu";

export default function Ledger() {
  const [openAttachId, setOpenAttachId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [partyId, setPartyId] = useState("");

  const [rows, setRows] = useState([]);
  const [opening, setOpening] = useState(0);
  const [closing, setClosing] = useState(0);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateErr, setDateErr] = useState("");

  const [from, setFrom] = useState(() => {
    const d = new Date(Date.now() - 30 * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  function fmtDateISO(iso) {
    if (!iso) return "-";
    const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-GB", { month: "short" });
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
  }

  function clampRange(nextFrom, nextTo) {
    if (!nextFrom || !nextTo) return { from: nextFrom, to: nextTo, err: "" };

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

  useEffect(() => {
    (async () => {
      try {
        const list = await api.customers();
        const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
        setCustomers(arr);

        if (arr.length && !partyId) {
          setPartyId(String(arr[0].id));
        }
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load customers");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      if (!partyId) {
        setRows([]);
        setOpening(0);
        setClosing(0);
        return;
      }

      const r = await api.adminLedger(partyId, from, to);

      const items = Array.isArray(r?.rows) ? r.rows : [];
      const sorted = items
        .slice()
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));

      setRows(sorted);
      setOpening(Number(r?.opening || 0));
      setClosing(Number(r?.closing || 0));
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed";

      if (String(e?.response?.status) === "401") {
        setErr(`${msg} (401) — Session missing or expired. Please login again.`);
      } else {
        setErr(msg);
      }

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
  }, [partyId, from, to]);

  const onExport = () => {
    const token = getToken();

    if (!token) {
      setErr("Session expired. Please login again.");
      return;
    }

    if (!partyId) {
      setErr("Please select a party.");
      return;
    }

    const url = api.exportAdminLedgerPdf(partyId, from, to, token);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const partyName = useMemo(() => {
    const c = customers.find((x) => String(x.id) === String(partyId));
    return c?.name || c?.companyName || c?.partyName || "";
  }, [customers, partyId]);

  const tableRows = useMemo(() => {
    if (loading) return [];

    const openingRow = {
      __type: "OPENING",
      id: "opening",
      date: from,
      voucherNo: "—",
      voucherType: "—",
      particulars: opening >= 0 ? "To Opening Balance" : "By Opening Balance",
      dr: opening > 0 ? opening : 0,
      cr: opening < 0 ? Math.abs(opening) : 0,
      runningBalance: opening,
      pdfs: [],
    };

    const closingRow = {
      __type: "CLOSING",
      id: "closing",
      date: to,
      voucherNo: "—",
      voucherType: "—",
      particulars: closing >= 0 ? "By Closing Balance" : "To Closing Balance",
      dr: closing < 0 ? Math.abs(closing) : 0,
      cr: closing > 0 ? closing : 0,
      runningBalance: closing,
      pdfs: [],
    };

    if (!rows.length) return [openingRow, closingRow];
    return [openingRow, ...rows, closingRow];
  }, [rows, from, to, opening, closing, loading]);

  return (
    <div style={S.page}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={S.heroCard}
      >
        <div style={S.heroTop}>
          <div>
            <div style={S.badge}>SERVICE INDIA • Ledger</div>
            <div style={S.h1}>Ledger</div>
            <div style={S.sub}>
              Party-wise ledger statement with opening, transactions, closing and protected PDF attachments.
            </div>

            <div style={S.summaryPills}>
              <span style={S.pill}>
                Opening: <b>{fmt(opening)}</b>
              </span>
              <span style={S.pill}>
                Closing: <b>{fmt(closing)}</b>
              </span>
            </div>
          </div>

          <div style={S.filtersWrap}>
            <div style={S.ledgerFilters}>
              <div style={{ ...S.fieldRow, ...S.partyField }}>
                <div style={S.fieldLabel}>Party</div>
                <select
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  style={S.fieldControl}
                >
                  {customers.length ? null : <option value="">No customers</option>}
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.companyName || c.partyName || `Party #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ ...S.fieldRow, ...S.dateFields }}>
                <div style={S.fieldLabel}>From</div>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => onChangeFrom(e.target.value)}
                  style={S.fieldControl}
                />

                <div style={S.fieldLabel}>To</div>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => onChangeTo(e.target.value)}
                  style={S.fieldControl}
                />
              </div>

              <div style={S.fieldActions}>
                <button style={S.btnGhost} onClick={load}>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button style={S.btnGradient} onClick={onExport}>
                  Export PDF
                </button>
              </div>
            </div>

            {partyName ? (
              <div style={S.selectedText}>
                Selected Party: <b>{partyName}</b>
              </div>
            ) : null}
          </div>
        </div>

        {dateErr ? <div style={S.dateErr}>{dateErr}</div> : null}
      </motion.div>

      {err ? <div style={S.errCard}>Error: {err}</div> : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={S.tableCard}
      >
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Date</th>
                <th style={S.th}>Voucher</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Narration</th>
                <th style={{ ...S.th, textAlign: "right" }}>Debit</th>
                <th style={{ ...S.th, textAlign: "right" }}>Credit</th>
                <th style={{ ...S.th, textAlign: "right" }}>Balance</th>
                <th style={{ ...S.th, textAlign: "right" }}>Attachment</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td style={S.td} colSpan={8}>
                    <div style={S.muted}>Loading...</div>
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => (
                  <tr
                    key={r.id || `${r.date}-${r.voucherNo}-${r.particulars}`}
                    style={
                      r.__type === "OPENING" || r.__type === "CLOSING"
                        ? S.specialRow
                        : S.normalRow
                    }
                  >
                    <td style={S.td}>{fmtDateISO(r.date)}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{r.voucherNo || "-"}</td>
                    <td style={S.td}>{r.voucherType || "-"}</td>
                    <td
                      style={{ ...S.td, maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis" }}
                      title={r.particulars || ""}
                    >
                      {r.particulars || "-"}
                    </td>

                    <td style={{ ...S.td, textAlign: "right" }}>{fmtBlank(r.dr)}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmtBlank(r.cr)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 800 }}>
                      {fmtBlank(r.runningBalance)}
                    </td>

                    <td style={{ ...S.td, textAlign: "right" }}>
                      {r.__type === "OPENING" || r.__type === "CLOSING" ? (
                        <span style={S.attachmentDash}>—</span>
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

      <div style={S.footerText}>
        SERVICE INDIA Admin • Ledger export uses token-protected PDFs.
      </div>
    </div>
  );
}

function fmt(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "0";
}

function fmtBlank(n) {
  const x = Number(n || 0);
  return x ? x.toLocaleString("en-IN") : "";
}

const S = {
  page: {
    padding: 14,
    maxWidth: 1280,
    margin: "0 auto",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  heroCard: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(2,6,23,0.08)",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
    padding: 18,
    backdropFilter: "blur(10px)",
  },

  heroTop: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.16)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 8,
  },

  h1: {
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
  },

  sub: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
    marginTop: 6,
    lineHeight: 1.6,
  },

  summaryPills: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(248,250,252,0.95)",
    border: "1px solid rgba(2,6,23,0.08)",
    fontSize: 12,
    color: "#475569",
    fontWeight: 700,
  },

  filtersWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  ledgerFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "end",
  },

  fieldRow: {
    display: "grid",
    gap: 6,
  },

  partyField: {
    minWidth: 260,
    flex: "1 1 280px",
  },

  dateFields: {
    display: "grid",
    gridTemplateColumns: "auto 170px auto 170px",
    alignItems: "end",
    gap: 8,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: 900,
    color: "#334155",
  },

  fieldControl: {
    height: 40,
    padding: "0 10px",
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },

  fieldActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  btnGhost: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  btnGradient: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(11,94,215,0.18)",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  selectedText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  dateErr: {
    marginTop: 12,
    background: "rgba(245,158,11,0.10)",
    border: "1px solid rgba(245,158,11,0.22)",
    color: "#b45309",
    padding: "10px 12px",
    borderRadius: 14,
    fontSize: 13,
    fontWeight: 800,
  },

  errCard: {
    marginTop: 12,
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: 14,
    fontSize: 13,
    fontWeight: 800,
  },

  tableCard: {
    marginTop: 14,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(2,6,23,0.08)",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
    padding: 16,
    backdropFilter: "blur(10px)",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: 980,
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    background: "rgba(248,250,252,0.95)",
    borderBottom: "1px solid rgba(2,6,23,0.10)",
    padding: "12px 14px",
    fontSize: 11,
    fontWeight: 900,
    color: "#475569",
    textAlign: "left",
    position: "sticky",
    top: 0,
    zIndex: 1,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    fontSize: 12,
    color: "#0f172a",
    whiteSpace: "nowrap",
    verticalAlign: "top",
  },

  normalRow: {
    background: "#fff",
  },

  specialRow: {
    background: "rgba(248,250,252,0.9)",
    fontWeight: 700,
  },

  muted: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
  },

  attachmentDash: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
  },

  footerText: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },
};