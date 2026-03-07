import React from "react";

export default function CancellationPolicy() {
  const lastUpdated = "March 06, 2026";

  return (
    <div className="legalPage">
      <div className="legalHero">
        <div className="legalHeroInner">
          <div className="legalBadge">Legal</div>
          <h1 className="gradText">Cancellation Policy</h1>
          <p className="legalSub">
            This Cancellation Policy sets out the conditions, limits, and process
            for cancellation of orders, fabrication work, labour deployment,
            project execution, and related transactions with SERVICE INDIA.
          </p>
          <div className="legalMeta">Last Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="legalWrap">
        <div className="legalCard">
          <h2>1. Scope</h2>
          <p>
            This Cancellation Policy applies to goods, fabrication work, labour
            services, installation work, repair work, dismantling work, and
            related engineering or industrial services provided by SERVICE INDIA.
          </p>
          <p>
            Cancellation is subject to approval by SERVICE INDIA and depends on
            the stage of work, material allocation, labour commitment, and
            practical business impact.
          </p>

          <h2>2. Cancellation Request</h2>
          <p>
            Any cancellation request should be made as early as possible in
            writing by email, message, or other accepted business communication.
          </p>
          <p>
            A cancellation request is not treated as approved unless expressly
            confirmed by SERVICE INDIA.
          </p>

          <h2>3. When Cancellation May Be Considered</h2>
          <p>Cancellation may be considered in limited cases such as:</p>
          <ul>
            <li>Order cancellation before material procurement or cutting begins.</li>
            <li>Work cancellation before labour deployment or fabrication planning starts.</li>
            <li>Project hold or customer-side change requested before execution commitment.</li>
            <li>Duplicate order or mistaken confirmation identified quickly and verified.</li>
          </ul>

          <h2>4. Non-Cancellable Situations</h2>
          <p>The following are generally non-cancellable once initiated:</p>
          <ul>
            <li>Custom fabrication based on drawing, measurement, or special requirement.</li>
            <li>Orders where material has already been cut, processed, packed, or reserved.</li>
            <li>Jobs where labour, transport, equipment, or site scheduling has already been arranged.</li>
            <li>Site work, installation, dismantling, repair, or modification after execution begins.</li>
            <li>Urgent or specially committed jobs where SERVICE INDIA has already incurred cost.</li>
          </ul>

          <h2>5. Cancellation Charges</h2>
          <p>
            Even if cancellation is approved, SERVICE INDIA may recover charges
            already incurred up to the date of cancellation.
          </p>
          <ul>
            <li>Material procurement or reservation cost</li>
            <li>Cutting, fabrication, processing, or packing charges</li>
            <li>Labour booking or deployment charges</li>
            <li>Transport, loading, unloading, or site visit expenses</li>
            <li>Administrative or handling charges where applicable</li>
          </ul>

          <h2>6. Advance Payments</h2>
          <p>
            Advance payments are generally non-refundable once production,
            fabrication, procurement, or labour deployment has started.
          </p>
          <p>
            Where cancellation is approved before work begins, refund or
            adjustment, if any, shall be subject to deduction of actual costs
            already incurred.
          </p>

          <h2>7. Customer Delay / Hold / Site Issues</h2>
          <p>
            If work is delayed, postponed, or put on hold due to customer-side
            issues such as payment delay, site not ready, measurement pending,
            approval delay, or coordination issues, SERVICE INDIA may treat such
            situation separately from cancellation.
          </p>
          <p>
            In such cases, SERVICE INDIA may:
          </p>
          <ul>
            <li>Pause execution until conditions are resolved</li>
            <li>Apply storage, waiting, or re-scheduling charges</li>
            <li>Raise invoice for completed or committed stages</li>
            <li>Re-plan execution subject to revised cost or timeline</li>
          </ul>

          <h2>8. Partial Cancellation</h2>
          <p>
            SERVICE INDIA may, at its discretion, permit partial cancellation of
            quantity, scope, or execution stage where practical. Any approved
            partial cancellation may still attract proportionate charges or
            adjustment.
          </p>

          <h2>9. Adjustment Instead of Refund</h2>
          <p>
            In some business cases, SERVICE INDIA may offer commercial
            adjustment, credit note, or set-off against future work/orders
            instead of direct refund.
          </p>

          <h2>10. Verification & Approval</h2>
          <p>
            All cancellation requests are subject to internal review, material
            check, labour status check, commercial review, and management
            approval wherever necessary.
          </p>
          <p>
            SERVICE INDIA reserves the right to reject any cancellation request
            that does not meet policy conditions.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            SERVICE INDIA’s liability relating to cancellation, if any, shall be
            limited to the amount approved after deducting all applicable
            charges, actual costs, and committed expenses.
          </p>
          <p>
            SERVICE INDIA shall not be liable for indirect losses, delay claims,
            production loss, or consequential damages arising from cancellation.
          </p>

          <h2>12. Policy Updates</h2>
          <p>
            SERVICE INDIA may update this Cancellation Policy from time to time.
            Any revised version will be published with an updated “Last Updated”
            date.
          </p>

          <h2>13. Contact Information</h2>
          <div className="legalContact">
            <div className="legalContactRow">
              <span className="k">Company:</span>
              <span className="v">SERVICE INDIA</span>
            </div>
            <div className="legalContactRow">
              <span className="k">Email:</span>
              <span className="v">corporate@serviceind.co.in</span>
            </div>
            <div className="legalContactRow">
              <span className="k">Phone:</span>
              <span className="v">+91-9702485922</span>
            </div>
          </div>
        </div>
      </div>

      <style>{legalStyles}</style>
    </div>
  );
}

