import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  SALE: "#2563eb",
  RECEIPT: "#10b981",
  SALES_RETURN: "#f59e0b",
  JOURNAL: "#64748b",
  PURCHASE: "#7c3aed",
  PAYMENT: "#ef4444",
  PURCHASE_RETURN: "#0ea5e9",
  YELLOW_NEG: "#facc15",
};

export default function Home() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [allRows, setAllRows] = useState([]);
  const [lifetimeRows, setLifetimeRows] = useState([]);
const [loadingLifetimeRows, setLoadingLifetimeRows] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [period, setPeriod] = useState(getDefaultFinancialYearRange);
  const [draftPeriod, setDraftPeriod] = useState(getDefaultFinancialYearRange);

  useEffect(() => {
    let alive = true;

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) return 95;
        const inc = prev < 35 ? 7 : prev < 65 ? 4 : 2;
        return Math.min(prev + inc, 95);
      });
    }, 120);

(async () => {
  try {
    const [dashboardRes, lifetimeRes] = await Promise.all([
      fetchDashboardSafe(),
      fetchLifetimeTransactionsSafe(),
    ]);

    if (alive) {
      setData(dashboardRes || null);
      setAllRows(dashboardRes?.recent || []);
      setLifetimeRows(normalizeTxnResponse(lifetimeRes));
    }
  } catch (e) {
    if (alive) setErr(e.message || "Failed");
  } finally {
    if (alive) {
      setLoadingLifetimeRows(false);
      setLoadingProgress(100);
      setTimeout(() => {
        if (alive) setPageLoading(false);
      }, 250);
    }
  }
})();

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingRows(true);

        const res = await fetchTransactionsSafe(period.from, period.to);
        const rows = normalizeTxnResponse(res);

        if (alive) setAllRows(rows);
      } catch (e) {
        if (alive) {
          setAllRows([]);
          setErr((prev) => prev || e.message || "Failed");
        }
      } finally {
        if (alive) setLoadingRows(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [period.from, period.to]);

  const filteredRows = useMemo(() => {
    return (allRows || []).filter((r) => isRowInPeriod(r, period.from, period.to));
  }, [allRows, period.from, period.to]);
  

  const journalSplit = useMemo(() => {
  let dr = 0;
  let cr = 0;

  for (const r of filteredRows) {
    const type = getTxnType(r);

    if (type !== "JOURNAL" && type !== "JOURNAL_DR" && type !== "JOURNAL_CR") {
      continue;
    }

    const debit = toNum(
      r?.debit ??
        r?.dr ??
        r?.debitAmount ??
        r?.debit_amount ??
        r?.drAmount ??
        r?.Dr ??
        r?.DR
    );

    const credit = toNum(
      r?.credit ??
        r?.cr ??
        r?.creditAmount ??
        r?.credit_amount ??
        r?.crAmount ??
        r?.Cr ??
        r?.CR
    );

    if (debit || credit) {
      dr += debit;
      cr += credit;
      continue;
    }

    const amt = toAmount(r);
    const side = String(
      r?.side ?? r?.dc ?? r?.drcr ?? r?.DrCr ?? r?.dcFlag ?? ""
    ).toUpperCase();

    if (type === "JOURNAL_DR") {
      dr += amt;
      continue;
    }

    if (type === "JOURNAL_CR") {
      cr += amt;
      continue;
    }

    // legacy JOURNAL fallback
    if (amt) {
      if (side === "DR" || side === "DEBIT") dr += amt;
      if (side === "CR" || side === "CREDIT") cr += amt;
    }
  }

  return { dr, cr };
}, [filteredRows]);
const lifetimeJournalSplit = useMemo(() => {
  let dr = 0;
  let cr = 0;

  for (const r of lifetimeRows) {
    const type = getTxnType(r);

    if (type !== "JOURNAL" && type !== "JOURNAL_DR" && type !== "JOURNAL_CR") {
      continue;
    }

    const debit = toNum(
      r?.debit ??
        r?.dr ??
        r?.debitAmount ??
        r?.debit_amount ??
        r?.drAmount ??
        r?.Dr ??
        r?.DR
    );

    const credit = toNum(
      r?.credit ??
        r?.cr ??
        r?.creditAmount ??
        r?.credit_amount ??
        r?.crAmount ??
        r?.Cr ??
        r?.CR
    );

    if (debit || credit) {
      dr += debit;
      cr += credit;
      continue;
    }

    const amt = toAmount(r);
    const side = String(
      r?.side ?? r?.dc ?? r?.drcr ?? r?.DrCr ?? r?.dcFlag ?? ""
    ).toUpperCase();

    if (type === "JOURNAL_DR") {
      dr += amt;
      continue;
    }

    if (type === "JOURNAL_CR") {
      cr += amt;
      continue;
    }

    if (amt) {
      if (side === "DR" || side === "DEBIT") dr += amt;
      if (side === "CR" || side === "CREDIT") cr += amt;
    }
  }

  return { dr, cr };
}, [lifetimeRows]);


const salesTrend = useMemo(() => {
  return buildTrendFromRows(filteredRows, period.from, period.to);
}, [filteredRows, period.from, period.to]);

const purchaseTrend = useMemo(() => {
  return buildTrendFromRows(filteredRows, period.from, period.to);
}, [filteredRows, period.from, period.to]);
const lifetimeTotals = useMemo(() => {
  const totals = {
    sales: 0,
    receipt: 0,
    salesReturn: 0,
    purchase: 0,
    payment: 0,
    purchaseReturn: 0,
    journalDr: Number(lifetimeJournalSplit.dr || 0),
    journalCr: Number(lifetimeJournalSplit.cr || 0),
  };

  for (const r of lifetimeRows) {
    const type = getTxnType(r);
    const amount = toAmount(r);

    if (type === "SALE") totals.sales += amount;
    else if (type === "RECEIPT") totals.receipt += amount;
    else if (type === "SALES_RETURN") totals.salesReturn += amount;
    else if (type === "PURCHASE") totals.purchase += amount;
    else if (type === "PAYMENT") totals.payment += amount;
    else if (type === "PURCHASE_RETURN") totals.purchaseReturn += amount;
  }

  return totals;
}, [lifetimeRows, lifetimeJournalSplit]);

  const kpiTotals = useMemo(() => {
    const totals = {
      sales: 0,
      receipt: 0,
      salesReturn: 0,
      purchase: 0,
      payment: 0,
      purchaseReturn: 0,
      journalDr: Number(journalSplit.dr || 0),
      journalCr: Number(journalSplit.cr || 0),
    };

    for (const r of filteredRows) {
      const type = getTxnType(r);
      const amount = toAmount(r);

      if (type === "SALE") totals.sales += amount;
      else if (type === "RECEIPT") totals.receipt += amount;
      else if (type === "SALES_RETURN") totals.salesReturn += amount;
      else if (type === "PURCHASE") totals.purchase += amount;
      else if (type === "PAYMENT") totals.payment += amount;
      else if (type === "PURCHASE_RETURN") totals.purchaseReturn += amount;
    }

    return totals;
  }, [filteredRows, journalSplit]);
  const outstandingRaw = Number(
  data?.summary?.outstanding ??
  data?.outstanding ??
  data?.balance ??
  0
);

const outstandingAbs = Math.abs(outstandingRaw);

let outstandingTitle = "Outstanding";
let outstandingHint = "Current balance";
let outstandingStatus = "";
let outstandingDisplayValue = outstandingAbs;
let outstandingClassName = "";
let outstandingValueClassName = "";

if (outstandingRaw > 0) {
  outstandingStatus = "Net Amount Due";
  outstandingHint = "Outstanding from your side";
  outstandingClassName = "kpi-glow-red";
  outstandingValueClassName = "text-red-600";
} else if (outstandingRaw < 0) {
  outstandingStatus = "Net Balance in Your Favour";
  outstandingHint = "Advance / favourable balance";
  outstandingClassName = "kpi-glow-green";
  outstandingValueClassName = "text-emerald-600";
} else {
  outstandingStatus = "Account Settled";
  outstandingHint = "No outstanding balance";
  outstandingDisplayValue = "Settled";
  outstandingClassName = "kpi-glow-blue";
  outstandingValueClassName = "text-blue-600";
}
const salesCurrentRaw =
  Number(lifetimeTotals.sales || 0) -
  (Number(lifetimeTotals.receipt || 0) +
    Number(lifetimeTotals.salesReturn || 0) +
    Number(lifetimeTotals.journalCr || 0));

const salesCurrentAbs = Math.abs(salesCurrentRaw);
const showSalesCurrent = salesCurrentAbs > 0;

let salesCurrentTitle = "Sales Side Status";
let salesCurrentHint =
  "Lifetime sales, receipt, sales return and journal credit considered";
let salesCurrentStatus = "";
let salesCurrentClassName = "";
let salesCurrentValueClassName = "";

if (salesCurrentRaw > 0) {
  salesCurrentTitle = "Sales Side";
  salesCurrentHint = "Kindly Issue the pending payment to the SERVICE INDIA";
  salesCurrentStatus = "Payment Due";
  salesCurrentClassName = "kpi-glow-amber";
  salesCurrentValueClassName = "text-amber-600";
}

else if (salesCurrentRaw < 0) {
  salesCurrentTitle = "Sales Side";
  salesCurrentHint = "SERVICE INDIA will generate the pending invoice once the work is completed.";
  salesCurrentStatus = "Invoice not Generated";
  salesCurrentClassName = "kpi-glow-violet";
  salesCurrentValueClassName = "text-violet-600";
}
const purchaseCurrentRaw =
  Number(lifetimeTotals.purchase || 0) -
  (Number(lifetimeTotals.payment || 0) +
    Number(lifetimeTotals.purchaseReturn || 0) +
    Number(lifetimeTotals.journalDr || 0));

const purchaseCurrentAbs = Math.abs(purchaseCurrentRaw);
const showPurchaseCurrent = purchaseCurrentAbs > 0;

let purchaseCurrentTitle = "Purchase Side Status";
let purchaseCurrentHint =
  "Lifetime purchase, payment, purchase return and journal debit considered";
let purchaseCurrentStatus = "";
let purchaseCurrentClassName = "";
let purchaseCurrentValueClassName = "";

if (purchaseCurrentRaw < 0) {
  purchaseCurrentTitle = "Purchase Side";
  purchaseCurrentHint = "Kindly Generate the pending invoice for SERVICE INDIA";
  purchaseCurrentStatus = "Waiting for Your Invoice";
  purchaseCurrentClassName = "kpi-glow-cyan";
  purchaseCurrentValueClassName = "text-cyan-600";
}

else if (purchaseCurrentRaw > 0) {
  purchaseCurrentTitle = "Purchase Side";
  purchaseCurrentHint = "SERVICE INDIA will issue the pending Payment before the due date.";
  purchaseCurrentStatus = "Your Receivable is Pending";
  purchaseCurrentClassName = "kpi-glow-rose";
  purchaseCurrentValueClassName = "text-rose-600";
}

  const salesPieData = useMemo(() => {
    return buildVoucherPie(
      [
        { key: "SALE", label: "Sale", value: kpiTotals.sales },
        { key: "RECEIPT", label: "Receipt", value: kpiTotals.receipt },
        { key: "SALES_RETURN", label: "Sales Return", value: kpiTotals.salesReturn },
        { key: "JOURNAL_CR", label: "Journal CR", value: kpiTotals.journalCr },
      ],
      COLORS
    );
  }, [kpiTotals]);

  const purchasePieData = useMemo(() => {
    return buildVoucherPie(
      [
        { key: "PURCHASE", label: "Purchase", value: kpiTotals.purchase },
        { key: "PAYMENT", label: "Payment", value: kpiTotals.payment },
        { key: "PURCHASE_RETURN", label: "Purchase Return", value: kpiTotals.purchaseReturn },
        { key: "JOURNAL_DR", label: "Journal DR", value: kpiTotals.journalDr },
      ],
      COLORS
    );
  }, [kpiTotals]);

  const dynamicKpis = useMemo(() => {
    const items = [
      { title: "Total Sales to you", value: kpiTotals.sales, hint: "Selected period sale" },
      { title: "Total Purchase from you", value: kpiTotals.purchase, hint: "Selected period purchase" },
      { title: "Total Payment to you", value: kpiTotals.payment, hint: "Selected period payment" },
      { title: "Total Receipt from you", value: kpiTotals.receipt, hint: "Selected period receipt" },
      { title: "Total Sales Return from you", value: kpiTotals.salesReturn, hint: "Selected period sales return" },
      { title: "Total Purchase Return to you", value: kpiTotals.purchaseReturn, hint: "Selected period purchase return" },
      { title: "Total Journal DR", value: kpiTotals.journalDr, hint: "Selected period journal debit" },
      { title: "Total Journal CR", value: kpiTotals.journalCr, hint: "Selected period journal credit" },
    ];

    return items.filter((x) => Number(x.value || 0) > 0);
  }, [kpiTotals]);

  if (err) {
    return <div className="card p-5 text-sm text-red-700">Error: {err}</div>;
  }
if (pageLoading || !data || loadingRows || loadingLifetimeRows) {
  return <DashboardLoader progress={loadingProgress} />;
}

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 sm:p-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_180px_at_12%_0%,rgba(59,130,246,0.08),transparent_55%),radial-gradient(760px_220px_at_95%_0%,rgba(245,158,11,0.08),transparent_60%)]" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="text-lg sm:text-xl font-extrabold star-animated-gradient-text">
              Overview
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Your latest account insights
            </div>
          </div>

          <span className="hidden sm:inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
            Dashboard
          </span>
        </div>

        <div className="relative mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[135px] max-w-[160px]">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              From
            </div>
            <input
              type="date"
              value={draftPeriod.from}
              max={period.to}
              onChange={(e) =>
                setDraftPeriod((prev) => {
                  const nextFrom = e.target.value || prev.from;
                  return {
                    from: nextFrom,
                    to: nextFrom > prev.to ? nextFrom : prev.to,
                  };
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="min-w-[135px] max-w-[160px]">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              To
            </div>
            <input
              type="date"
              value={draftPeriod.to}
              min={draftPeriod.from}
              max={todayYMD()}
              onChange={(e) =>
                setDraftPeriod((prev) => ({
                  ...prev,
                  to: e.target.value || prev.to,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setPeriod(draftPeriod)}
            className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700"
          >
            Apply
          </button>

          <div className="text-xs text-slate-500 sm:ml-2">
            Period: {fmtHumanDate(period.from)} to {fmtHumanDate(period.to)}
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
<Kpi
  title={outstandingTitle}
  status={outstandingStatus}
  value={outstandingDisplayValue}
  hint={outstandingHint}
  className={outstandingClassName}
  valueClassName={outstandingValueClassName}
/>

  {showSalesCurrent ? (
<Kpi
  title={salesCurrentTitle}
  status={salesCurrentStatus}
  value={salesCurrentAbs}
  hint={salesCurrentHint}
  className={salesCurrentClassName}
  valueClassName={salesCurrentValueClassName}
/>
) : null}

  {showPurchaseCurrent ? (
<Kpi
  title={purchaseCurrentTitle}
  status={purchaseCurrentStatus}
  value={purchaseCurrentAbs}
  hint={purchaseCurrentHint}
  className={purchaseCurrentClassName}
  valueClassName={purchaseCurrentValueClassName}
/>
) : null}
  {dynamicKpis.map((k) => (
    <Kpi key={k.title} title={k.title} value={k.value} hint={k.hint} />
  ))}


</div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  Sales Group
                </div>
<div className="text-xs text-slate-500 mt-1">
  SALE • RECEIPT • SALES RETURN • JOURNAL CR
</div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <LegendDot label="Sale" color={COLORS.SALE} />
                <LegendDot label="Receipt" color={COLORS.RECEIPT} />
                <LegendDot label="Sales Return" color={COLORS.SALES_RETURN} />
                <LegendDot label="Journal CR" color={COLORS.JOURNAL} />
              </div>
            </div>

            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesTrend}
                  margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="gSale" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.SALE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.SALE} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gReceipt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.RECEIPT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.RECEIPT} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gSalesReturn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.SALES_RETURN} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.SALES_RETURN} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gJournalCr" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor={COLORS.JOURNAL} stopOpacity={0.35} />
  <stop offset="95%" stopColor={COLORS.JOURNAL} stopOpacity={0.02} />
</linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickMargin={8} tick={{ fontSize: 12 }} />
                  <YAxis tickMargin={8} tick={{ fontSize: 12 }} tickFormatter={fmtCompactINR} />
                  <Tooltip content={<ProTooltip />} />

                  <Area type="monotone" dataKey="SALE" stroke={COLORS.SALE} fill="url(#gSale)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area type="monotone" dataKey="RECEIPT" stroke={COLORS.RECEIPT} fill="url(#gReceipt)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area type="monotone" dataKey="SALES_RETURN" stroke={COLORS.SALES_RETURN} fill="url(#gSalesReturn)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area
  type="monotone"
  dataKey="JOURNAL_CR"
  stroke={COLORS.JOURNAL}
  fill="url(#gJournalCr)"
  strokeWidth={2.4}
  dot={false}
  isAnimationActive
/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  Purchase Group
                </div>
<div className="text-xs text-slate-500 mt-1">
  PURCHASE • PAYMENT • PURCHASE RETURN • JOURNAL DR
</div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <LegendDot label="Purchase" color={COLORS.PURCHASE} />
                <LegendDot label="Payment" color={COLORS.PAYMENT} />
                <LegendDot label="Purchase Return" color={COLORS.PURCHASE_RETURN} />
                <LegendDot label="Journal DR" color={COLORS.JOURNAL} />
                <LegendDot label="Journal CR" color={COLORS.JOURNAL} />
              </div>
            </div>

            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={purchaseTrend}
                  margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.PURCHASE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.PURCHASE} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gPayment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.PAYMENT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.PAYMENT} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gPurchaseReturn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.PURCHASE_RETURN} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.PURCHASE_RETURN} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gJournalDr" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor={COLORS.JOURNAL} stopOpacity={0.35} />
  <stop offset="95%" stopColor={COLORS.JOURNAL} stopOpacity={0.02} />
</linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickMargin={8} tick={{ fontSize: 12 }} />
                  <YAxis tickMargin={8} tick={{ fontSize: 12 }} tickFormatter={fmtCompactINR} />
                  <Tooltip content={<ProTooltip />} />

                  <Area type="monotone" dataKey="PURCHASE" stroke={COLORS.PURCHASE} fill="url(#gPurchase)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area type="monotone" dataKey="PAYMENT" stroke={COLORS.PAYMENT} fill="url(#gPayment)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area type="monotone" dataKey="PURCHASE_RETURN" stroke={COLORS.PURCHASE_RETURN} fill="url(#gPurchaseReturn)" strokeWidth={2.4} dot={false} isAnimationActive />
                  <Area
  type="monotone"
  dataKey="JOURNAL_DR"
  stroke={COLORS.JOURNAL}
  fill="url(#gJournalDr)"
  strokeWidth={2.4}
  dot={false}
  isAnimationActive
/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <div className="text-sm sm:text-base font-bold text-slate-900">
              Sales Split
            </div>
            <div className="text-xs text-slate-500 mb-3 mt-1">
              SALE • RECEIPT • SALES RETURN • JOURNAL CR
            </div>

            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesPieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={105} isAnimationActive>
                    {salesPieData.map((d, idx) => (
                      <Cell key={idx} fill={sliceColor(d)} />
                    ))}
                  </Pie>
                  <Tooltip content={<PctTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <div className="text-sm sm:text-base font-bold text-slate-900">
              Purchase Split
            </div>
            <div className="text-xs text-slate-500 mb-3 mt-1">
              PURCHASE • PAYMENT • PURCHASE RETURN
            </div>

            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={purchasePieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={105} isAnimationActive>
                    {purchasePieData.map((d, idx) => (
                      <Cell key={idx} fill={sliceColor(d)} />
                    ))}
                  </Pie>
                  <Tooltip content={<PctTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center">
        Thank you for choosing SERVICE INDIA. Need help? Contact support from your company.
      </div>
    </div>
  );
}

function DashboardLoader({ progress = 0 }) {
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
            Loading Dashboard
          </div>

          <div className="mt-1 text-sm text-slate-500">
            Please wait while we prepare your account insights
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

/* ========================= Fetch Helpers ========================= */

async function fetchDashboardSafe() {
  return api.dashboard();
}

async function fetchTransactionsSafe(from, to) {
  return api.transactions({ from, to });
}
async function fetchLifetimeTransactionsSafe() {
  return api.transactions({});
}
/* ========================= Data Helpers ========================= */

function normalizeTxnResponse(res) {
  const rows =
    (Array.isArray(res) && res) ||
    res?.rows ||
    res?.data ||
    res?.items ||
    res?.transactions ||
    res?.result ||
    [];

  return (rows || []).map((r) => {
    const debit = toNum(r?.debit ?? r?.dr ?? 0);
    const credit = toNum(r?.credit ?? r?.cr ?? 0);

    const inferredAmount =
      debit > 0 ? debit : credit > 0 ? credit : toNum(r?.amount ?? r?.net ?? r?.value ?? r?.amt ?? 0);

    const inferredDrCr =
      r?.drcr ||
      r?.DrCr ||
      r?.dc ||
      r?.side ||
      (debit > 0 ? "DR" : credit > 0 ? "CR" : "");

    return {
      ...r,
      type: r?.type ?? r?.voucherType ?? r?.voucher_type ?? r?.vType ?? r?.voucher ?? "",
      voucherType: r?.voucherType ?? r?.type ?? "",
      amount: inferredAmount,
      drcr: String(inferredDrCr || "").toUpperCase(),
      debit,
      credit,
      date: r?.date ?? r?.txnDate ?? r?.transactionDate ?? r?.voucherDate ?? r?.createdAt ?? "",
    };
  });
}

function getDefaultFinancialYearRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const fyStartYear = month >= 3 ? year : year - 1;

  return {
    from: `${fyStartYear}-04-01`,
    to: todayYMD(),
  };
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtHumanDate(v) {
  if (!v) return "";
  const d = parseAnyDate(v);
  if (!d) return v;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseAnyDate(input) {
  if (!input) return null;

  if (input instanceof Date) {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "number") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const raw = String(input).trim();
  if (!raw) return null;

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  m = raw.match(/^(\d{1,2})[- ]([A-Za-z]{3,})[- ](\d{4})$/);
  if (m) {
    const [, dd, mon, yyyy] = m;
    const monthNames = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
      may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8,
      sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
    };
    const idx = monthNames[String(mon).toLowerCase()];
    if (idx !== undefined) {
      const d = new Date(Number(yyyy), idx, Number(dd));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
}

function parseRowDate(row) {
  const raw =
    row?.date ??
    row?.txnDate ??
    row?.transactionDate ??
    row?.voucherDate ??
    row?.invoiceDate ??
    row?.createdAt ??
    row?.updatedAt ??
    null;

  return parseAnyDate(raw);
}

function isRowInPeriod(row, from, to) {
  const dt = parseRowDate(row);
  if (!dt) return false;

  const start = parseAnyDate(from);
  const end = parseAnyDate(to);
  if (!start || !end) return false;

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return dt >= start && dt <= end;
}

function getTxnType(r) {
  return String(
    r?.type ?? r?.voucherType ?? r?.voucher_type ?? r?.vType ?? r?.voucher ?? ""
  ).toUpperCase();
}

function toNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toAmount(r) {
  const debit = toNum(r?.debit ?? r?.dr ?? 0);
  const credit = toNum(r?.credit ?? r?.cr ?? 0);

  if (debit > 0) return debit;
  if (credit > 0) return credit;

  const v = r?.amount ?? r?.net ?? r?.value ?? r?.amt ?? r?.total ?? r?.grandTotal ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

function buildTrendFromRows(rows, from, to) {
  const start = parseAnyDate(from);
  const end = parseAnyDate(to);

  if (!start || !end || start > end) return [];

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const buckets = [];
  const map = new Map();

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const obj = {
      key,
      month: cursor.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
      SALE: 0,
      RECEIPT: 0,
      SALES_RETURN: 0,
      JOURNAL_DR: 0,
      JOURNAL_CR: 0,
      PURCHASE: 0,
      PAYMENT: 0,
      PURCHASE_RETURN: 0,
    };
    buckets.push(obj);
    map.set(key, obj);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const r of rows || []) {
    const dt = parseRowDate(r);
    if (!dt) continue;

    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const bucket = map.get(key);
    if (!bucket) continue;

    const type = getTxnType(r);
    const amount = toAmount(r);

    if (type === "SALE") bucket.SALE += amount;
    else if (type === "RECEIPT") bucket.RECEIPT += amount;
    else if (type === "SALES_RETURN") bucket.SALES_RETURN += amount;
    else if (type === "JOURNAL_DR") bucket.JOURNAL_DR += amount;
    else if (type === "JOURNAL_CR") bucket.JOURNAL_CR += amount;
    else if (type === "PURCHASE") bucket.PURCHASE += amount;
    else if (type === "PAYMENT") bucket.PAYMENT += amount;
    else if (type === "PURCHASE_RETURN") bucket.PURCHASE_RETURN += amount;
    else if (type === "JOURNAL") {
      const side = String(
        r?.side ?? r?.dc ?? r?.drcr ?? r?.DrCr ?? r?.dcFlag ?? ""
      ).toUpperCase();

      if (side === "DR" || side === "DEBIT") bucket.JOURNAL_DR += amount;
      else if (side === "CR" || side === "CREDIT") bucket.JOURNAL_CR += amount;
    }
  }

  return buckets;
}

function fmtCompactINR(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(Math.round(n));
}

function prettyKey(k) {
  return String(k || "").replaceAll("_", " ").toUpperCase();
}

function LegendDot({ label, color }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </span>
  );
}

function ProTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const rows = payload
    .filter((p) => Number(p?.value || 0) !== 0)
    .map((p) => ({
      name: p.dataKey,
      value: Number(p.value || 0),
      color: p.stroke,
    }));

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
        {label}
      </div>
      <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
        {rows.length ? (
          rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: r.color,
                  }}
                />
                <span style={{ fontSize: 12, color: "#334155" }}>
                  {prettyKey(r.name)}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                {r.value.toLocaleString("en-IN")}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: "#64748b" }}>No movement</div>
        )}
      </div>
    </div>
  );
}

