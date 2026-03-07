import React from "react";

export default function RefundPolicy() {
  const lastUpdated = "March 06, 2026";

  return (
    <div className="legalPage">

      <div className="legalHero">
        <div className="legalHeroInner">
          <div className="legalBadge">Legal</div>
          <h1 className="gradText">Refund Policy</h1>

          <p className="legalSub">
            This Refund Policy explains when and how SERVICE INDIA issues refunds,
            credits, and adjustments for approved cases.
          </p>

          <div className="legalMeta">Last Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="legalWrap">
        <div className="legalCard">

          <h2>1. Scope</h2>
          <p>
            This Refund Policy applies to payments made to SERVICE INDIA for
            products, fabrication work, labour services, engineering services,
            and related transactions.
          </p>

          <p>
            Refunds are processed only if expressly approved in writing by
            SERVICE INDIA after verification.
          </p>

          <h2>2. Refund Eligibility</h2>

          <p>Refunds may be considered only in limited circumstances such as:</p>

          <ul>
            <li>Overpayment or duplicate payment confirmed by SERVICE INDIA.</li>

            <li>
              Order or work cancellation approved before fabrication,
              dispatch, or project execution begins.
            </li>

            <li>
              Material billing error or invoicing error acknowledged by
              SERVICE INDIA.
            </li>

            <li>
              Return of goods approved by SERVICE INDIA after inspection.
            </li>
          </ul>

          <h2>3. Non-Refundable Payments</h2>

          <p>Unless agreed in writing, the following payments are generally non-refundable:</p>

          <ul>
            <li>Advance payments for custom fabrication or project work once production begins.</li>

            <li>Labour charges once labour deployment has started.</li>

            <li>Transport, freight, packing, loading, unloading, or handling charges.</li>

            <li>Banking or transaction charges incurred during payment.</li>

            <li>Costs incurred due to customer-caused delays or site issues.</li>
          </ul>

          <h2>4. Current Payment Model</h2>

          <p>
            SERVICE INDIA currently accepts payments primarily through manual
            methods such as:
          </p>

          <ul>
            <li>Bank Transfer (NEFT / RTGS / IMPS)</li>
            <li>UPI</li>
            <li>Cheque</li>
            <li>Cash (subject to applicable legal limits)</li>
          </ul>

          <p>
            Approved refunds are typically processed via bank transfer to the
            customer’s verified bank account.
          </p>

          <h2>5. Future Online Payment Gateway</h2>

          <p>
            SERVICE INDIA may enable online payment gateways in the future.
            If activated, refund timelines may depend on the payment gateway
            provider and banking policies.
          </p>

          <p>
            SERVICE INDIA does not store sensitive card information such as
            full card numbers or CVV details.
          </p>

          <h2>6. Refund Request Procedure</h2>

          <p>Customers requesting a refund must provide:</p>

          <ul>
            <li>Invoice or receipt reference number</li>
            <li>Transaction reference / UTR / UPI ID</li>
            <li>Reason for refund request</li>
            <li>Supporting documents if applicable</li>
            <li>Customer bank details for refund credit</li>
          </ul>

          <p>
            SERVICE INDIA may request additional documentation for verification
            and reconciliation.
          </p>

          <h2>7. Verification & Approval</h2>

          <p>
            All refund requests are subject to internal verification,
            reconciliation of payments, and documentation review.
          </p>

          <p>
            SERVICE INDIA reserves the right to reject refund requests that do
            not meet policy requirements.
          </p>

          <h2>8. Refund Timelines</h2>

          <ul>
            <li>
              Approved refunds are generally processed within
              <b> 7–14 business days</b>.
            </li>

            <li>
              Timelines may vary depending on banking cycles,
              documentation verification, and reconciliation procedures.
            </li>
          </ul>

          <h2>9. Credits & Adjustments</h2>

          <p>
            In certain cases, SERVICE INDIA may issue a credit note,
            adjustment, or set-off against future invoices instead of
            a cash refund, especially for business-to-business transactions.
          </p>

          <h2>10. Fraud Prevention</h2>

          <p>
            SERVICE INDIA reserves the right to deny refund requests in
            cases involving suspected fraud, misinformation, misuse,
            or repeated abuse of refund policies.
          </p>

          <h2>11. Limitation of Liability</h2>

          <p>
            SERVICE INDIA’s liability related to refunds shall not exceed
            the amount actually received for the specific transaction and
            approved for refund.
          </p>

          <p>
            SERVICE INDIA shall not be responsible for indirect losses,
            project delays, or consequential damages arising from refund
            processing timelines.
          </p>

          <h2>12. Policy Updates</h2>

          <p>
            SERVICE INDIA may update this Refund Policy from time to time.
            Any changes will be published on this page with an updated
            “Last Updated” date.
          </p>

          <h2>13. Contact</h2>

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

.legalHero{padding:44px 16px 22px;}

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
#a67c1f 100%
);
background-size:240% 240%;
animation:shift 6s linear infinite;
-webkit-background-clip:text;
background-clip:text;
-webkit-text-fill-color:transparent;
}

@keyframes shift{
0%{background-position:0% 50%}
50%{background-position:100% 50%}
100%{background-position:0% 50%}
}

.legalMeta{margin-top:10px;font-size:12px;color:#64748b;}

.legalWrap{padding:0 16px 56px;}

.legalCard{
max-width:980px;
margin:0 auto;
background:rgba(255,255,255,.92);
border:1px solid rgba(15,23,42,.10);
border-radius:18px;
padding:22px;
box-shadow:0 12px 30px rgba(2,6,23,.06);
}

.legalCard h2{margin:18px 0 10px;font-size:18px}

.legalCard p{margin:8px 0;color:#334155;font-size:14px;line-height:1.7}

.legalCard ul{margin:8px 0 10px 18px;font-size:14px;line-height:1.7}

.legalContact{
margin-top:10px;
border:1px solid rgba(15,23,42,.10);
background:rgba(248,250,252,.72);
border-radius:14px;
padding:14px;
}

.legalContactRow{
display:flex;
gap:10px;
padding:6px 0;
border-bottom:1px dashed rgba(15,23,42,.10);
}

.legalContactRow:last-child{border-bottom:0}

.legalContactRow .k{width:110px;color:#64748b;font-size:13px}

.legalContactRow .v{flex:1;color:#0f172a;font-size:13.5px}

`;