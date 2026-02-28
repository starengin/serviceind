import React from "react";

export default function ReturnPolicy() {
  const lastUpdated = "February 27, 2026";

  return (
    <div className="legalPage">
      <div className="legalHero">
        <div className="legalHeroInner">
          <div className="legalBadge">Legal</div>
          <h1 className="gradText">Return Policy</h1>
          <p className="legalSub">
            This Return Policy sets out the conditions and process for returning
            products supplied by STAR ENGINEERING.
          </p>
          <div className="legalMeta">Last Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="legalWrap">
        <div className="legalCard">
          <h2>1. Scope</h2>
          <p>
            This Return Policy applies to all goods manufactured, fabricated,
            supplied, or traded by STAR ENGINEERING. Returns are accepted only
            under the terms below and only after written approval by STAR ENGINEERING.
          </p>

          <h2>2. Return Approval (Mandatory)</h2>
          <p>
            No product may be returned without a written Return Authorization
            from STAR ENGINEERING. Any shipment returned without authorization
            may be rejected, and the customer will bear all related costs.
          </p>

          <h2>3. Return Window</h2>
          <ul>
            <li>
              Return requests must be initiated within <b>48 hours</b> of delivery,
              unless a different period is stated in writing.
            </li>
            <li>
              The customer must notify STAR ENGINEERING in writing with invoice
              details, reason for return, and supporting evidence.
            </li>
          </ul>

          <h2>4. Eligibility Conditions</h2>
          <p>Returned goods must meet all of the following conditions:</p>
          <ul>
            <li>Unused, uninstalled, and in re-saleable condition (where applicable).</li>
            <li>In original packaging with labels, manuals, and accessories intact.</li>
            <li>Free from damage due to mishandling, improper storage, or misuse.</li>
            <li>Accompanied by invoice copy and approved Return Authorization.</li>
          </ul>

          <h2>5. Non-Returnable Items</h2>
          <p>The following are generally not eligible for return:</p>
          <ul>
            <li>
              <b>Customized / fabricated / made-to-order products</b> made as per
              customer specifications, drawings, or special requirements.
            </li>
            <li>Products cut-to-length, special finishes, or special assemblies.</li>
            <li>Items damaged due to misuse, incorrect installation, or negligence.</li>
            <li>Electrical/mechanical items damaged due to power issues or improper handling.</li>
            <li>Clearance/special discount items, unless agreed in writing.</li>
          </ul>

          <h2>6. Transit Damage / Shortage Claims</h2>
          <p>
            If goods are received in damaged condition or with shortage, the customer must:
          </p>
          <ul>
            <li>Record remarks on the delivery challan / transporter receipt (where possible).</li>
            <li>Share photos/videos of outer packaging and product condition.</li>
            <li>Notify STAR ENGINEERING within <b>48 hours</b> of delivery.</li>
          </ul>
          <p>
            Claims raised after this period may not be accepted. Transit damage
            is subject to transporter/goods insurance terms (if any).
          </p>

          <h2>7. Return Logistics & Packing Standards</h2>
          <ul>
            <li>Unless agreed in writing, return freight is borne by the customer.</li>
            <li>Customer must pack goods suitably to prevent damage in return transit.</li>
            <li>STAR ENGINEERING is not responsible for loss/damage during return shipment.</li>
            <li>
              If STAR ENGINEERING arranges pickup, related charges may be billed to the customer
              unless the return is accepted as STAR ENGINEERING’s responsibility in writing.
            </li>
          </ul>

          <h2>8. Inspection & Disposition</h2>
          <p>
            All returned items are subject to inspection by STAR ENGINEERING.
            Based on inspection, STAR ENGINEERING may:
          </p>
          <ul>
            <li>Accept the return for replacement/credit (as applicable).</li>
            <li>Reject the return if conditions are not met.</li>
            <li>Apply a restocking/handling fee where applicable.</li>
            <li>Offer partial acceptance if only part of shipment qualifies.</li>
          </ul>

          <h2>9. Restocking / Handling Fees</h2>
          <p>
            Where permitted, STAR ENGINEERING may apply a restocking or handling fee
            based on product category, packaging condition, and inspection outcome.
            Any such fee will be communicated during approval.
          </p>

          <h2>10. Replacement</h2>
          <p>
            If replacement is approved, STAR ENGINEERING will dispatch replacement goods
            as per production/stock availability. Dispatch timelines are indicative unless
            committed in writing.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            STAR ENGINEERING’s liability related to returns (if any) shall be limited
            to the invoice value of the goods approved for return. STAR ENGINEERING
            shall not be liable for indirect or consequential losses.
          </p>

          <h2>12. Amendments</h2>
          <p>
            STAR ENGINEERING may modify this Return Policy at any time. The updated
            version will be posted with a revised “Last Updated” date.
          </p>

          <h2>13. Contact Information</h2>
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
              <span className="v">+91-7045276723</span>
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
  background: linear-gradient(145deg, #ffffff 0%, #f7f8ff 50%, #ffffff 100%);
  min-height:100vh;
  color:#0f172a;
}
.legalHero{ padding:44px 16px 22px; }
.legalHeroInner{
  max-width:980px;
  margin:0 auto;
  padding:22px;
  border-radius:18px;
  background:#ffffff;
  border:1px solid rgba(15,23,42,0.10);
  box-shadow:0 12px 30px rgba(2,6,23,0.06);
}
.legalBadge{
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(43,103,246,0.10);
  display:inline-block;
  margin-bottom:10px;
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
.legalTitle{ margin:0; font-size:32px; }
.legalSub{ margin-top:8px; color:#475569; }
.legalMeta{ margin-top:8px; font-size:13px; color:#64748b; }
.legalWrap{ padding:0 16px 56px; }
.legalCard{
  max-width:980px;
  margin:0 auto;
  background:#ffffff;
  border:1px solid rgba(15,23,42,0.10);
  border-radius:18px;
  padding:22px;
  box-shadow:0 12px 30px rgba(2,6,23,0.06);
}
.legalCard h2{ margin:18px 0 10px; font-size:18px; }
.legalCard p, .legalCard ul{
  font-size:14px;
  line-height:1.7;
  color:#334155;
}
.legalContact{
  margin-top:14px;
  border:1px solid rgba(15,23,42,0.10);
  border-radius:12px;
  padding:14px;
  background:#f8fafc;
}
.legalContactRow{ display:flex; gap:10px; padding:6px 0; }
.legalContactRow .k{ width:110px; color:#64748b; font-size:13px; }
.legalContactRow .v{ flex:1; font-size:13.5px; }
@media (max-width:520px){
  .legalTitle{ font-size:26px; }
  .legalHeroInner, .legalCard{ padding:16px; }
  .legalContactRow{ flex-direction:column; gap:4px; }
  .legalContactRow .k{ width:auto; }
}
`;