function buildVoucherPie(items, COLORS) {
  const clean = (items || [])
    .map((x) => {
      const raw = Number(x.value || 0);
      const neg = raw < 0;
      const v = Math.abs(raw);
      return {
        name: x.label,
        value: v,
        key: x.key,
        neg,
      };
    })
    .filter((x) => x.value > 0);

  if (!clean.length) {
    return [{ name: "No Data", value: 1, key: "NONE", neg: false, __total: 1 }];
  }

  const total = clean.reduce((s, x) => s + Number(x.value || 0), 0) || 1;
  return clean.map((x) => ({ ...x, __total: total, __COLORS: COLORS }));
}

function sliceColor(d) {
  const C = d?.__COLORS || COLORS;
  if (d?.neg) return C.YELLOW_NEG;
  if (d?.key === "SALE") return C.SALE;
  if (d?.key === "RECEIPT") return C.RECEIPT;
  if (d?.key === "SALES_RETURN") return C.SALES_RETURN;
  if (d?.key === "PURCHASE") return C.PURCHASE;
  if (d?.key === "PAYMENT") return C.PAYMENT;
  if (d?.key === "PURCHASE_RETURN") return C.PURCHASE_RETURN;
  if (d?.key === "JOURNAL_CR") return C.JOURNAL;
  if (d?.key === "JOURNAL_DR") return C.JOURNAL;
  return C.JOURNAL;
}

function Kpi({
  title,
  status,
  value,
  hint,
  className = "",
  valueClassName = "",
  statusClassName = "",
}) {
  const isTextValue = typeof value === "string";
  const displayValue = isTextValue
    ? value
    : Number(value || 0).toLocaleString("en-IN");

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="text-xs font-medium text-slate-500">{title}</div>

      {status ? (
        <div className={`mt-2 text-sm font-semibold ${statusClassName || "text-slate-700"}`}>
          {status}
        </div>
      ) : null}

      <div className={`text-xl font-bold mt-1 ${valueClassName}`}>
        {displayValue}
      </div>

      <div className="text-xs text-slate-400 mt-1">{hint}</div>
    </div>
  );
}

function PctTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = item?.name || item?.payload?.name || "";
  const val = Number(item?.value || 0);
  const total = Number(item?.payload?.__total || 0);
  const pct = total ? (val / total) * 100 : 0;
  const neg = Boolean(item?.payload?.neg);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
        {name} {neg ? "(negative)" : ""}
      </div>
      <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
        {val.toLocaleString("en-IN")} &nbsp;•&nbsp; {pct.toFixed(1)}%
      </div>
    </div>
  );
}