const legalStyles = `
.legalPage{
  font-family: Arial, Helvetica, sans-serif;
  background:
    radial-gradient(900px 420px at 12% 8%, rgba(31,127,232,.10), transparent 60%),
    radial-gradient(760px 380px at 92% 14%, rgba(20,87,184,.10), transparent 55%),
    radial-gradient(920px 520px at 84% 108%, rgba(166,124,31,.10), transparent 60%),
    linear-gradient(145deg,#ffffff 0%,#f6f8fc 55%,#fffaf2 100%);
  min-height:100vh;
  color:#0f172a;
}
.legalHero{ padding:44px 16px 22px; }
.legalHeroInner{
  max-width:980px;
  margin:0 auto;
  padding:22px;
  border-radius:18px;
  background:rgba(255,255,255,.78);
  border:1px solid rgba(15,23,42,.10);
  box-shadow:0 12px 30px rgba(2,6,23,.06);
}
.legalBadge{
  display:inline-flex;
  align-items:center;
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  background:rgba(30,111,216,.10);
  border:1px solid rgba(30,111,216,.18);
  margin-bottom:10px;
}
.gradText{
  background-image:linear-gradient(
    90deg,
    #1e6fd8 0%,
    #1457b8 35%,
    #0f4c81 65%,
    #a67c1f 100%
  );
  background-size:240% 240%;
  animation:shift 6s linear infinite;
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  color:transparent;
}
@keyframes shift{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
.legalSub{
  margin:10px 0 0;
  color:#475569;
  font-size:14.5px;
  max-width:780px;
}
.legalMeta{
  margin-top:10px;
  font-size:12.5px;
  color:#64748b;
}
.legalWrap{ padding:0 16px 56px; }
.legalCard{
  max-width:980px;
  margin:0 auto;
  background:rgba(255,255,255,.92);
  border:1px solid rgba(15,23,42,.10);
  border-radius:18px;
  padding:22px;
  box-shadow:0 12px 30px rgba(2,6,23,.06);
}
.legalCard h2{
  margin:18px 0 10px;
  font-size:18px;
}
.legalCard p, .legalCard ul{
  font-size:14px;
  line-height:1.7;
  color:#334155;
}
.legalContact{
  margin-top:14px;
  border:1px solid rgba(15,23,42,.10);
  border-radius:12px;
  padding:14px;
  background:#f8fafc;
}
.legalContactRow{
  display:flex;
  gap:10px;
  padding:6px 0;
  border-bottom:1px dashed rgba(15,23,42,.10);
}
.legalContactRow:last-child{ border-bottom:0; }
.legalContactRow .k{ width:110px; color:#64748b; font-size:13px; }
.legalContactRow .v{ flex:1; font-size:13.5px; color:#0f172a; }

@media (max-width:520px){
  .legalHeroInner, .legalCard{ padding:16px; }
  .legalContactRow{ flex-direction:column; gap:4px; }
  .legalContactRow .k{ width:auto; }
}
`;