import React from "react";

export default function Shipping() {
  const lastUpdated = "February 27, 2026";

  return (
    <div className="legalPage">
      {/* Header */}
      <div className="legalHero">
        <div className="legalHeroInner">
          <div className="legalBadge">Legal</div>
          <h1 className="gradText">Shipping & Delivery Policy</h1>
          <p className="legalSub">
            This Shipping & Delivery Policy outlines dispatch, transport,
            delivery, and risk terms applicable to all transactions with
            STAR ENGINEERING.
          </p>
          <div className="legalMeta">Last Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="legalWrap">
        <div className="legalCard">

          <h2>1. Scope</h2>
          <p>
            This Shipping Policy applies to all products manufactured,
            supplied, fabricated, or traded by STAR ENGINEERING.
            By placing an order, the customer agrees to the terms outlined herein.
          </p>

          <h2>2. Order Processing Time</h2>
          <ul>
            <li>Processing begins only after written order confirmation.</li>
            <li>Production timelines vary depending on product type and quantity.</li>
            <li>Custom or fabricated items may require additional lead time.</li>
            <li>Estimated dispatch dates are indicative and not guaranteed unless confirmed in writing.</li>
          </ul>

          <h2>3. Mode of Dispatch</h2>
          <p>
            STAR ENGINEERING may dispatch goods through:
          </p>
          <ul>
            <li>Approved third-party transporters</li>
            <li>Courier services</li>
            <li>Logistics companies</li>
            <li>Customer-arranged pickup</li>
          </ul>
          <p>
            The mode of shipment is determined based on product type,
            delivery location, urgency, and mutual agreement.
          </p>

          <h2>4. Freight & Charges</h2>
          <ul>
            <li>Freight may be charged extra unless specified as inclusive.</li>
            <li>Loading, packing, forwarding, and insurance charges may apply.</li>
            <li>Any additional charges levied by transporter are payable by the customer.</li>
          </ul>

          <h2>5. Risk & Title Transfer</h2>
          <p>
            Unless otherwise agreed in writing, risk in the goods transfers
            to the buyer upon dispatch from STAR ENGINEERING’s premises.
          </p>
          <p>
            STAR ENGINEERING shall not be liable for:
          </p>
          <ul>
            <li>Transit damage</li>
            <li>Transport delays</li>
            <li>Loss after dispatch</li>
            <li>Handling issues by third-party carriers</li>
          </ul>

          <h2>6. Packaging</h2>
          <p>
            Products are packed using industry-standard methods suitable
            for transport. Special packaging requirements must be requested
            in writing prior to dispatch.
          </p>

          <h2>7. Delivery Timeline</h2>
          <p>
            Delivery times are estimates and subject to external factors including:
          </p>
          <ul>
            <li>Transport conditions</li>
            <li>Weather disruptions</li>
            <li>Regulatory or checkpoint delays</li>
            <li>Strikes or unforeseen circumstances</li>
          </ul>
          <p>
            Delays shall not constitute grounds for cancellation or penalty
            against STAR ENGINEERING.
          </p>

          <h2>8. Inspection & Claims</h2>
          <p>
            Customers must inspect goods immediately upon receipt.
            Any visible damage or shortage must be reported within 48 hours.
          </p>
          <p>
            Claims submitted after this period may not be entertained.
          </p>

          <h2>9. Partial Shipments</h2>
          <p>
            STAR ENGINEERING reserves the right to dispatch partial shipments
            where feasible. Each shipment shall be invoiced separately unless agreed otherwise.
          </p>

          <h2>10. Storage & Demurrage</h2>
          <p>
            If goods are ready for dispatch but delayed due to customer
            instructions or payment delays, STAR ENGINEERING reserves the right
            to:
          </p>
          <ul>
            <li>Charge storage fees</li>
            <li>Invoice goods as deemed delivered</li>
            <li>Reschedule dispatch at additional cost</li>
          </ul>

          <h2>11. International Shipping (Future Provision)</h2>
          <p>
            In case STAR ENGINEERING enables international supply,
            customers shall be responsible for:
          </p>
          <ul>
            <li>Custom duties</li>
            <li>Import/export compliance</li>
            <li>Local taxes and regulations</li>
          </ul>

          <h2>12. Force Majeure</h2>
          <p>
            STAR ENGINEERING shall not be liable for delays or non-performance
            arising from force majeure events including but not limited to
            natural disasters, strikes, governmental restrictions,
            pandemics, or supply chain disruptions.
          </p>

          <h2>13. Limitation of Liability</h2>
          <p>
            STAR ENGINEERING’s liability for shipping-related claims,
            if any, shall be limited strictly to the invoice value
            of the affected shipment.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            This Shipping Policy shall be governed by the laws of India.
            Disputes shall fall under the jurisdiction of courts in Mumbai, Maharashtra.
          </p>

          <h2>15. Contact Information</h2>
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

      <style>{`
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
          .gradText{
  background: linear-gradient(90deg, #ff2d2d, #7c3aed, #2563eb, #ff2d2d);
  background-size: 300% 300%;
  animation: starShift 10s ease-in-out infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;   /* ✅ important */
  color: transparent;
}
      `}</style>
    </div>
  );
}