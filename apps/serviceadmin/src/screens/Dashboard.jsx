import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";

function toISO(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function moneyINR(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const pageAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const gridAnim = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
};

export default function Dashboard() {
  const [from, setFrom] = useState(() => toISO(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(() => toISO(new Date()));
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.dashboard({ from, to });
      setData(res?.data ?? res);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const d = data || {};
    return [
      {
        label: "Customers",
        value: d.usersCount ?? 0,
        hint: "Registered customer accounts",
      },
      {
        label: "Transactions",
        value: d.transactionsCount ?? 0,
        hint: "For selected period",
      },
      {
        label: "Total Sales",
        value: `₹ ${moneyINR(d.totalSales)}`,
        hint: "SALE entries",
      },
      {
        label: "Total Purchase",
        value: `₹ ${moneyINR(d.totalPurchase)}`,
        hint: "PURCHASE entries",
      },
      {
        label: "Total Receipt",
        value: `₹ ${moneyINR(d.totalReceipt)}`,
        hint: "RECEIPT entries",
      },
      {
        label: "Total Payment",
        value: `₹ ${moneyINR(d.totalPayment)}`,
        hint: "PAYMENT entries",
      },
      {
        label: "Sales Return",
        value: `₹ ${moneyINR(d.totalSalesReturn)}`,
        hint: "SALES_RETURN entries",
      },
      {
        label: "Purchase Return",
        value: `₹ ${moneyINR(d.totalPurchaseReturn)}`,
        hint: "PURCHASE_RETURN entries",
      },
    ];
  }, [data]);

  return (
    <motion.div variants={pageAnim} initial="hidden" animate="show" style={S.page}>
      <div style={S.hero}>
        <div>
          <div style={S.badge}>SERVICE INDIA • Admin Dashboard</div>
          <div style={S.h1}>Welcome, Admin</div>
          <div style={S.sub}>
            Quick financial and operational overview for the selected period.
          </div>
        </div>

        <div style={S.topBtns}>
          <a style={S.btn} href="/customers">
            Customers
          </a>
          <a style={S.btn} href="/transactions">
            Transactions
          </a>
          <a style={S.btnPrimary} href="/ledger">
            Ledger
          </a>
        </div>
      </div>

      <div style={S.filterBar}>
        <div style={S.field}>
          <label style={S.label}>From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={S.input}
          />
        </div>

        <div style={S.field}>
          <label style={S.label}>To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={S.input}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          onClick={load}
          style={S.apply}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply"}
        </motion.button>
      </div>

      {err ? <div style={S.err}>{err}</div> : null}

      {loading ? (
        <div style={S.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={S.skelCard}>
              <div style={S.skelLine1} />
              <div style={S.skelLine2} />
              <div style={S.skelLine3} />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={gridAnim} initial="hidden" animate="show" style={S.grid}>
          {cards.map((c) => (
            <motion.div
              key={c.label}
              variants={cardAnim}
              whileHover={{ y: -2 }}
              style={S.card}
            >
              <div style={S.cardTop}>
                <div style={S.cardLabel}>{c.label}</div>
                <div style={S.pill}>PERIOD</div>
              </div>
              <div style={S.cardValue}>{c.value}</div>
              <div style={S.cardHint}>{c.hint}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div variants={cardAnim} initial="hidden" animate="show" style={S.bigCard}>
        <div style={S.bigTitle}>Quick Actions</div>

        <div style={S.quickGrid}>
          <a style={S.q} href="/customers">
            Manage Customers
          </a>
          <a style={S.q} href="/transactions">
            + New Transaction
          </a>
          <a style={S.q} href="/ledger">
            View Ledger
          </a>
          <a style={S.q} href="/emails">
            Open Email Center
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

const S = {
  page: {
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: 14,
    maxWidth: 1200,
    margin: "0 auto",
  },

  hero: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
    padding: "14px 2px 4px",
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
    fontSize: "clamp(20px, 2.6vw, 28px)",
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.1,
  },

  sub: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
    marginTop: 6,
    lineHeight: 1.6,
  },

  topBtns: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  btn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "rgba(255,255,255,0.88)",
    color: "#0f172a",
    fontWeight: 900,
    textDecoration: "none",
    fontSize: 13,
    boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
  },

  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    fontSize: 13,
    boxShadow: "0 12px 24px rgba(11,94,215,0.18)",
  },

  filterBar: {
    display: "flex",
    gap: 10,
    alignItems: "end",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(2,6,23,0.08)",
    borderRadius: 18,
    padding: "12px 14px",
    boxShadow: "0 12px 24px rgba(2,6,23,0.05)",
    backdropFilter: "blur(10px)",
    marginBottom: 14,
  },

  field: {
    display: "grid",
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0f172a",
  },

  input: {
    width: 160,
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid rgba(2,6,23,0.12)",
    outline: "none",
    fontSize: 12,
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#0f172a",
  },

  apply: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(11,94,215,0.18)",
  },

  err: {
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    fontSize: 13,
    marginBottom: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
  },

  card: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
    padding: 15,
    minHeight: 104,
    backdropFilter: "blur(10px)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
  },

  pill: {
    fontSize: 10,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    color: "#1d4ed8",
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.16)",
  },

  cardValue: {
    marginTop: 11,
    fontSize: "clamp(18px, 2.2vw, 24px)",
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.2,
  },

  cardHint: {
    marginTop: 7,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  bigCard: {
    marginTop: 14,
    background: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
    padding: 15,
    backdropFilter: "blur(10px)",
  },

  bigTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 12,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },

  q: {
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.10)",
    background: "rgba(248,250,252,0.95)",
    fontWeight: 900,
    color: "#0f172a",
    textDecoration: "none",
    textAlign: "center",
    fontSize: 13,
    boxShadow: "0 8px 18px rgba(2,6,23,0.03)",
  },

  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
  },

  skelCard: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(2,6,23,0.08)",
    padding: 14,
  },

  skelLine1: {
    height: 12,
    width: "55%",
    borderRadius: 10,
    background: "rgba(2,6,23,0.08)",
  },

  skelLine2: {
    height: 22,
    width: "75%",
    borderRadius: 10,
    background: "rgba(2,6,23,0.10)",
    marginTop: 10,
  },

  skelLine3: {
    height: 12,
    width: "50%",
    borderRadius: 10,
    background: "rgba(2,6,23,0.08)",
    marginTop: 10,
  },
};