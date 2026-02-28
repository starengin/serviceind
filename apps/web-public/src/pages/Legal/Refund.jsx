import React from "react";

export default function RefundPolicy() {
  const lastUpdated = "February 27, 2026";

  return (
    <div className="legalPage">
      <div className="legalHero">
        <div className="legalHeroInner">
          <div className="legalBadge">Legal</div>
          <h1 className="gradText">Refund Policy</h1>
          <p className="legalSub">
            This Refund Policy explains when and how STAR ENGINEERING issues refunds,
            credits, and adjustments for approved cases.
          </p>
          <div className="legalMeta">Last Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="legalWrap">
        <div className="legalCard">
          <h2>1. Scope</h2>
          <p>
            This Refund Policy applies to payments made to STAR ENGINEERING for
            products and services. Refunds are processed only if expressly approved
            in writing by STAR ENGINEERING.
          </p>

          <h2>2. Refund Eligibility (High-Level)</h2>
          <p>Refunds may be considered only in limited circumstances, such as:</p>
          <ul>
            <li>Overpayment or duplicate payment confirmed by STAR ENGINEERING.</li>
            <li>Order cancellation approved before dispatch/production (where applicable).</li>
            <li>Return of goods accepted as per STAR ENGINEERING Return Policy.</li>
            <li>Material error in invoicing recognized and accepted by STAR ENGINEERING.</li>
          </ul>

          <h2>3. Non-Refundable Amounts</h2>
          <p>Unless agreed in writing, the following may be non-refundable:</p>
          <ul>
            <li>Advance payments for custom fabrication after production begins.</li>
            <li>Transport, freight, handling, packing, forwarding, and insurance charges.</li>
            <li>Banking fees, payment processing fees (if applicable in future).</li>
            <li>Any charges incurred due to customer-caused dispatch or delivery delays.</li>
          </ul>

          <h2>4. Manual Payment Model (Current)</h2>
          <p>
            STAR ENGINEERING currently accepts payments primarily via manual methods such as
            bank transfer (NEFT/RTGS/IMPS), UPI, cheque, or cash (subject to legal limits).
          </p>
          <p>
            Therefore, approved refunds are generally processed by bank transfer to the
            customer’s verified bank account.
          </p>

          <h2>5. Future Gateway Provision</h2>
          <p>
            STAR ENGINEERING may enable online payment gateways in the future.
            If enabled, refund timelines and procedures may be impacted by the
            payment provider/bank policies. STAR ENGINEERING does not store full
            card details (such as complete card number or CVV).
          </p>

          <h2>6. Refund Request Procedure</h2>
          <p>To request a refund, customers must provide:</p>
          <ul>
            <li>Invoice number / receipt reference</li>
            <li>Transaction reference/UTR/UPI ID (if applicable)</li>
            <li>Reason for refund request with supporting documents</li>
            <li>Customer bank details for refund credit (account name, bank, IFSC, account number)</li>
          </ul>
          <p>
            STAR ENGINEERING may request additional documents for verification and compliance.
          </p>

          <h2>7. Verification & Approval</h2>
          <p>
            All refund requests are subject to internal verification, reconciliation,
            inspection (if linked to a return), and compliance checks.
            STAR ENGINEERING reserves the right to reject refund requests that
            do not meet policy requirements.
          </p>

          <h2>8. Refund Timelines</h2>
          <ul>
            <li>
              After approval, refunds are typically processed within <b>7–14 business days</b>.
            </li>
            <li>
              Timelines may vary depending on banking cycles, documentation delays,
              verification complexity, and statutory requirements.
            </li>
          </ul>

          <h2>9. Credits / Adjustments</h2>
          <p>
            In some cases, STAR ENGINEERING may provide an adjustment, credit note,
            or set-off against future invoices instead of a cash refund, especially
            for B2B transactions, subject to mutual agreement and applicable law.
          </p>

          <h2>10. Fraud Prevention</h2>
          <p>
            STAR ENGINEERING reserves the right to deny refunds in cases involving
            suspected fraud, misinformation, misuse, or repeated policy abuse.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            STAR ENGINEERING’s liability related to refunds shall not exceed the
            amount actually received for the specific transaction and approved for refund.
            STAR ENGINEERING shall not be liable for indirect or consequential losses.
          </p>

          <h2>12. Amendments</h2>
          <p>
            STAR ENGINEERING may update this Refund Policy at any time.
            Updates will be posted with a revised “Last Updated” date.
          </p>

          <h2>13. Contact</h2>
          <div className="legalContact">
            <div className="legalContactRow">
              <span className="k">Company:</span>
              <span className="v">STAR ENGINEERING</span>
            </div>
            <div className="legalContactRow">
              <span className="k">Email:</span>
              <span className="v">corporate@stareng.co.in</span>
            </div>
            <div className="legalContactRow">
              <span className="k">Phone:</span>
              <span className="v">+91-9702485922</span>
            </div>
            <div className="legalContactRow">
              <span className="k">Address:</span>
              <span className="v">Shop No. 5, Chunawala Compound, Opp. BEST Depot / Kanakia Zillion, LBS Marg, Kurla (W), Mumbai - 400070, Maharashtra.</span>
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
            radial-gradient(900px 420px at 15% 0%, rgba(255,0,102,0.10), transparent 60%),
            radial-gradient(760px 380px at 95% 18%, rgba(0,102,255,0.10), transparent 55%),
            radial-gradient(920px 520px at 80% 110%, rgba(255,170,0,0.10), transparent 60%),
            radial-gradient(820px 420px at 52% 105%, rgba(163,0,255,0.08), transparent 65%),
            linear-gradient(145deg, #ffffff 0%, #f7f8ff 50%, #ffffff 100%);
          min-height: 100vh;
          color: #0f172a;
        }
        .legalHero{ padding: 44px 16px 22px; }
        .legalHeroInner{
          max-width: 980px;
          margin: 0 auto;
          padding: 22px;
          border-radius: 18px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(15,23,42,0.10);
          box-shadow: 0 12px 30px rgba(2,6,23,0.06);
        }
        .legalBadge{
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: .2px;
          color: #1e293b;
          background: rgba(43,103,246,0.10);
          border: 1px solid rgba(43,103,246,0.18);
          margin-bottom: 10px;
        }
          .gradText{
  background: linear-gradient(90deg, #ff2d2d, #7c3aed, #2563eb, #ff2d2d);
  background-size: 300% 300%;
  animation: starShift 10s ease-in-out infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;   /* ✅ important */
  color: transparent;
}
        .legalTitle{
          margin: 0;
          font-size: 32px;
          line-height: 1.15;
          letter-spacing: -0.4px;
        }
        .legalSub{
          margin: 10px 0 0;
          color: #475569;
          font-size: 14.5px;
          max-width: 780px;
        }
        .legalMeta{
          margin-top: 10px;
          font-size: 12.5px;
          color: #64748b;
        }
        .legalWrap{ padding: 0 16px 56px; }
        .legalCard{
          max-width: 980px;
          margin: 0 auto;
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 12px 30px rgba(2,6,23,0.06);
        }
        .legalCard h2{ margin: 18px 0 10px; font-size: 18px; letter-spacing: -0.2px; }
        .legalCard h3{ margin: 12px 0 8px; font-size: 15px; }
        .legalCard p{ margin: 8px 0; color: #334155; font-size: 14px; line-height: 1.7; }
        .legalCard ul{ margin: 8px 0 10px 18px; color: #334155; font-size: 14px; line-height: 1.7; }
        .legalContact{
          margin-top: 10px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(248,250,252,0.70);
          border-radius: 14px;
          padding: 14px;
        }
        .legalContactRow{
          display:flex;
          gap: 10px;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(15,23,42,0.10);
        }
        .legalContactRow:last-child{ border-bottom: 0; }
        .legalContactRow .k{ width: 110px; color:#64748b; font-size: 13px; }
        .legalContactRow .v{ flex:1; color:#0f172a; font-size: 13.5px; }
        .legalNote{ margin-top: 10px; color: #64748b; font-size: 13px; }

        @media (max-width: 520px){
          .legalTitle{ font-size: 26px; }
          .legalHeroInner, .legalCard{ padding: 16px; }
          .legalContactRow{ flex-direction: column; gap: 4px; }
          .legalContactRow .k{ width: auto; }
        }
`;