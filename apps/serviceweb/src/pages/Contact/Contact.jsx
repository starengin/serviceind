import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";

const CTA_TEXT = "Send Requirement →";

const WORK_TYPES = [
  { key: "ALL", label: "All / Not sure" },
  { key: "FABRICATION", label: "Fabrication Work" },
  { key: "INSTALLATION", label: "Installation Work" },
  { key: "ERECTION", label: "Erection / Site Work" },
  { key: "ROOFING", label: "Roofing / Cladding" },
  { key: "REPAIR", label: "Repair / Retrofit" },
  { key: "PIPE", label: "Pipe / Support Work" },
  { key: "CUSTOM", label: "Custom Job Work" },
];

const WHATSAPP_NUMBER = "919702485922"; // without +
const DEFAULT_SUBJECT = "SERVICE INDIA – Work Requirement Enquiry";

const API =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://api.serviceind.co.in");

async function sendRequirement(payload) {
  const res = await fetch(`${API}/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed");
  return data;
}

function cleanPhone(v) {
  return String(v || "")
    .replace(/[^\d+]/g, "")
    .replace(/^00/, "+")
    .trim();
}

function isValidEmail(v) {
  const s = String(v || "").trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function buildWhatsAppMessage(payload) {
  const workLabel =
    WORK_TYPES.find((m) => m.key === payload.workType)?.label || payload.workType;

  const company = payload.company ? payload.company : "your company";

  return (
    `Hello SERVICE INDIA Team, I am ${payload.name} from ${company}. ` +
    `I would like to enquire regarding ${workLabel} at ${payload.city}. ` +
    `Requirement details: ${payload.details}. ` +
    `Kindly share feasibility, timeline and your best quotation at the earliest. ` +
    `You may contact me on ${payload.phone}${payload.email ? ` or email me at ${payload.email}` : ""}. ` +
    `Regards, ${company}`
  );
}

export default function Contact() {
  const loc = useLocation();
  const preSubject = loc?.state?.subject ? String(loc.state.subject) : "";

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    workType: "ALL",
    details: "",
    subject: preSubject || DEFAULT_SUBJECT,
    preferred: "Call",
  });

  const canSend = useMemo(() => {
    const nameOk = String(form.name).trim().length >= 2;
    const phoneOk = cleanPhone(form.phone).replace(/\D/g, "").length >= 10;
    const cityOk = String(form.city).trim().length >= 2;
    const detailsOk = String(form.details).trim().length >= 10;
    const emailOk = isValidEmail(form.email);
    return nameOk && phoneOk && cityOk && detailsOk && emailOk;
  }, [form]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!canSend) {
      setErr("Please fill required fields properly (Name, Phone, City, Details).");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        phone: String(form.phone || "").replace(/\D/g, ""),
        email: form.email.trim(),
        city: form.city.trim(),
        workType: form.workType,
        details: form.details.trim(),
        subject: (form.subject || DEFAULT_SUBJECT).trim(),
        preferred: form.preferred,
        page: window.location.href,
      };

      await sendRequirement(payload);

      const to = "corporate@serviceind.co.in";
      const subject =
        `${payload.subject}` +
        ` | ${payload.name}` +
        (payload.city ? ` - ${payload.city}` : "");

      const workLabel =
        WORK_TYPES.find((m) => m.key === payload.workType)?.label || payload.workType;

      const body =
        `Hello SERVICE INDIA Team,\n\n` +
        `Name: ${payload.name}\n` +
        `Company: ${payload.company || "-"}\n` +
        `Phone: ${payload.phone}\n` +
        `Email: ${payload.email || "-"}\n` +
        `City / Location: ${payload.city}\n` +
        `Work Type: ${workLabel}\n` +
        `Preferred Contact: ${payload.preferred}\n\n` +
        `Requirement Details:\n${payload.details}\n\n` +
        `Page: ${payload.page}\n`;

      const mailtoUrl =
        `mailto:${encodeURIComponent(to)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      const waText = buildWhatsAppMessage(payload);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

      setSent(true);

      window.location.href = mailtoUrl;
      setTimeout(() => {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }, 300);
    } catch (e2) {
      setErr(e2?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 18, paddingBottom: 40 }}>
      <div className="contactHero">
        <div className="heroBadge" style={{ marginBottom: 10 }}>
          <span className="dot" />
          SERVICE INDIA • Requirement / Work Enquiry
        </div>

        <h1 className="h1">
          Let’s discuss your <span className="gradText">requirement</span>
        </h1>

        <p className="sub">
          Submit your details and work requirement. We will respond with feasibility,
          execution approach and quotation. <b>For urgent support, please call directly.</b>
        </p>
      </div>

      {sent ? (
        <div className="contactThanks card">
          <div className="thanksTop">
            <div className="thanksTick">✉</div>
            <div>
              <div className="h2" style={{ marginBottom: 6 }}>
                Your message draft is ready.
              </div>
              <div className="sub">
                Please complete the process in your email or WhatsApp window to send the enquiry.
                If it didn’t open, use one of the options below.
              </div>
            </div>
          </div>

          <div className="thanksActions">
            <a
              className="btn"
              href="mailto:corporate@serviceind.co.in"
            >
              Open Email Again →
            </a>

            <a
              className="btnGhost"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(form))}`}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp →
            </a>

            <a className="btnGhost" href="tel:+919702485922">
              Call Now →
            </a>
          </div>
        </div>
      ) : (
        <div className="contactGrid">
          <div className="card contactInfo">
            <div className="h2" style={{ marginBottom: 10 }}>SERVICE INDIA</div>

            <div className="infoRow">
              <div className="infoLabel">Phone</div>
              <div className="infoVal">
                <a className="link" href="tel:+919702485922">+91 9702485922</a>
              </div>
            </div>

            <div className="infoRow">
              <div className="infoLabel">Email</div>
              <div className="infoVal">
                <a className="link" href="mailto:corporate@serviceind.co.in">
                  corporate@serviceind.co.in
                </a>
              </div>
            </div>

            <div className="infoRow">
              <div className="infoLabel">Business Type</div>
              <div className="infoVal">
                Fabrication, installation, repair, roofing, railing, structure and custom industrial work support.
              </div>
            </div>

            <div className="infoRow">
              <div className="infoLabel">Working Hours</div>
              <div className="infoVal">10:00 am to 5:00 pm</div>
            </div>

            <div className="infoRow" style={{ borderBottom: "0" }}>
              <div className="infoLabel">Quick Note</div>
              <div className="infoVal">
                For privacy reasons, location visits are coordinated only after requirement discussion.
              </div>
            </div>

            <div className="infoActions">
              <a className="btn" href="tel:+919702485922">Call Now →</a>
              <a
                className="btnGhost"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp →
              </a>
              <a className="btnGhost" href="mailto:corporate@serviceind.co.in">
                Email Us →
              </a>
            </div>
          </div>

          <div className="card contactFormCard">
            <div className="h2" style={{ marginBottom: 6 }}>Send Requirement</div>
            <div className="sub" style={{ marginBottom: 14 }}>
              Fill the details and we’ll connect with you. For urgent support, call directly.
            </div>

            {err ? <div className="contactErr">{err}</div> : null}

            <form onSubmit={onSubmit} className="contactForm">
              <div className="row2">
                <div>
                  <div className="label">Full Name *</div>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <div className="label">Company</div>
                  <input
                    className="input"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    placeholder="Company name (optional)"
                  />
                </div>
              </div>

              <div className="row2">
                <div>
                  <div className="label">Phone *</div>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+91 9XXXXXXXXX"
                  />
                </div>
                <div>
                  <div className="label">Email</div>
                  <input
                    className="input"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@company.com (optional)"
                  />
                </div>
              </div>

              <div className="row2">
                <div>
                  <div className="label">City / Location *</div>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Mumbai / Navi Mumbai / Thane..."
                  />
                </div>
                <div>
                  <div className="label">Work Type</div>
                  <select
                    className="input"
                    value={form.workType}
                    onChange={(e) => setField("workType", e.target.value)}
                  >
                    {WORK_TYPES.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row2">
                <div>
                  <div className="label">Preferred Contact</div>
                  <select
                    className="input"
                    value={form.preferred}
                    onChange={(e) => setField("preferred", e.target.value)}
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <div>
                  <div className="label">Subject</div>
                  <input
                    className="input"
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    placeholder={DEFAULT_SUBJECT}
                  />
                </div>
              </div>

              <div>
                <div className="label">Requirement Details *</div>
                <textarea
                  className="input"
                  rows={5}
                  value={form.details}
                  onChange={(e) => setField("details", e.target.value)}
                  placeholder="Example: Shed roofing repair, approx 1200 sq ft, site at Bhiwandi, need inspection and quotation..."
                />
                <div className="hint">
                  Tip: Mention work type, dimensions, material, site location, timeline and any drawing/photo reference.
                </div>
              </div>

              <div className="formActions">
                <Button className="btnAnim" disabled={loading} type="submit">
                  {loading ? "Sending..." : CTA_TEXT}
                </Button>

                <button
                  type="button"
                  className="btnGhost"
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
                >
                  WhatsApp Now →
                </button>

                <a className="btnGhost" href="tel:+919702485922">Call Now →</a>
              </div>

              {!canSend ? (
                <div className="hint" style={{ marginTop: 10 }}>
                  Required: Name, Phone, City, Details (min 10 chars). Email optional.
                </div>
              ) : null}
            </form>
          </div>
        </div>
      )}

      <style>{`
        .contactHero{ margin-top: 8px; margin-bottom: 14px; }
        .contactGrid{
          display:grid;
          grid-template-columns: .88fr 1.12fr;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 980px){
          .contactGrid{ grid-template-columns: 1fr; }
        }

        .card{
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.78);
          box-shadow: 0 10px 30px rgba(2,6,23,.06);
        }

        .contactInfo{ padding: 16px; }
        .infoRow{
          display:grid;
          gap:4px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(15,23,42,.06);
        }
        .infoLabel{
          font-size: 12px;
          color:#64748b;
          font-weight: 800;
        }
        .infoVal{
          color:#0f172a;
          line-height: 1.6;
          font-size: 13.5px;
          font-weight: 600;
        }
        .link{
          color: #1e6fd8;
          font-weight: 600;
          text-decoration: none;
        }
        .link:hover{ text-decoration: underline; }

        .infoActions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top: 14px;
        }

        .contactFormCard{ padding: 16px; }
        .contactErr{
          border: 1px solid rgba(239,68,68,.25);
          background: rgba(239,68,68,.06);
          color: #b91c1c;
          border-radius: 16px;
          padding: 10px 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .contactForm{ display:grid; gap: 12px; }
        .row2{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 640px){
          .row2{ grid-template-columns: 1fr; }
        }

        .label{
          font-size: 12px;
          color:#64748b;
          font-weight: 900;
          margin-bottom: 6px;
        }
        .input{
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.88);
          padding: 10px 12px;
          outline: none;
          font-family: Arial, Helvetica, sans-serif;
          color:#0f172a;
        }
        .input:focus{
          border-color: rgba(30,111,216,.32);
          box-shadow: 0 12px 30px rgba(30,111,216,.10);
        }

        .hint{
          color:#64748b;
          font-size: 12px;
          margin-top: 6px;
          line-height: 1.55;
        }

        .formActions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          align-items:center;
          margin-top: 6px;
        }

        .btnGhost{
          height: 44px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.12);
          background: rgba(255,255,255,.88);
          font-weight: 600;
          font-family: Arial, Helvetica, sans-serif;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          line-height: 1;
          transition: transform .12s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
          cursor:pointer;
          text-decoration:none;
          color:#0f172a;
        }
        .btnGhost:hover{
          border-color: rgba(30,111,216,.24);
          box-shadow: 0 10px 24px rgba(30,111,216,.10);
          transform: translateY(-1px);
        }
        .btnGhost:active{ transform: translateY(0) scale(.99); }

        .contactThanks{ padding: 16px; }
        .thanksTop{
          display:flex;
          gap:12px;
          align-items:flex-start;
        }
        .thanksTick{
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: rgba(30,111,216,.12);
          color: rgb(30,111,216);
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight: 900;
          font-size: 18px;
          border: 1px solid rgba(30,111,216,.20);
          flex: 0 0 auto;
        }
        .thanksActions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top: 14px;
        }
      `}</style>
    </div>
  );
}