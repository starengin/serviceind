const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");
const execFileAsync = promisify(execFile);
// EMAIL TEMPLATES (safe load)
// ✅ EMAIL TEMPLATES (safe load) — server.js is in /src, templates are in /emailTemplates (one level up)
const TEMPLATES_DIR = path.join(__dirname, "..", "emailTemplates");

function safeRead(fileName) {
  try {
    const fullPath = path.join(TEMPLATES_DIR, fileName);
    const html = fs.readFileSync(fullPath, "utf8");
    return html;
  } catch (e) {
    console.warn("⚠️ Template missing:", fileName, "| base:", TEMPLATES_DIR);
    return "";
  }
}

const SALES_TEMPLATE = safeRead("salesInvoice.html");
const PURCHASE_TEMPLATE = safeRead("purchaseInvoice.html");
const PAYMENT_TEMPLATE = safeRead("paymentAdvice.html");
const RECEIPT_TEMPLATE = safeRead("receiptVoucher.html"); // ✅ ADD
const JOURNAL_TEMPLATE = safeRead("journalAdvice.html");
const DEBIT_NOTE_TEMPLATE  = safeRead("debitNote.html");
const CREDIT_NOTE_TEMPLATE = safeRead("creditNote.html");

// ✅ quick debug (server start pe dikh jayega)

console.log("✅ TEMPLATE LENGTHS:", {
  SALES: SALES_TEMPLATE.length,
  PURCHASE: PURCHASE_TEMPLATE.length,
  PAYMENT: PAYMENT_TEMPLATE.length,
  JOURNAL: JOURNAL_TEMPLATE.length,
    RECEIPT: RECEIPT_TEMPLATE.length, // ✅ ADD
      DEBIT_NOTE: DEBIT_NOTE_TEMPLATE.length,
  CREDIT_NOTE: CREDIT_NOTE_TEMPLATE.length,
});
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer"); // ✅ ADD (Zoho welcome email)
// ✅ keep ONLY ONE pdfParse (remove other duplicate pdfParse lines)
const pdfParseLib = require("pdf-parse");
const pdfParse = typeof pdfParseLib === "function" ? pdfParseLib : pdfParseLib.default;



dotenv.config();

dotenv.config();

console.log("ENV CHECK =>", {
  cwd: process.cwd(),
  envFileExpected: path.resolve(process.cwd(), ".env"),
  SUPABASE_URL: process.env.SUPABASE_URL ? "FOUND" : "MISSING",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "FOUND" : "MISSING",
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || "transaction-pdfs",
});

const BRAND_NAME = process.env.COMPANY_NAME || "SERVICE INDIA";
const BRAND_EMAIL = process.env.BRAND_EMAIL || "corporate@serviceind.co.in";
const BRAND_PHONE = process.env.BRAND_PHONE || "+91-9702485922";
const BRAND_WEBSITE = process.env.BRAND_WEBSITE || "https://www.serviceind.co.in";
const BRAND_PORTAL = process.env.LOGIN_URL || "https://portal.serviceind.co.in";
const BRAND_LOGO_URL =
  process.env.MAIL_LOGO_URL || "https://www.serviceind.co.in/brand/logo.jpeg";

const RESEND_FROM = process.env.RESEND_FROM || "noreply@mail.serviceind.co.in";
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || BRAND_NAME || "SERVICE INDIA";
const RESEND_FROM_FMT = `"${RESEND_FROM_NAME}" <${RESEND_FROM}>`;
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "transaction-pdfs";

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const axios = require("axios");
const crypto = require("crypto"); // ✅ ADD THIS



const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // optional

async function sendOtpEmail({ to_email, to_name, otp, expiry_minutes }) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error("EmailJS env missing");
  }

  const payload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email,
      to_name,
      otp,
      expiry_minutes,
    },
  };

  // optional private key
  if (EMAILJS_PRIVATE_KEY) payload.accessToken = EMAILJS_PRIVATE_KEY;

  await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });
}
/* =========================
   ZOHO SMTP (WELCOME EMAIL)
========================= */
const smtp = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.in",
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: true, // ✅ 465 => true
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 45000,
  greetingTimeout: 45000,
  socketTimeout: 60000,
});
// ✅ keep ONLY ONE verify
// smtp.verify((err) => {
//   if (err) console.error("❌ SMTP VERIFY FAILED:", err?.message || err);
//   else console.log("✅ SMTP READY");
// });

function welcomeEmailHTML({ name, email, password }) {
const company = "SERVICE INDIA";
const loginUrl = BRAND_PORTAL;
const logoUrl = BRAND_LOGO_URL;

  const party = esc(name || "Customer");
  const safeEmail = esc(email || "-");
  const safePassword = esc(password || "-");
  const safeLoginUrl = esc(loginUrl);

  return `
<table align="center" width="100%" cellpadding="0" cellspacing="0"
style="
max-width:600px;
margin:30px auto;
border-radius:16px;
overflow:hidden;
font-family:Arial,Helvetica,sans-serif;
background:
radial-gradient(900px 420px at 15% 0%, rgba(0,123,255,0.16), transparent 60%),
radial-gradient(700px 360px at 95% 18%, rgba(255,140,0,0.14), transparent 55%),
radial-gradient(900px 480px at 80% 110%, rgba(0,170,255,0.14), transparent 60%),
linear-gradient(145deg,#f7f8fb,#eef1f6,#ffffff);
box-shadow:
0 18px 40px rgba(17,24,39,0.18),
0 6px 14px rgba(17,24,39,0.10);
">
  <tbody>
    <tr>
      <td style="
        background:linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00);
        padding:22px 24px;
        color:#ffffff;
        position:relative;
        box-shadow: inset 0 -6px 14px rgba(0,0,0,0.22);
      ">
        <div style="
          height:4px;
          background:linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.40),rgba(255,255,255,0.06));
          border-radius:999px;
          margin-bottom:14px;
        "></div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td width="100" valign="middle">
                <img src="https://www.serviceind.co.in/brand/logo.jpeg"
                     alt="SERVICE INDIA"
                     style="max-width:80px; display:block; border-radius:10px; box-shadow:0 10px 18px rgba(0,0,0,0.22);">
              </td>
              <td valign="middle" style="padding-left:12px;">
                <h1 style="
                  margin:0;
                  font-size:20px;
                  letter-spacing:1px;
                  color:#ffffff;
                  font-weight:bold;
                  text-shadow:0 3px 10px rgba(0,0,0,0.35);
                ">
                  SERVICE INDIA
                </h1>
                <p style="
                  margin:6px 0 0 0;
                  font-size:14px;
                  color:#eef8ff;
                  font-weight:bold;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  Customer Portal Access
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:0;">
        <div style="padding:22px 20px 18px 20px; color:#111827;">
          <p style="font-size:15px;margin:0 0 12px 0;">
            Dear <b>${party}</b>,
          </p>

          <p style="font-size:14px;line-height:1.75;margin:0 0 18px 0;color:#1f2937;">
            Greetings from <b>${company}</b>.<br>
            Your portal account has been successfully created. Please use the details below to login.
          </p>

          <div style="
            border-radius:12px;
            overflow:hidden;
            border:1px solid rgba(17,24,39,0.08);
            box-shadow:0 10px 18px rgba(17,24,39,0.08);
            background:#ffffff;
          ">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="font-size:14px;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;">
              <tbody>
                <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
                  <td width="45%" style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    <b>Login Email</b>
                  </td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    ${safeEmail}
                  </td>
                </tr>

                <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">
                    <b>Password</b>
                  </td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">
                    <span style="font-weight:bold;color:#0b5ed7;">${safePassword}</span>
                  </td>
                </tr>

                <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
                  <td style="padding:12px 14px;">
                    <b>Portal Link</b>
                  </td>
                  <td style="padding:12px 14px; word-break:break-word;">
                    <a href="${safeLoginUrl}" target="_blank" style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
                      ${safeLoginUrl}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top:18px; text-align:center;">
            <a href="${safeLoginUrl}" target="_blank" style="
              display:inline-block;
              background:linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00);
              color:#ffffff;
              padding:12px 18px;
              text-decoration:none;
              border-radius:999px;
              font-size:14px;
              font-weight:bold;
              box-shadow:0 10px 22px rgba(0,0,0,0.20);
            ">Login to Portal →</a>
          </div>

          <div style="
            margin-top:18px;
            padding:16px;
            border-radius:12px;
            background:
              radial-gradient(700px 180px at 15% 0%, rgba(0,123,255,0.10), transparent 55%),
              linear-gradient(180deg,#ffffff,#f2f8ff);
            border:1px dashed rgba(11,94,215,0.55);
          ">
            <p style="font-size:14px;line-height:1.65;margin:0;color:#1f2937;">
              For any clarification, please contact our team at
              <a href="mailto:corporate@serviceind.co.in" style="color:#0b5ed7;text-decoration:none;font-weight:bold;" target="_blank">
                corporate@serviceind.co.in
              </a>
            </p>

            <p style="font-size:14px;margin:16px 0 0 0;color:#1f2937;">
              Warm Regards,<br>
              <b>${company}</b><br>
              📧 <a target="_blank" href="mailto:corporate@serviceind.co.in" style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
                corporate@serviceind.co.in
              </a><br>
              📞 <a target="_blank" href="tel:+919702485922" style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
                +91-9702485922
              </a>
            </p>
          </div>
        </div>
      </td>
    </tr>

    <tr>
      <td style="
        background:linear-gradient(180deg,#f4f4f6,#efeff2);
        padding:16px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
        border-top:1px solid rgba(17,24,39,0.08);
      ">
        <div>
          This is a system-generated email. Replies to this message will be received at
          <b>
            <a target="_blank" href="mailto:corporate@serviceind.co.in" style="color:#6b7280;text-decoration:none;">
              corporate@serviceind.co.in
            </a>
          </b>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`;
}

// ✅ Corporate inquiry email (premium)
function contactInquiryEmailHTML({
  name, company, phone, email, city, workType, details, preferred, subject, page,
}) {
  const companyName = "SERVICE INDIA";
const logoUrl = BRAND_LOGO_URL;

  const safe = {
    name: esc(name || "-"),
    company: esc(company || "-"),
    phone: esc(phone || "-"),
    email: esc(email || "-"),
    city: esc(city || "-"),
    workType: esc(workType || "ALL"),
    details: esc(details || "-"),
    preferred: esc(preferred || "Call"),
    subject: esc(subject || "Work Requirement Enquiry"),
    page: esc(page || "-"),
  };

  return `
<table align="center" width="100%" cellpadding="0" cellspacing="0"
style="
max-width:600px;
margin:30px auto;
border-radius:16px;
overflow:hidden;
font-family:Arial,Helvetica,sans-serif;
background:
radial-gradient(900px 420px at 15% 0%, rgba(0,123,255,0.16), transparent 60%),
radial-gradient(700px 360px at 95% 18%, rgba(255,140,0,0.14), transparent 55%),
radial-gradient(900px 480px at 80% 110%, rgba(0,170,255,0.14), transparent 60%),
linear-gradient(145deg,#f7f8fb,#eef1f6,#ffffff);
box-shadow:
0 18px 40px rgba(17,24,39,0.18),
0 6px 14px rgba(17,24,39,0.10);
">
  <tbody>
    <tr>
      <td style="
        background:linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00);
        padding:22px 24px;
        color:#ffffff;
        position:relative;
        box-shadow: inset 0 -6px 14px rgba(0,0,0,0.22);
      ">
        <div style="
          height:4px;
          background:linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.40),rgba(255,255,255,0.06));
          border-radius:999px;
          margin-bottom:14px;
        "></div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td width="100" valign="middle">
                <img src="https://www.serviceind.co.in/brand/logo.jpeg"
                     alt="SERVICE INDIA"
                     style="max-width:80px; display:block; border-radius:10px; box-shadow:0 10px 18px rgba(0,0,0,0.22);">
              </td>
              <td valign="middle" style="padding-left:12px;">
                <h1 style="
                  margin:0;
                  font-size:20px;
                  letter-spacing:1px;
                  color:#ffffff;
                  font-weight:bold;
                  text-shadow:0 3px 10px rgba(0,0,0,0.35);
                ">
                  SERVICE INDIA
                </h1>
                <p style="
                  margin:6px 0 0 0;
                  font-size:14px;
                  color:#eef8ff;
                  font-weight:bold;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  New Requirement Received
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:0;">
        <div style="padding:22px 20px 18px 20px; color:#111827;">
          <p style="font-size:15px;margin:0 0 12px 0;">
            Hello Team,
          </p>

          <p style="font-size:14px;line-height:1.75;margin:0 0 18px 0;color:#1f2937;">
            A new work enquiry has been received from the website. Please review the details below and respond as per the preferred contact mode.
          </p>

          <div style="
            border-radius:12px;
            overflow:hidden;
            border:1px solid rgba(17,24,39,0.08);
            box-shadow:0 10px 18px rgba(17,24,39,0.08);
            background:#ffffff;
          ">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="font-size:14px;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;">
              <tbody>
                <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
                  <td width="45%" style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    <b>Subject</b>
                  </td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    ${safe.subject}
                  </td>
                </tr>

                <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Name</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.name}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Company</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.company}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Phone</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><span style="font-weight:bold;color:#0b5ed7;">${safe.phone}</span></td>
                </tr>

                <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Email</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.email}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>City / Location</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.city}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Work Type</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.workType}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Preferred Contact</b></td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${safe.preferred}</td>
                </tr>

                <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
                  <td style="padding:12px 14px;"><b>Requirement Details</b></td>
                  <td style="padding:12px 14px; line-height:1.8;">${safe.details}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="
            margin-top:18px;
            padding:16px;
            border-radius:12px;
            background:
              radial-gradient(700px 180px at 15% 0%, rgba(0,123,255,0.10), transparent 55%),
              linear-gradient(180deg,#ffffff,#f2f8ff);
            border:1px dashed rgba(11,94,215,0.55);
          ">
            <p style="font-size:14px;line-height:1.65;margin:0;color:#1f2937;">
              <b>Page Source:</b> ${safe.page}
            </p>
          </div>

          <div style="margin-top:18px; text-align:center;">
            <a href="https://wa.me/919702485922" target="_blank" style="
              display:inline-block;
              background:linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00);
              color:#ffffff;
              padding:12px 18px;
              text-decoration:none;
              border-radius:999px;
              font-size:14px;
              font-weight:bold;
              box-shadow:0 10px 22px rgba(0,0,0,0.20);
            ">Open WhatsApp →</a>
          </div>
        </div>
      </td>
    </tr>

    <tr>
      <td style="
        background:linear-gradient(180deg,#f4f4f6,#efeff2);
        padding:16px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
        border-top:1px solid rgba(17,24,39,0.08);
      ">
        <div>
          System-generated enquiry email. Please review and respond from
          <b>
            <a target="_blank" href="mailto:corporate@serviceind.co.in" style="color:#6b7280;text-decoration:none;">
              corporate@serviceind.co.in
            </a>
          </b>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`;
}

// ✅ Customer ack email (premium)
function contactCustomerAckEmailHTML({ name, subject }) {
const companyName = "SERVICE INDIA";
const logoUrl = BRAND_LOGO_URL;

  const safeName = esc(name || "Customer");
  const safeSubject = esc(subject || "Work Requirement Enquiry");

  return `
<table align="center" width="100%" cellpadding="0" cellspacing="0"
style="
max-width:600px;
margin:30px auto;
border-radius:16px;
overflow:hidden;
font-family:Arial,Helvetica,sans-serif;
background:
radial-gradient(900px 420px at 15% 0%, rgba(0,123,255,0.16), transparent 60%),
radial-gradient(700px 360px at 95% 18%, rgba(255,140,0,0.14), transparent 55%),
radial-gradient(900px 480px at 80% 110%, rgba(0,170,255,0.14), transparent 60%),
linear-gradient(145deg,#f7f8fb,#eef1f6,#ffffff);
box-shadow:
0 18px 40px rgba(17,24,39,0.18),
0 6px 14px rgba(17,24,39,0.10);
">
  <tbody>
    <tr>
      <td style="
        background:linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00);
        padding:22px 24px;
        color:#ffffff;
        position:relative;
        box-shadow: inset 0 -6px 14px rgba(0,0,0,0.22);
      ">
        <div style="
          height:4px;
          background:linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.40),rgba(255,255,255,0.06));
          border-radius:999px;
          margin-bottom:14px;
        "></div>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td width="100" valign="middle">
                <img src="https://www.serviceind.co.in/brand/logo.jpeg"
                     alt="SERVICE INDIA"
                     style="max-width:80px; display:block; border-radius:10px; box-shadow:0 10px 18px rgba(0,0,0,0.22);">
              </td>
              <td valign="middle" style="padding-left:12px;">
                <h1 style="
                  margin:0;
                  font-size:20px;
                  letter-spacing:1px;
                  color:#ffffff;
                  font-weight:bold;
                  text-shadow:0 3px 10px rgba(0,0,0,0.35);
                ">
                  SERVICE INDIA
                </h1>
                <p style="
                  margin:6px 0 0 0;
                  font-size:14px;
                  color:#eef8ff;
                  font-weight:bold;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  Requirement Received
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:0;">
        <div style="padding:22px 20px 18px 20px; color:#111827;">
          <p style="font-size:15px;margin:0 0 12px 0;">
            Dear <b>${safeName}</b>,
          </p>

          <p style="font-size:14px;line-height:1.75;margin:0 0 18px 0;color:#1f2937;">
            Thank you for contacting <b>${companyName}</b>.<br>
            We have received your requirement regarding <b>${safeSubject}</b>. Our team will review it and contact you shortly.
          </p>

          <div style="
            border-radius:12px;
            overflow:hidden;
            border:1px solid rgba(17,24,39,0.08);
            box-shadow:0 10px 18px rgba(17,24,39,0.08);
            background:#ffffff;
          ">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="font-size:14px;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;">
              <tbody>
                <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
                  <td width="45%" style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    <b>Status</b>
                  </td>
                  <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#111827;">
                    Requirement Received Successfully
                  </td>
                </tr>

                <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
                  <td style="padding:12px 14px;">
                    <b>Reference</b>
                  </td>
                  <td style="padding:12px 14px;">
                    ${safeSubject}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="
            margin-top:18px;
            padding:16px;
            border-radius:12px;
            background:
              radial-gradient(700px 180px at 15% 0%, rgba(0,123,255,0.10), transparent 55%),
              linear-gradient(180deg,#ffffff,#f2f8ff);
            border:1px dashed rgba(11,94,215,0.55);
          ">
            <p style="font-size:14px;line-height:1.65;margin:0;color:#1f2937;">
              For urgent discussion, please contact us at
              <a href="mailto:corporate@serviceind.co.in" style="color:#0b5ed7;text-decoration:none;font-weight:bold;" target="_blank">
                corporate@serviceind.co.in
              </a>
              or call
              <b> +91-9702485922</b>.
            </p>

            <p style="font-size:14px;margin:16px 0 0 0;color:#1f2937;">
              Warm Regards,<br>
              <b>${companyName}</b><br>
              📧 <a target="_blank" href="mailto:corporate@serviceind.co.in" style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
                corporate@serviceind.co.in
              </a><br>
              📞 <a target="_blank" href="tel:+919702485922" style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
                +91-9702485922
              </a>
            </p>
          </div>
        </div>
      </td>
    </tr>

    <tr>
      <td style="
        background:linear-gradient(180deg,#f4f4f6,#efeff2);
        padding:16px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
        border-top:1px solid rgba(17,24,39,0.08);
      ">
        <div>
          This is a system-generated email. Replies to this message will be received at
          <b>
            <a target="_blank" href="mailto:corporate@serviceind.co.in" style="color:#6b7280;text-decoration:none;">
              corporate@serviceind.co.in
            </a>
          </b>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`;
}
function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
// ✅ allow any vercel preview (optional but best)
function isAllowedOrigin(origin) {
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true;
    return ALLOWED_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}
function renderHTMLTemplate(html, vars = {}) {
  return html.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}
function formatDate(dateStr) {
  if (!dateStr) return "";

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function buildTxnEmailHTML(type, meta, party) {
  let template = "";

  if (type === "SALE") template = SALES_TEMPLATE;
  else if (type === "PURCHASE") template = PURCHASE_TEMPLATE;
  else if (type === "PAYMENT") template = PAYMENT_TEMPLATE;
  else if (type === "RECEIPT") template = RECEIPT_TEMPLATE;
  else if (type === "JOURNAL_DR" || type === "JOURNAL_CR") template = JOURNAL_TEMPLATE;
  else if (type === "PURCHASE_RETURN") template = DEBIT_NOTE_TEMPLATE;   // Debit Note
else if (type === "SALES_RETURN") template = CREDIT_NOTE_TEMPLATE;     // Credit Note

  // fallback (agar template empty ho)
  if (!template || !template.trim()) {
    return `
      <div style="font-family:Arial">
        <h2>SERVICE INDIA</h2>
        <p>Party: <b>${party?.name || ""}</b></p>
        <p>Voucher: <b>${meta?.voucherNo || ""}</b></p>
        <p>Date: <b>${meta?.date || ""}</b></p>
        <p>Amount: <b>${meta?.amount || ""}</b></p>
      </div>
    `;
  }

  return renderHTMLTemplate(template, {
    // ✅ journal placeholders
  drcr:
    meta?.drcr || meta?.DrCr || meta?.DRCR || meta?.dr_cr || meta?.drCr || "",
  narration:
    meta?.narration || meta?.Narration || meta?.narr || "",

  // ✅ add this
  summary_line: meta?.summary_line || "",
    drcr: meta?.drcr || meta?.DrCr || meta?.DRCR || "",
    narration: meta?.narration || "",

    party_name: party?.name || "",
    party_email: party?.email || "",
    party_gstin: party?.gstin || meta?.party_gstin || "",

    voucherNo: meta?.voucherNo || meta?.VoucherNo || "",
    VoucherNo: meta?.voucherNo || meta?.VoucherNo || "",

    invoice_no: meta?.invoice_no || meta?.voucherNo || "",
    invoice_date: formatDate(meta?.invoice_date || meta?.date),
    invoice_amt: meta?.invoice_amt || meta?.amount || "",

    advice_date: formatDate(meta?.advice_date || meta?.date),
    total_amount: meta?.total_amount || meta?.amount || "",

    payment_mode: meta?.payment_mode || "",
    inst_no: meta?.inst_no || "",
    inst_date: formatDate(meta?.inst_date || meta?.date),
    to_ac: meta?.to_ac || "",
    ifsc: meta?.ifsc || "",
    issued_from_bank: meta?.issued_from_bank || "",
    issued_from_ac: meta?.issued_from_ac || "",

    purchase_ref: meta?.purchase_ref || meta?.voucherNo || "",
    purchase_date: formatDate(meta?.purchase_date || meta?.date),
    supplier_ref: meta?.supplier_ref || "",
    supplier_ref_date: meta?.supplier_ref_date || "",

    // RECEIPT
    receipt_no: meta?.receipt_no || meta?.voucherNo || "",
    receipt_date: formatDate(meta?.receipt_date || meta?.date),
    received_from: party?.name || meta?.party_name || "",
    through_bank: meta?.through_bank || meta?.issued_from_bank || "",
    remitter_ac: meta?.issued_from_ac || "",
    against_refs: meta?.against_refs || "",

    // ✅ DEBIT / CREDIT NOTE
note_date: formatDate(meta?.note_date || meta?.date),
note_no: meta?.note_no || meta?.voucherNo || meta?.VoucherNo || "",
amount: meta?.amount || meta?.total_amount || meta?.invoice_amt || "",
  });
}

function subjectForType(type, meta) {
  const v = meta?.voucherNo || meta?.invoice_no || "";
  if (type === "SALE") return `Sales Invoice ${v} - SERVICE INDIA`;
  if (type === "PURCHASE") return `Purchase Invoice ${v} - SERVICE INDIA`;
  if (type === "PAYMENT") return `Payment Advice ${v} - SERVICE INDIA`;
  if (type === "RECEIPT") return `Receipt ${v} - SERVICE INDIA`;
  if (type === "JOURNAL_DR") return `Journal (Dr.) - ${meta?.narration || v} - SERVICE INDIA`;
if (type === "JOURNAL_CR") return `Journal (Cr.) - ${meta?.narration || v} - SERVICE INDIA`;
  if (type === "PURCHASE_RETURN") return `Debit Note ${v} - SERVICE INDIA`;
if (type === "SALES_RETURN") return `Credit Note ${v} - SERVICE INDIA`;
  return `Transaction ${v} - SERVICE INDIA`;
}

function fileToResendAttachmentFromDisk(file) {
  return {
    filename: file.originalname || "attachment.pdf",
    content: fs.readFileSync(file.path).toString("base64"),
  };
}

function makeStoragePath(prefix, originalName = "file.pdf") {
  const ext = path.extname(originalName || "") || ".pdf";
  const base = path
    .basename(originalName || "file.pdf", ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 80);

  return `${prefix}/${Date.now()}_${crypto.randomBytes(6).toString("hex")}_${base}${ext}`;
}

async function uploadFileToSupabase(file, prefix = "txn") {
  console.log("UPLOAD SUPABASE DEBUG =>", {
    hasSupabaseClient: !!supabase,
    SUPABASE_URL: process.env.SUPABASE_URL ? "FOUND" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "FOUND" : "MISSING",
    SUPABASE_BUCKET,
    fileName: file?.originalname || "",
  });

  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const storagePath = makeStoragePath(prefix, file.originalname || "file.pdf");

  let fileContent;
  if (file.buffer) {
    fileContent = file.buffer;
  } else if (file.path) {
    fileContent = fs.readFileSync(file.path);
  } else {
    throw new Error("No file buffer/path found for upload");
  }

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, fileContent, {
      contentType: file.mimetype || "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  return {
    storagePath,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

async function downloadFromSupabase(storagePath) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .download(storagePath);

  if (error) throw error;
  if (!data) throw new Error("File not found in storage");

  const arr = await data.arrayBuffer();
  return Buffer.from(arr);
}

async function deleteFromSupabase(storagePath) {
  if (!supabase || !storagePath) return;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("SUPABASE DELETE ERROR:", error.message || error);
  }
}

async function fileToResendAttachmentFromStorage(pdfRow) {
  const content = await downloadFromSupabase(pdfRow.filePath);

  return {
    filename: pdfRow.originalName || "attachment.pdf",
    content: content.toString("base64"),
  };
}
const app = express();
const prisma = new PrismaClient();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// ✅ CORS (Production-safe + Dev-safe)
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5176",
  "http://localhost:5177",


  "https://www.serviceind.co.in",
  "https://serviceind.co.in",
  "https://portal.serviceind.co.in",
  "https://admin.serviceind.co.in",
]);

const corsOptions = {
  origin: (origin, cb) => {
    try {
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);

      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return cb(null, true);

      return cb(null, false);
    } catch (e) {
      console.error("CORS ORIGIN ERROR:", e?.message || e);
      return cb(null, false);
    }
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use((req, res, next) => {
  try {
    decodeURIComponent(req.path);
    next();
  } catch (e) {
    console.warn("BAD URL BLOCKED:", req.url);
    return res.status(400).send("Bad Request");
  }
});

app.use(cors(corsOptions));


// ✅ PASTE HERE (move)
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));
function isPdfFile(file) {
  const name = String(file?.originalname || "").toLowerCase();
  const mime = String(file?.mimetype || "").toLowerCase();
  return mime === "application/pdf" || name.endsWith(".pdf");
}

async function compressPdfWithGhostscript(inputPath, outputPath) {
  const gsCmd = process.env.GS_COMMAND || "gs";

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",

    "-dPDFSETTINGS=/screen",

    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",

    "-dDownsampleColorImages=true",
    "-dColorImageDownsampleType=/Bicubic",
    "-dColorImageResolution=96",

    "-dDownsampleGrayImages=true",
    "-dGrayImageDownsampleType=/Bicubic",
    "-dGrayImageResolution=96",

    "-dDownsampleMonoImages=true",
    "-dMonoImageDownsampleType=/Subsample",
    "-dMonoImageResolution=150",

    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  await execFileAsync(gsCmd, args);
}

async function maybeCompressPdf(file) {
  if (!file?.path || !isPdfFile(file)) {
    return file;
  }

  const originalPath = file.path;
  const parsed = path.parse(originalPath);
  const compressedPath = path.join(parsed.dir, `${parsed.name}-compressed.pdf`);

  try {
    await compressPdfWithGhostscript(originalPath, compressedPath);

    if (!fs.existsSync(compressedPath)) {
      return file;
    }

    const originalSize = fs.statSync(originalPath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    console.log("PDF SIZE CHECK:", {
      name: file.originalname,
      originalSize,
      compressedSize,
    });

    if (compressedSize > 0 && compressedSize < originalSize * 0.90){
      try { fs.unlinkSync(originalPath); } catch {}

      return {
        ...file,
        path: compressedPath,
        filename: path.basename(compressedPath),
        size: compressedSize,
        originalSize,
        compressed: true,
      };
    }

    try { fs.unlinkSync(compressedPath); } catch {}

    return {
      ...file,
      originalSize,
      compressed: false,
    };
  } catch (err) {
    console.error("PDF COMPRESSION FAILED, USING ORIGINAL:", err?.message || err);

    if (fs.existsSync(compressedPath)) {
      try { fs.unlinkSync(compressedPath); } catch {}
    }

    return {
      ...file,
      compressed: false,
    };
  }
}

// ✅ Admin credentials from .env (DO NOT hardcode in frontend)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "corporate@serviceind.co.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@N$@R1_@y@n.";

// In-memory stores (simple & fast)
const captchaStore = new Map(); // captchaId -> { answer, exp }
const tempStore = new Map(); // tempToken -> { otp, exp, tries }

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeId() {
  return crypto.randomBytes(16).toString("hex");
}

function now() {
  return Date.now();
}
// ✅ Dashboard (Admin)
app.get("/dashboard", async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to) : new Date();

    // include full day end for "to"
    to.setHours(23, 59, 59, 999);

    // ✅ pick correct model names
    const models = Object.keys(prisma).filter(
      (k) => prisma[k] && typeof prisma[k].findMany === "function"
    );

    const pick = (names) => names.find((n) => prisma[n] && typeof prisma[n].findMany === "function");

    const userModel =
      pick(["customer", "Customer", "customers", "Customers", "user", "User", "users", "Users", "party", "Party"]) || null;

    const txnModel =
      pick(["transaction", "Transaction", "transactions", "Transactions", "txn", "Txn", "voucher", "Voucher"]) || null;

    const usersCount = userModel ? await prisma[userModel].count() : 0;

    const wherePeriod = { date: { gte: from, lte: to } }; // ✅ if your field is txnDate, change here

    const transactionsCount = txnModel
      ? await prisma[txnModel].count({ where: wherePeriod })
      : 0;

    // helper to sum by type
    async function sumByType(type) {
      if (!txnModel) return 0;

      // ✅ if your fields are different, adjust:
      // type field: "type" (SALE/PURCHASE/...)
      // amount field: "amount"
      const agg = await prisma[txnModel].aggregate({
        where: { ...wherePeriod, type },
        _sum: { amount: true },
      });

      return Number(agg?._sum?.amount || 0);
    }

    const totalSales = await sumByType("SALE");
    const totalPurchase = await sumByType("PURCHASE");
    const totalReceipt = await sumByType("RECEIPT");
    const totalPayment = await sumByType("PAYMENT");
    const totalSalesReturn = await sumByType("SALES_RETURN");
    const totalPurchaseReturn = await sumByType("PURCHASE_RETURN");

    return res.json({
      usersCount,
      transactionsCount,
      totalSales,
      totalPurchase,
      totalReceipt,
      totalPayment,
      totalSalesReturn,
      totalPurchaseReturn,
      // debug only (remove later):
      models,
      using: { userModel, txnModel },
      period: { from, to },
    });
  } catch (e) {
    console.error("DASHBOARD ERROR:", e);
    return res.status(500).json({ message: e.message || "Dashboard failed" });
  }
});

app.post("/public/contact", async (req, res) => {
  const body = req.body || {};

  const name = String(body.name || body.fullName || "").trim();
  const company = String(body.company || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const city = String(body.city || "").trim();
  const workType = String(
    body.workType || body.material || body.materialType || "ALL"
  ).trim();
  const preferred = String(body.preferred || body.preferredContact || "Call").trim();
  const subject = String(
    body.subject || `${BRAND_NAME} – Work Requirement Enquiry`
  ).trim();
  const details = String(body.details || body.requirementDetails || "").trim();
  const page = String(body.page || "").trim();

  if (!name || name.length < 2) {
    return res.status(400).json({ ok: false, message: "Name is required" });
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return res.status(400).json({ ok: false, message: "Valid phone is required" });
  }

  if (!city || city.length < 2) {
    return res.status(400).json({ ok: false, message: "City is required" });
  }

  if (!details || details.length < 3) {
    return res.status(400).json({ ok: false, message: "Requirement details required" });
  }

  res.status(200).json({
    ok: true,
    message: "Requirement received. Our team will contact you shortly.",
  });

  setImmediate(async () => {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("CONTACT: RESEND_API_KEY missing");
        return;
      }

      await resend.emails.send({
        from: RESEND_FROM_FMT,
        to: process.env.CONTACT_TO_EMAIL || BRAND_EMAIL,
        subject,
        html: contactInquiryEmailHTML({
          name,
          company,
          phone,
          email,
          city,
          workType,
          details,
          preferred,
          subject,
          page,
        }),
      });

      if (email) {
        await resend.emails.send({
          from: RESEND_FROM_FMT,
          to: email,
          subject: `We received your requirement – ${BRAND_NAME}`,
          html: contactCustomerAckEmailHTML({ name, subject }),
        });
      }

      console.log("✅ CONTACT EMAIL SENT (Resend)");
    } catch (e) {
      console.error("❌ CONTACT EMAIL FAILED (ignored):", e?.message || e);
    }
  });
});
const uploadEmail = multer({
  dest: UPLOAD_DIR,
  limits: {
    files: 60,
    fileSize: 25 * 1024 * 1024,
  },
});

async function buildEmailAttachments(mainPdf, extraFiles = []) {
  const files = [];

  if (mainPdf) files.push(mainPdf);
  for (const f of extraFiles || []) files.push(f);

  const attachments = [];

  for (const file of files) {
    let finalFile = file;

    try {
      if (isPdfFile(file)) {
        finalFile = await maybeCompressPdf(file);
      }

      attachments.push(fileToResendAttachmentFromDisk(finalFile));
    } catch (e) {
      console.error("ATTACHMENT PROCESS FAILED:", e?.message || e);
      attachments.push(fileToResendAttachmentFromDisk(file));
    }
  }

  return attachments;
}
app.post(
  "/admin/emails/send",
  requireAdmin,
  uploadEmail.fields([
    { name: "mainPdf", maxCount: 1 },
    { name: "extraFiles", maxCount: 50 },
  ]),
  async (req, res) => {
    let attachments = [];
    let filesToCleanup = [];

    try {
      const { to, subject, html } = req.body || {};

      console.log("EMAIL BODY:", req.body);
      console.log("EMAIL FILES:", req.files);

      if (!to || !subject || !html) {
        return res.status(400).json({ message: "to, subject, html required" });
      }

      const mainPdf = req.files?.mainPdf?.[0] || null;
      const extra = req.files?.extraFiles || [];

      filesToCleanup = [
        ...(mainPdf ? [mainPdf] : []),
        ...extra,
      ];

      attachments = await buildEmailAttachments(mainPdf, extra);

      const sendResult = await resend.emails.send({
        from: RESEND_FROM_FMT,
        to: [String(to).trim()],
        subject: String(subject).trim(),
        html: String(html),
        reply_to: "corporate@serviceind.co.in",
        attachments: attachments.length ? attachments : undefined,
      });

      console.log("ADMIN EMAIL SEND SUCCESS:", sendResult);

      return res.json({ ok: true, attached: attachments.length });
    } catch (e) {
      console.error("ADMIN EMAIL SEND ERROR FULL:", e);
      return res.status(500).json({
        message: "Email failed",
        details: String(e?.message || e),
      });
    } finally {
      for (const f of filesToCleanup) {
        if (f?.path && fs.existsSync(f.path)) {
          try {
            fs.unlinkSync(f.path);
          } catch {}
        }
      }
    }
  }
);

app.get("/admin/leads", requireAdmin, async (req, res) => {
  try {
    const items = await prisma.contactLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed", details: String(e.message || e) });
  }
});
// ✅ Captcha endpoint (server generates & validates)
app.get("/admin/captcha", (req, res) => {
  const a = randInt(2, 9);
  const b = randInt(1, 9);
  const op = Math.random() > 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;

  const captchaId = makeId();
  captchaStore.set(captchaId, { answer: String(answer), exp: now() + 2 * 60 * 1000 }); // 2 min

  res.json({ captchaId, question: `${a} ${op} ${b} = ?` });
});



// ✅ Admin Login (NO OTP) — captcha + creds => JWT
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body || {};

    if (!email || !password || !captchaId || !captchaAnswer) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cap = captchaStore.get(captchaId);
    if (!cap || cap.exp < now()) {
      return res.status(400).json({ message: "Captcha expired. Refresh." });
    }
    captchaStore.delete(captchaId);

    if (String(captchaAnswer).trim() !== String(cap.answer).trim()) {
      return res.status(401).json({ message: "Captcha incorrect" });
    }

    if (String(email).trim().toLowerCase() !== String(ADMIN_EMAIL).trim().toLowerCase()) {
      return res.status(401).json({ message: "Invalid Admin ID" });
    }

    if (String(password) !== String(ADMIN_PASSWORD)) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { role: "ADMIN", email: ADMIN_EMAIL },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ token });
  } catch (e) {
    console.error("ADMIN LOGIN (NO OTP) ERROR:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
});
// ✅ BACKWARD COMPAT: old frontend calls this
app.post("/admin/login-step1", async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body || {};

    if (!email || !password || !captchaId || !captchaAnswer) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cap = captchaStore.get(captchaId);
    if (!cap || cap.exp < now()) {
      return res.status(400).json({ message: "Captcha expired. Refresh." });
    }
    captchaStore.delete(captchaId);

    if (String(captchaAnswer).trim() !== String(cap.answer).trim()) {
      return res.status(401).json({ message: "Captcha incorrect" });
    }

    if (String(email).trim().toLowerCase() !== String(ADMIN_EMAIL).trim().toLowerCase()) {
      return res.status(401).json({ message: "Invalid Admin ID" });
    }

    if (String(password) !== String(ADMIN_PASSWORD)) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ role: "ADMIN", email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token });
  } catch (e) {
    console.error("ADMIN LOGIN STEP1 ERROR:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
});
/* =========================
   CREATE ADMIN IF NOT EXISTS
========================= */
async function ensureAdmin() {
const email = "corporate@serviceind.co.in";
  const password = "@N$@R1_@y@n.";

  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!existing) {
    await prisma.user.create({
      data: { role: "ADMIN", name: "Admin", email, passwordHash: hash },
    });
    console.log("✅ Admin created:", email);
  } else {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, passwordHash: hash },
    });
    console.log("✅ Admin updated:", email);
  }
}
ensureAdmin();

/* =========================
   AUTH
========================= */

// ✅ ADMIN LOGIN (email + password)
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: String(email).toLowerCase().trim(),
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, passwordHash: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Admin email is not registered" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash || "");
    if (!ok) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id, role: "ADMIN" }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin Login (alternate route)
app.post("/admin-auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: { email: String(email).toLowerCase().trim(), role: "ADMIN" },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (!user) return res.status(401).json({ message: "Admin not found" });

    const ok = await bcrypt.compare(String(password), user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: "ADMIN" }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: "ADMIN" },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CUSTOMER PORTAL AUTH + MIDDLEWARE
========================= */

function requireCustomer(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const headerToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const queryToken = req.query && req.query.token ? String(req.query.token) : null;

    const token = headerToken || queryToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "CUSTOMER") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.customerId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
function requireAdminOrSameCustomer(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const headerToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const queryToken = req.query?.token ? String(req.query.token) : null;

    const token = headerToken || queryToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;

    const partyId = Number(req.params.partyId);
    if (!partyId) return res.status(400).json({ message: "Invalid partyId" });

    if (payload.role === "ADMIN") return next();
    if (payload.role === "CUSTOMER" && payload.id === partyId) return next();

    return res.status(403).json({ message: "Forbidden" });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
// ✅ Customer Login
app.post("/customer-auth/login", async (req, res) => {
    console.log("CUSTOMER LOGIN BODY:", req.body);
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

const user = await prisma.user.findFirst({
  where: { email: String(email).toLowerCase().trim(), role: "CUSTOMER" },
});

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: "CUSTOMER" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, name: user.name || "Customer", email: user.email },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Login failed" });
  }
});

// ✅ Customer profile
app.get("/customer-auth/me", requireCustomer, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.customerId },
    select: { id: true, name: true, email: true },
  });
  res.json({ user: me });
});

/* =========================
   USERS (CUSTOMERS)
========================= */
/* =========================
   CUSTOMERS (NO OPENING BALANCE) + WELCOME EMAIL
========================= */

// ✅ List customers (for admin screen + dropdown)
app.get("/customers", requireAdmin, async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, phone: true, gstin: true, address: true, state: true },
    });
    res.json(customers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Customers fetch failed", details: String(e.message || e) });
  }
});

// ✅ Create customer + send welcome email (email + password + login button)
// ✅ Create customer + send welcome email (NON-BLOCKING)
// ✅ Create customer + OPTIONAL welcome email
app.post("/customers", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, sendEmail } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, Password required" });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const exists = await prisma.user.findFirst({
      where: { email: cleanEmail },
      select: { id: true },
    });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(String(password), 10);

    const created = await prisma.user.create({
      data: {
        role: "CUSTOMER",
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash: hash,
      },
      select: { id: true, name: true, email: true, phone: true, gstin: true, address: true, state: true },
    });

    // ✅ default behavior: sendEmail = true unless explicitly false
    const shouldSend = sendEmail === undefined ? true : !!sendEmail;

    // respond immediately
    res.json({ ok: true, customer: created, emailQueued: shouldSend });

    if (!shouldSend) return;

    setImmediate(async () => {
      try {
        if (!process.env.RESEND_API_KEY) {
          console.error("WELCOME: RESEND_API_KEY missing");
          return;
        }

        await resend.emails.send({
          from: RESEND_FROM_FMT,
          to: created.email,
          subject: "Welcome to SERVICE INDIA – Your Portal Login",
          html: welcomeEmailHTML({
            name: created.name,
            email: created.email,
            password: password ? String(password) : undefined,
          }),
        });

        console.log("✅ WELCOME EMAIL SENT:", created.email);
      } catch (mailErr) {
        console.error("❌ WELCOME EMAIL FAILED:", mailErr?.message || mailErr);
      }
    });
  } catch (e) {
    console.error("CREATE CUSTOMER ERROR:", e);
    return res.status(500).json({ message: "Create failed", details: String(e.message || e) });
  }
});
// ✅ Resend / Send customer login credentials (ADMIN sets password)
app.post("/customers/:id/send-welcome-email", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body || {};


    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user || user.role !== "CUSTOMER") {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (!user.email) {
      return res.status(400).json({ message: "Customer email missing" });
    }

// ✅ password optional: only update if provided
if (password && String(password).trim().length >= 4) {
  const hash = await bcrypt.hash(String(password), 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash: hash },
  });
}

    // respond fast
    res.json({ ok: true, queued: true });

    setImmediate(async () => {
      try {
        await resend.emails.send({
          from: RESEND_FROM_FMT,
          to: user.email,
          subject: "SERVICE INDIA – Portal Login Credentials",
          html: welcomeEmailHTML({
            name: user.name,
            email: user.email,
            password: password ? String(password) : "",
          }),
        });
        console.log("✅ CUSTOMER CREDENTIAL EMAIL SENT:", user.email);
      } catch (e) {
        console.error("❌ CUSTOMER RESEND FAILED:", e?.message || e);
      }
    });
  } catch (e) {
    console.error("CUSTOMER RESEND ERROR:", e);
    res.status(500).json({ message: "Resend failed", details: String(e.message || e) });
  }
});
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});
// ✅ Update customer (password optional reset)
app.put("/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password, address, state, gstin } = req.body || {};

    const data = {};
if (name != null) data.name = String(name).trim();
if (email != null) data.email = String(email).toLowerCase().trim();
if (password) data.passwordHash = await bcrypt.hash(String(password), 10);

    if (password) {
      data.passwordHash = await bcrypt.hash(String(password), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true },
    });

    res.json({ ok: true, customer: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update failed", details: String(e.message || e) });
  }
});

// ✅ Delete customer (block if transactions exist)
app.delete("/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const txnCount = await prisma.transaction.count({ where: { partyId: id } });
    if (txnCount > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with transactions",
      });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Delete failed", details: String(e.message || e) });
  }
});
app.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};

    const data = {};
    if (body.name != null) data.name = String(body.name);
    if (body.email !== undefined) data.email = body.email ? String(body.email) : null;

    if (body.openingAmount != null) data.openingAmount = Number(body.openingAmount) || 0;
    if (body.openingType != null) data.openingType = body.openingType === "CR" ? "CR" : "DR";

    if (body.password) data.passwordHash = await bcrypt.hash(String(body.password), 10);

    const updated = await prisma.user.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Update failed", details: String(e.message || e) });
  }
});

app.get("/users", requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({ where: { role: "CUSTOMER" } });
  res.json(users);
});

app.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const txnCount = await prisma.transaction.count({ where: { partyId: id } });
    if (txnCount > 0) {
      return res.status(400).json({
        error: "Cannot delete customer with transactions",
        tip: "Delete transactions first, or keep customer inactive (future feature).",
      });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Delete failed", details: String(e.message || e) });
  }
});

// ✅ Scan Transaction PDF -> extract type, party, date, voucherNo, amount
// Uses multer memory storage for scan only (doesn't save to disk)

function norm(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function parseDateLoose(s) {
  // handles: 2-Feb-26, 2-May-25, 02-02-2026 etc.
  const str = norm(s);

  // dd-MMM-yy
  const m1 = str.match(/\b(\d{1,2})-([A-Za-z]{3})-(\d{2,4})\b/);
  if (m1) {
    const dd = Number(m1[1]);
    const mon = m1[2].toLowerCase();
    const yy = Number(m1[3].length === 2 ? "20" + m1[3] : m1[3]);
    const map = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const mm = map[mon.slice(0, 3)];
    if (mm >= 0) return new Date(yy, mm, dd);
  }

  // dd-mm-yyyy
  const m2 = str.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/);
  if (m2) return new Date(Number(m2[3]), Number(m2[2]) - 1, Number(m2[1]));

  return null;
}

function parseMoneyLoose(text) {
  // picks last big amount like 64,900.00 or 30,000.00
  const t = String(text || "");
  const matches = t.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b/g);
  if (!matches || !matches.length) return 0;
  const last = matches[matches.length - 1];
  return Number(last.replace(/,/g, "")) || 0;
}

function detectTypeFromText(t) {
  const x = t.toLowerCase();
  if (x.includes("tax invoice")) return "SALE";
  if (x.includes("receipt voucher")) return "RECEIPT";
  if (x.includes("payment voucher")) return "PAYMENT";
  if (x.includes("debit note")) return "PURCHASE_RETURN";
  if (x.includes("credit note")) return "SALES_RETURN";
  if (x.includes("purchase")) return "PURCHASE"; // fallback
  return "";
}

function drcrForType(type) {
  const map = {
    SALE: "DR",
    PURCHASE: "CR",
    PAYMENT: "DR",
    RECEIPT: "CR",
    SALES_RETURN: "CR",
    PURCHASE_RETURN: "DR",
  };
  return map[type] || "";
}

function extractFromPdfText(text) {
  const raw = String(text || "");
  const type = detectTypeFromText(raw);

  // Voucher no patterns
  // Invoice No. STAR0006  (from your sample invoice) :contentReference[oaicite:0]{index=0}
    // ✅ Date (works for: Dated : 2-May-25)
  const datedStr =
    raw.match(/\bDated\b\s*:?\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})/i)?.[1] ||
    raw.match(/\bDate\b\s*:?\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})/i)?.[1] ||
    "";

  const dateObj = parseDateLoose(datedStr);

  // ✅ Voucher No (Receipt/Payment me "No. : 1" split hota hai)
  let voucherNo = "";

  if (type === "RECEIPT" || type === "PAYMENT") {
    // Receipt Voucher ... No. : 1
    voucherNo =
      raw.match(/\b(?:Receipt|Payment)\s+Voucher\b[\s\S]{0,120}?\bNo\.\s*:?\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      raw.match(/\bNo\.\s*:?\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      "";
  } else {
    // Invoice / Notes etc.
    voucherNo =
      raw.match(/\bInvoice\s*No\.\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      raw.match(/\bCredit\s*Note\s*No\.\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      raw.match(/\bDebit\s*Note\s*No\.\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      raw.match(/\bNo\.\s*:?\s*([0-9A-Za-z\/-]+)/i)?.[1] ||
      "";
  }

  voucherNo = norm(voucherNo);

  // Party extraction (best-effort)
  // Receipt voucher has "Account : Azad Fabrication" :contentReference[oaicite:3]{index=3}
  // Invoice has Buyer (Bill to) MAGMA STEEL :contentReference[oaicite:4]{index=4}
  let partyName =
    (raw.match(/Account\s*:\s*\n?\s*([A-Za-z0-9 &().,-]{3,})/i)?.[1]) ||
    (raw.match(/Buyer\s*\(Bill to\)\s*\n?\s*([A-Za-z0-9 &().,-]{3,})/i)?.[1]) ||
    "";

  partyName = norm(partyName);

  // Amount
  // Receipt amount 30,000.00 :contentReference[oaicite:5]{index=5}
  // Invoice total 64,900.00 :contentReference[oaicite:6]{index=6}
  const amount = parseMoneyLoose(raw);

  return {
    type,
    partyName,
    voucherNo,
    date: dateObj ? dateObj.toISOString().slice(0, 10) : "",
    amount,
    drcr: drcrForType(type),
    narration: "",
  };
}

// ✅ Scan PDF -> extract basic fields (autofill)

const uploadDisk = multer({
  dest: UPLOAD_DIR,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 50,
  },
});
// ✅ Scan Transaction PDF -> extract type, party, date, voucherNo, amount (LOCATION/HEADING BASED)
const uploadMem = multer({ storage: multer.memoryStorage() });

function cleanLines(text) {
  const raw = String(text || "").replace(/\r/g, "\n");
  return raw
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

function findAfterLabel(lines, labelRegex, stopRegex) {
  for (let i = 0; i < lines.length; i++) {
    const line = norm(lines[i]);

    if (labelRegex.test(line)) {
      // same line case: "Label : value"
      const same = line.match(/:\s*(.+)$/);
      if (same?.[1]) {
        const v = norm(same[1]);
        if (v && !(stopRegex && stopRegex.test(v))) return v;
      }

      // next lines (best-effort)
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const v = norm(lines[j]);
        if (!v || v === ":" || v === "-") continue;
        if (stopRegex && stopRegex.test(v)) break;

        // skip obvious meta headers
        if (
          /^(GSTIN|GSTIN\/UIN|State Name|Contact|E-Mail|Email|Through|Mode\/Terms|Destination|Materials|Sl|No\.|Rate|Amount|HSN|Bank)/i.test(
            v
          )
        )
          continue;

        return v;
      }
    }
  }
  return "";
}

function parseDateLooseAny(str) {
  const s = String(str || "");

  // 2-Feb-26 or 2-May-25 or 1-May-25
  let m = s.match(/\b(\d{1,2})-([A-Za-z]{3})-(\d{2,4})\b/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mon = m[2].toLowerCase();
    const yy = m[3].length === 2 ? "20" + m[3] : m[3];
    const map = { jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06", jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12" };
    const mm = map[mon.slice(0, 3)];
    if (mm) return `${yy}-${mm}-${dd}`;
  }

  // 02-02-2026 / 2-5-2025
  m = s.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yy = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${yy}-${mm}-${dd}`;
  }

  return "";
}

function moneyToNumber(s) {
  // Supports:
  // 4,69,140.00 (Indian) | 6,74,800.00 (Indian) | 590000.00 | 60,200.00 (western)
  const str = String(s || "");

  // prefer decimal amounts first (safer)
  const mDec = str.match(/\b\d[\d,]*\.\d{2}\b/);
  if (mDec?.[0]) {
    return Number(mDec[0].replace(/,/g, "")) || 0;
  }

  // fallback integer (only if needed)
  const mInt = str.match(/\b\d[\d,]*\b/);
  if (mInt?.[0]) {
    return Number(mInt[0].replace(/,/g, "")) || 0;
  }

  return 0;
}

function pickTotalAmount(lines, type = "") {
  const safeLines = (lines || []).map((x) => String(x || "").trim()).filter(Boolean);

  const getDecimals = (s) => {
    return String(s || "").match(/\b\d[\d,]*\.\d{2}\b/g) || [];
  };

  const toNum = (s) => Number(String(s || "").replace(/,/g, "")) || 0;

  const pickLastDecimal = (s) => {
    const arr = getDecimals(s);
    if (!arr.length) return 0;
    return toNum(arr[arr.length - 1]);
  };

  // 1) BEST PRIORITY: exact final total style lines
  // Example: "Total 6,900.0 Kg ... 4,55,952.00"
  for (let i = safeLines.length - 1; i >= 0; i--) {
    const l = safeLines[i];
    const low = l.toLowerCase();

    if (/^total\b/.test(low) && !/tax amount|taxable|grand total of tax/i.test(low)) {
      const amt = pickLastDecimal(l);
      if (amt > 0) return amt;
    }
  }

  // 2) STRONG LABELS
  const strongLabels = [
    "grand total",
    "invoice value",
    "total invoice value",
    "amount payable",
    "net payable",
    "net amount",
    "voucher amount",
    "receipt amount",
    "payment amount",
    "total amount",
  ];

  for (let i = safeLines.length - 1; i >= 0; i--) {
    const l = safeLines[i];
    const low = l.toLowerCase();

    if (strongLabels.some((k) => low.includes(k))) {
      const amt = pickLastDecimal(l);
      if (amt > 0) return amt;
    }
  }

  // 3) PURCHASE / SALE document pattern:
  // take the first usable "Total ..." from bottom which usually carries final invoice total
  if (type === "PURCHASE" || type === "SALE") {
    for (let i = safeLines.length - 1; i >= 0; i--) {
      const l = safeLines[i];
      const low = l.toLowerCase();

      if (
        low.includes("total") &&
        !low.includes("taxable") &&
        !low.includes("tax amount") &&
        !low.includes("cgst") &&
        !low.includes("sgst") &&
        !low.includes("igst")
      ) {
        const amt = pickLastDecimal(l);
        if (amt > 0) return amt;
      }
    }
  }

  // 4) RECEIPT / PAYMENT exact account-side amount if available
  if (type === "RECEIPT" || type === "PAYMENT") {
    for (let i = 0; i < safeLines.length; i++) {
      const l = safeLines[i];
      const low = l.toLowerCase();

      if (
        low.startsWith("account") ||
        low.includes("received from") ||
        low.includes("paid to") ||
        low.includes("payment advice")
      ) {
        const vals = getDecimals(l);
        if (vals.length) return toNum(vals[vals.length - 1]);
      }
    }
  }

  // 5) LAST SAFE FALLBACK:
  // choose the biggest decimal from lower half of document,
  // but ignore tax-table totals when possible
  const candidateLines = safeLines.slice(Math.floor(safeLines.length / 2));

  let max = 0;
  for (const l of candidateLines) {
    const low = l.toLowerCase();

    if (
      low.includes("tax amount") ||
      low.includes("cgst") ||
      low.includes("sgst") ||
      low.includes("igst")
    ) {
      continue;
    }

    const vals = getDecimals(l);
    for (const v of vals) {
      const n = toNum(v);
      if (n > max) max = n;
    }
  }

  return max;
}
function findInvoiceAndEway(lines) {
  const full = lines.join(" ");

  // ✅ STRICT: SERVICE INDIA ke baad digit MUST (prevents SERVICEINDIA / SERVICECOMPANY etc)
  const invoiceMatch = full.match(/\b(SERV(?=\d)[A-Z0-9\/-]{3,20})\b/i);
  const invoiceNo = invoiceMatch ? invoiceMatch[1].toUpperCase() : "";

  // ✅ e-way strictly 12 digits
  const eWayMatch = full.match(/\b(\d{12})\b/);
  const eWayBillNo = eWayMatch ? eWayMatch[1] : "";

  return { invoiceNo, eWayBillNo };
}
function detectDocType(lines, compactLower) {
  // HEADINGS-based detect (most reliable)
  const head = (lines.slice(0, 15).join(" ") + " " + compactLower).toLowerCase();

  if (head.includes("tax invoice")) return "SALE";                       // :contentReference[oaicite:1]{index=1}
  if (head.includes("receipt voucher")) return "RECEIPT";                 // :contentReference[oaicite:2]{index=2}
  if (head.includes("payment advice")) return "PAYMENT";                  // :contentReference[oaicite:3]{index=3}
  if (head.includes("supplier invoice record copy")) return "PURCHASE";   // :contentReference[oaicite:4]{index=4}
  if (head.includes("purchase return") || head.includes("debit note")) return "PURCHASE_RETURN"; // :contentReference[oaicite:5]{index=5}
  if (head.includes("sales return") || head.includes("credit note")) return "SALES_RETURN";     // :contentReference[oaicite:6]{index=6}

  // fallback keywords
  if (head.includes("credit note")) return "SALES_RETURN";
  if (head.includes("debit note")) return "PURCHASE_RETURN";
  if (head.includes("receipt")) return "RECEIPT";
  if (head.includes("payment")) return "PAYMENT";
  if (head.includes("purchase")) return "PURCHASE";
  if (head.includes("invoice")) return "SALE";

  return "SALE";
}
function codeFromFilename(keyword, originalName) {
  const fname = String(originalName || "").trim();
  if (!fname) return "";

  const base = fname.split(/[\\/]/).pop().replace(/\.pdf$/i, "");

  // keyword ko normalize
  const k = String(keyword || "")
    .toLowerCase()
    .replace(/\s+/g, "[_\\-\\s]*"); // debit note / debit_note / debit-note sab match

  // Examples:
  // "DebitNote_12.pdf" -> 12
  // "Debit Note-DBN001.pdf" -> DBN001
  // "debit_note DBN001 any.pdf" -> DBN001
  const re = new RegExp("^" + k + "[_\\-\\s]*([A-Za-z0-9]+)\\b", "i");
  const m = base.match(re);

  return m?.[1] ? String(m[1]).trim().toUpperCase() : "";
}
function paymentCodeFromFilename(originalName) {
  const fname = String(originalName || "").trim();
  if (!fname) return "";

  // remove path + extension
  const base = fname.split(/[\\/]/).pop().replace(/\.pdf$/i, "");

  // Payment_2  / Payment-PMT092 / Payment PMT092 / PAYMENT_PMT092_anything
  const m =
    base.match(/^payment[_\-\s]*([A-Za-z0-9]+)\b/i) ||      // Payment_2 / Payment_PMT092
    base.match(/\bpayment[_\-\s]+([A-Za-z0-9]+)\b/i);       // fallback

  if (!m) return "";
  return String(m[1] || "").trim().toUpperCase();
}
function sanitizeVoucherNo(v) {
  let s = String(v || "").trim().toUpperCase(); // ✅ FIRST define

    // ✅ EXTRA SAFETY: STAR ke baad digit nahi hai to reject
  if (/^SERV(?!\d)/.test(s)) return "";

  // ✅ reject common wrong tokens
  if (s === "EWAY" || s === "E-WAY" || s === "EWAYBILL") return "";

  // remove any 12-digit eway if it got glued into invoice no
  s = s.replace(/\b\d{12}\b/g, "");

  // keep only clean chars
  s = s.replace(/[^A-Z0-9\/-]/g, "");

  // reject pure 12-digit numbers
  if (/^\d{12}$/.test(s)) return "";

  // cap length (your rule: 10-12 max)
  if (s.length > 12) s = s.slice(0, 12);

  return s.trim();
}
function saleCodeFromFilename(originalName) {
  const fname = String(originalName || "").trim();
  if (!fname) return "";

  // remove path + extension
  const base = fname.split(/[\\/]/).pop().replace(/\.pdf$/i, "");

  // Sales_0006 / Sales-STAR0006 / Sales STAR0006 / SALES_STAR0006_anything
  const m =
    base.match(/^sales[_\-\s]+(.+)$/i) ||      // starts with Sales_
    base.match(/\bsales[_\-\s]+(.+)\b/i);      // contains Sales_

  if (!m?.[1]) return "";

  // take first token after Sales_ (stop at space)
  let code = String(m[1]).trim().split(/\s+/)[0];

  // clean
  code = code.replace(/[^A-Za-z0-9\/-]/g, "").toUpperCase();

  // optional length cap
  if (code.length > 20) code = code.slice(0, 20);

  return code;
}
function pickVoucherNo(type, lines, compact, originalName) {
  const t = compact;

    function receiptCodeFromFilename(originalName) {
    const fname = String(originalName || "").trim();
    if (!fname) return "";
    const base = fname.split(/[\\/]/).pop().replace(/\.pdf$/i, "");

    // Receipt_2 / Receipt-2 / Receipt 2
    const m = base.match(/^receipt[_\-\s]*([A-Za-z0-9]+)\b/i);
    return m?.[1] ? String(m[1]).trim() : "";
  }

  // ✅ ADD THIS BLOCK
  if (type === "RECEIPT") {
    // 1) FIRST PRIORITY: filename Receipt_2.pdf -> 2
    const fromFile = receiptCodeFromFilename(originalName);
    if (fromFile) return norm(fromFile);

    // 2) SECOND PRIORITY: PDF text "No. : 2"
    const fromText =
      t.match(/\bReceipt\s+Voucher\b[\s\S]{0,120}?\bNo\.\s*:?\s*([A-Z0-9\-\/]+)/i)?.[1] ||
      t.match(/\bNo\.\s*:?\s*([0-9A-Za-z\/-]+)\b/i)?.[1] ||
      "";

    return norm(fromText);
  }
if (type === "SALE") {
  // ✅ FORCE: always from filename only (Sales_<billno>.pdf)
  const fromFile = saleCodeFromFilename(originalName);
  if (fromFile) return fromFile;

  // ✅ If filename rule not followed, return empty (front-end can show error)
  return "";
}

function receiptCodeFromFilename(originalName) {
  const fname = String(originalName || "").trim();
  if (!fname) return "";
  const base = fname.split(/[\\/]/).pop().replace(/\.pdf$/i, "");

  // Receipt_2 / Receipt-2 / Receipt 2
  const m = base.match(/^receipt[_\-\s]*([A-Za-z0-9]+)\b/i);
  return m?.[1] ? String(m[1]).trim() : "";
}

  if (type === "PAYMENT") {
  // ✅ 1) FIRST PRIORITY: filename Payment_2.pdf -> 2
  const fname = String(originalName || "");
  const mFile = fname.match(/payment[_\-\s]+([A-Za-z0-9]+)(?=\.pdf$|$)/i);
  if (mFile?.[1]) return norm(mFile[1]);

  // ✅ 2) SECOND PRIORITY: PDF text (only if filename didn't contain code)
  const fromText =
    t.match(/\bAdvice\s*No\.?\s*:?\s*([A-Z0-9\-\/]+)/i)?.[1] ||
    "";

  if (fromText) return norm(fromText);

  return "";
}

  if (type === "PURCHASE") {
    return (
      t.match(/\bSupplier Invoice No\.\s*&\s*Date\.\s*([A-Z0-9\-\/]+)\b/i)?.[1] ||
      t.match(/\bSupplier Invoice No\.\s*([A-Z0-9\-\/]+)\b/i)?.[1] ||
      t.match(/\bInvoice No\.\s*([A-Z0-9\-\/]+)\b/i)?.[1] ||
      ""
    );
  }

  if (type === "PURCHASE_RETURN") {
    const fromFile =
      codeFromFilename("debit note") ||
      codeFromFilename("debitnote") ||
      codeFromFilename("debit_note");
    if (fromFile) return norm(fromFile);

    const fromText =
      t.match(/\bDebit\s*Note\s*No\.?\s*:?\s*([A-Z0-9\/-]+)\b/i)?.[1] || "";

    return norm(fromText);
  }

  if (type === "SALES_RETURN") {
  // handle: "Credit Note No.  Dated" next line => "2 2-Mar-26"
  for (let i = 0; i < lines.length; i++) {
    const l = norm(lines[i]).toLowerCase();
    if (l.includes("credit note") && l.includes("no")) {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const v = norm(lines[j]);
        if (!v) continue;

        const parts = v.split(/\s+/).filter(Boolean);
        const first = parts[0] || "";
        if (first) return norm(first);
      }
    }
  }

  // fallback (same-line pattern if ever present)
  return compact.match(/\bCredit\s*Note\s*No\.?\s*:?\s*([A-Z0-9\-\/]+)\b/i)?.[1] || "";
}
  return "";
}

function pickDate(type, lines, compact, originalName) {
  const text = String(compact || "");
  const textLower = text.toLowerCase();

  // helper: parse and return ISO
  const toIso = (raw) => {
    const iso = parseDateLooseAny(raw || "");
    return iso || "";
  };

  // helper: exact label based match from full compact text
  const findByLabel = (...patterns) => {
    for (const re of patterns) {
      const m = text.match(re);
      if (m?.[1]) {
        const iso = toIso(m[1]);
        if (iso) return iso;
      }
    }
    return "";
  };

  // helper: find date in nearby lines after a heading/label
  const findNearLine = (labelRegex, maxAhead = 5) => {
    for (let i = 0; i < lines.length; i++) {
      const line = String(lines[i] || "").trim();

      if (labelRegex.test(line)) {
        // same line
        const same = line.match(/(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
        if (same?.[1]) {
          const iso = toIso(same[1]);
          if (iso) return iso;
        }

        // next few lines
        for (let j = i + 1; j < Math.min(i + 1 + maxAhead, lines.length); j++) {
          const next = String(lines[j] || "").trim();
          const m = next.match(/(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
          if (m?.[1]) {
            const iso = toIso(m[1]);
            if (iso) return iso;
          }
        }
      }
    }
    return "";
  };

  // =========================
  // TYPE-WISE PRIORITY
  // =========================

  if (type === "PAYMENT") {
    // Payment Advice me voucher date ke liye header Date ko priority do
    // ignore Bill Date / Dt in payment details
    return (
      findByLabel(
        /\bPayment Advice\b[\s\S]{0,300}?\bDate\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bPayment Advice\b[\s\S]{0,300}?\bDate\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i,
        /\bDate\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bDate\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i
      ) ||
      findNearLine(/^Date\s*:?$/i) ||
      ""
    );
  }

  if (type === "RECEIPT") {
    return (
      findByLabel(
        /\bReceipt Voucher\b[\s\S]{0,200}?\bDated\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bReceipt Voucher\b[\s\S]{0,200}?\bDated\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i,
        /\bDated\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i
      ) ||
      findNearLine(/^Dated\s*:?$/i) ||
      ""
    );
  }

  if (type === "PURCHASE_RETURN" || type === "SALES_RETURN") {
    // Debit/Credit note me Dated line priority
    return (
      findByLabel(
        /\bDated\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bDated\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i
      ) ||
      findNearLine(/^Dated\s*:?$/i, 6) ||
      ""
    );
  }

  if (type === "SALE" || type === "PURCHASE") {
    return (
      findByLabel(
        /\bDated\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bDated\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i,
        /\bInvoice Date\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
        /\bInvoice Date\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i
      ) ||
      findNearLine(/^Dated\s*:?$/i, 6) ||
      findNearLine(/^Invoice Date\s*:?$/i, 4) ||
      ""
    );
  }

  // =========================
  // GENERIC FALLBACK (LAST)
  // =========================

  return (
    findByLabel(
      /\bDated\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
      /\bDated\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i,
      /\bDate\s*:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{2,4})\b/i,
      /\bDate\s*:\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})\b/i
    ) ||
    findNearLine(/^Dated\s*:?$/i, 6) ||
    findNearLine(/^Date\s*:?$/i, 4) ||
    ""
  );
}

function stripTrailingAmount(s) {
  return String(s || "")
    .replace(/\s+\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function pickParty(type, lines, compact) {
  // ✅ RECEIPT: "Account : <Party>" (often amount also in same line)
  if (type === "RECEIPT") {
    const mSame = compact.match(/\bAccount\s*:\s*([A-Za-z0-9 &().,-]{3,})/i);
    if (mSame?.[1]) return stripTrailingAmount(norm(mSame[1]));

    const nextLine = findAfterLabel(lines, /^Account\s*:\s*$/i) || findAfterLabel(lines, /^Account\b/i);
    if (nextLine) return stripTrailingAmount(norm(nextLine));

    return "";
  }
  // ✅ PAYMENT: "Payment Advice M/s. <Party>" or Account:
  if (type === "PAYMENT") {
    const m = compact.match(/\bPayment Advice\s+M\/s\.\s*([A-Za-z0-9 &().,-]{3,})/i);
    if (m?.[1]) return stripTrailingAmount(norm(m[1]));

    const mSame = compact.match(/\bAccount\s*:\s*([A-Za-z0-9 &().,-]{3,})/i);
    if (mSame?.[1]) return stripTrailingAmount(norm(mSame[1]));

    const nextLine = findAfterLabel(lines, /^Account\s*:\s*$/i) || findAfterLabel(lines, /^Account\b/i);
    if (nextLine) return stripTrailingAmount(norm(nextLine));

    return "";
  }

  // ✅ SALE: Buyer (Bill to)
  if (type === "SALE") {
    return stripTrailingAmount(findAfterLabel(lines, /^Buyer\s*\(Bill to\)/i) || "");
  }

  // ✅ PURCHASE: Supplier (Bill from)
  if (type === "PURCHASE") {
    return stripTrailingAmount(findAfterLabel(lines, /^Supplier\s*\(Bill from\)/i) || "");
  }

  // ✅ Credit/Debit Note => Buyer (Bill to)
  if (type === "PURCHASE_RETURN" || type === "SALES_RETURN") {
    return stripTrailingAmount(findAfterLabel(lines, /^Buyer\s*\(Bill to\)/i) || "");
  }

  // fallback
  const mAny = compact.match(/\bAccount\s*:\s*([A-Za-z0-9 &().,-]{3,})/i);
  if (mAny?.[1]) return stripTrailingAmount(norm(mAny[1]));

  return "";
}
function pickReceiptAmount(lines) {
  // find "Account :" then next lines contain "PartyName 4,69,140.00"
  for (let i = 0; i < lines.length; i++) {
    const l = norm(lines[i]).toLowerCase();
    if (l === "account :" || l === "account:") {
      // scan next 5 lines for decimal amount
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const v = String(lines[j] || "");
        const m = v.match(/\b\d[\d,]*\.\d{2}\b/);
        if (m?.[0]) return moneyToNumber(m[0]);
      }
    }
  }
  return 0;
}

function extractFromPdfSmart(parsedText, originalName) {
  const lines = cleanLines(parsedText);
  const compact = norm(lines.join(" "));
  const compactLower = compact.toLowerCase();

  const type = detectDocType(lines, compactLower);
  const partyName = pickParty(type, lines, compact);
  const voucherNo = pickVoucherNo(type, lines, compact, originalName);
  const date = pickDate(type, lines, compact, originalName);

let amount = 0;

if (type === "RECEIPT") {
  amount = pickReceiptAmount(lines) || pickTotalAmount(lines, type);
} else {
  amount = pickTotalAmount(lines, type);
}

  const { eWayBillNo } =
    type === "SALE" ? findInvoiceAndEway(lines) : { eWayBillNo: "" };

  return { type, partyName, voucherNo, eWayBillNo: eWayBillNo || "", date, amount: Number(amount || 0), drcr: drcrForType(type), narration: "" };
}
app.post("/transactions/scan", uploadMem.single("pdf"), async (req, res) => {
  try {
    if (!pdfParse) return res.status(500).json({ message: "pdf-parse not installed" });
    if (!req.file?.buffer) return res.status(400).json({ message: "PDF missing" });

    const parsed = await pdfParse(req.file.buffer);

    const rawText = String(parsed?.text || "");
    const ex = extractFromPdfSmart(rawText, req.file?.originalname || "");

    // ✅ FORCE: SALE voucherNo always from filename Sales_<billno>.pdf
    if (ex.type === "SALE" && !ex.voucherNo) {
      return res.status(400).json({
        message: 'SALE scan failed: filename must be like "Sales_<BillNo>.pdf"',
        filename: req.file?.originalname || "",
      });
    }

    return res.json({
      ok: true,
      extracted: {
        type: ex.type,
        partyName: ex.partyName || "",
        date: ex.date || "",               // ✅ FIX: isoDate removed, use ex.date
        voucherNo: ex.voucherNo || "",
        eWayBillNo: ex.eWayBillNo || "",
        amount: ex.amount ? String(Number(ex.amount).toFixed(2)) : "",
        drcr: ex.drcr || drcrForType(ex.type),
        narration: ex.narration || "",
        rawTextPreview: rawText.slice(0, 400),
      },
    });
  } catch (e) {
    console.error("SCAN ERROR:", e);
    res.status(500).json({ message: e.message || "Scan failed" });
  }
});
/* =========================
   TRANSACTIONS + PDFs
========================= */


// list (admin side)
app.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const { partyId, from, to, q } = req.query;

    const where = {};
    if (partyId) where.partyId = Number(partyId);
    if (from && to) where.date = { gte: new Date(from), lte: new Date(to) };
    if (q) {
      where.OR = [
        { voucherNo: { contains: String(q) } },
        { narration: { contains: String(q) } },
      ];
    }

    const txns = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { pdfs: true },
    });

    res.json(txns);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "List failed", details: String(e.message || e) });
  }
});
function normVoucher(v) {
  return String(v || "").trim().toUpperCase();
}

// Same-day range (timezone safe)
function dayRange(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
// create txn (+ pdfs)
// create txn (+ pdfs) + AUTO EMAIL
app.post("/transactions", requireAdmin, uploadDisk.array("pdfs"), async (req, res) => {
  try {
        let processedFiles = req.files || [];
    const { type, voucherNo, date, amount, drcr, narration, partyId, sendEmail } = req.body;
    const fixedDrCrByType = {
  SALE: "DR",
  PURCHASE: "CR",
  PAYMENT: "DR",
  RECEIPT: "CR",
  SALES_RETURN: "CR",
  PURCHASE_RETURN: "DR",
  JOURNAL_DR: "DR",
  JOURNAL_CR: "CR",
};

const normalizedType = String(type || "").trim().toUpperCase();
const fixedDrCr = fixedDrCrByType[normalizedType];

if (!fixedDrCr) {
  return res.status(400).json({ message: "Invalid transaction type" });
}

if ((normalizedType === "JOURNAL_DR" || normalizedType === "JOURNAL_CR") && !String(narration || "").trim()) {
  return res.status(400).json({ message: "Narration required for journal entry" });
}

    // ✅ meta from frontend (FormData -> string)
    let meta = {};
    try {
      meta = req.body.meta ? JSON.parse(req.body.meta) : {};
    } catch {
      meta = {};
    }
    // ✅ DUPLICATE CHECK: voucherNo + date(same day) + type + partyId
    const vNo = normVoucher(voucherNo);
    const tType = normalizedType;
    const pId = Number(partyId);

    if (!vNo || !tType || !date || !pId) {
      return res.status(400).json({ message: "voucherNo, type, date, partyId required" });
    }

    const range = dayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const dup = await prisma.transaction.findFirst({
      where: {
        partyId: pId,
        voucherNo: vNo,
        type: tType,
        date: { gte: range.start, lte: range.end }, // same day
      },
      select: { id: true, voucherNo: true, type: true, date: true },
    });

    if (dup) {
      return res.status(409).json({
        message: `Duplicate transaction: same Voucher No + Date + Type already exists`,
        duplicate: {
          id: dup.id,
          voucherNo: dup.voucherNo,
          type: dup.type,
          date: dup.date,
        },
      });
    }
    const txn = await prisma.transaction.create({
data: {
  type: tType,
  voucherNo: vNo,
  date: new Date(date),
  amount: Number(amount),
  drcr: fixedDrCr,
  narration: narration || null,
  partyId: Number(partyId),
  createdById: 1,
},
    });

if (processedFiles.length) {
  const finalFiles = [];

  for (const file of processedFiles) {
    const finalFile = await maybeCompressPdf(file);
    finalFiles.push(finalFile);

    const uploaded = await uploadFileToSupabase(
      finalFile,
      `txn/${txn.id}`
    );

    await prisma.transactionPDF.create({
      data: {
        transactionId: txn.id,
        filePath: uploaded.storagePath,   // ✅ supabase path save hoga
        originalName: uploaded.originalName,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      },
    });

    // local temp file delete after supabase upload
    if (finalFile.path && fs.existsSync(finalFile.path)) {
      try { fs.unlinkSync(finalFile.path); } catch {}
    }
  }

  processedFiles = finalFiles;
}

    // ✅ respond immediately (never block)
    const shouldSend =
  sendEmail === undefined
    ? true
    : (String(sendEmail) === "true" || String(sendEmail) === "1");

// ✅ respond immediately (never block)
res.json({ ok: true, txn, emailQueued: shouldSend });

if (!shouldSend) return; // ✅ skip sending

    // ✅ background email
    setImmediate(async () => {
      try {
        const party = await prisma.user.findUnique({
          where: { id: Number(partyId) },
          select: { id: true, name: true, email: true, gstin: true },
        });

        if (!party?.email) {
          console.warn("⚠️ PARTY EMAIL missing, skip send");
          return;
        }

        // build meta defaults from txn as well
const amt2 = Number(amount || 0).toFixed(2);
const drcr2 = String(drcr || "").toUpperCase();          // "DR" / "CR"
const narration2 = String(narration || "").trim();

const meta2 = {
  ...meta,

  // common
  voucherNo: voucherNo || "",
  VoucherNo: voucherNo || "",           // ✅ template uses {{VoucherNo}}
  date: date || "",
  advice_date: date || "",              // ✅ template uses {{advice_date}}
  amount: amt2,
  total_amount: amt2,                   // ✅ template uses {{total_amount}}

  // ✅ journal must-have
  drcr: drcr2,
  DRCR: drcr2,
  narration: narration2,

  // ✅ bank-style summary (we'll add placeholder in template)
  summary_line: (() => {
    const verb = drcr2 === "DR" ? "debited" : drcr2 === "CR" ? "credited" : "updated";
    const nar = narration2 ? ` on account of "${narration2}"` : "";
    return `Your A/c has been ${verb} with ₹ ${amt2}${nar}.`;
  })(),
};

        const html = buildTxnEmailHTML(type, meta2, party);

        const pdfRows = await prisma.transactionPDF.findMany({
  where: { transactionId: txn.id },
  orderBy: { id: "asc" },
});

const attachments = [];
for (const p of pdfRows) {
  attachments.push(await fileToResendAttachmentFromStorage(p));
}

        await resend.emails.send({
          from: RESEND_FROM_FMT,
          to: party.email,
          subject: subjectForType(type, meta2),
          html,
          attachments: attachments.length ? attachments : undefined,
        });

        console.log("✅ TXN EMAIL SENT:", party.email, "type:", type);
      } catch (e) {
        console.error("❌ TXN EMAIL FAILED:", e?.message || e);
      }
    });
  } catch (e) {
    console.error("CREATE TXN ERROR:", e);
    return res.status(500).json({ message: "Create txn failed", details: String(e.message || e) });
  }
});
// ✅ Resend transaction email with existing PDFs (eye button)
app.post("/transactions/:id/send-email", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const txn = await prisma.transaction.findUnique({
      where: { id },
      include: { pdfs: true },
    });
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const party = await prisma.user.findUnique({
      where: { id: Number(txn.partyId) },
      select: { id: true, name: true, email: true, gstin: true },
    });
    if (!party?.email) return res.status(400).json({ message: "Party email missing" });

    res.json({ ok: true, queued: true });

    setImmediate(async () => {
      try {
        const amt2 = Number(txn.amount || 0).toFixed(2);
        const drcr2 = String(txn.drcr || "").toUpperCase();
        const narration2 = String(txn.narration || "").trim();

        const meta2 = {
          voucherNo: txn.voucherNo || "",
          VoucherNo: txn.voucherNo || "",
          date: txn.date ? txn.date.toISOString().slice(0, 10) : "",
          advice_date: txn.date ? txn.date.toISOString().slice(0, 10) : "",
          amount: amt2,
          total_amount: amt2,
          drcr: drcr2,
          DRCR: drcr2,
          narration: narration2,
          summary_line: (() => {
            const verb = drcr2 === "DR" ? "debited" : drcr2 === "CR" ? "credited" : "updated";
            const nar = narration2 ? ` on account of "${narration2}"` : "";
            return `Your A/c has been ${verb} with ₹ ${amt2}${nar}.`;
          })(),
        };

        const html = buildTxnEmailHTML(txn.type, meta2, party);

const attachments = [];
for (const p of txn.pdfs || []) {
  try {
    attachments.push(await fileToResendAttachmentFromStorage(p));
  } catch (err) {
    console.error("ATTACHMENT LOAD FAILED:", p.filePath, err.message || err);
  }
}

        await resend.emails.send({
          from: RESEND_FROM_FMT,
          to: party.email,
          subject: subjectForType(txn.type, meta2),
          html,
          attachments: attachments.length ? attachments : undefined,
        });

        console.log("✅ TXN RESENT:", party.email, "txn:", txn.id);
      } catch (e) {
        console.error("❌ TXN RESEND FAILED:", e?.message || e);
      }
    });
  } catch (e) {
    console.error("TXN RESEND ERROR:", e);
    res.status(500).json({ message: "Resend failed", details: String(e.message || e) });
  }
});
// update txn
app.put("/transactions/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};

    const fixedDrCrByType = {
      SALE: "DR",
      PURCHASE: "CR",
      PAYMENT: "DR",
      RECEIPT: "CR",
      SALES_RETURN: "CR",
      PURCHASE_RETURN: "DR",
      JOURNAL_DR: "DR",
      JOURNAL_CR: "CR",
    };

    const normalizedType = String(body.type || "").trim().toUpperCase();
    const fixedDrCr = fixedDrCrByType[normalizedType];

    if (!fixedDrCr) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    if (
      (normalizedType === "JOURNAL_DR" || normalizedType === "JOURNAL_CR") &&
      !String(body.narration || "").trim()
    ) {
      return res.status(400).json({ error: "Narration required for journal entry" });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: normalizedType,
        voucherNo: body.voucherNo,
        date: new Date(body.date),
        amount: Number(body.amount),
        drcr: fixedDrCr,
        narration: body.narration || null,
        partyId: Number(body.partyId),
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Update failed", details: String(e.message || e) });
  }
});

// delete txn (+ delete pdf records + files)
app.delete("/transactions/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

const pdfs = await prisma.transactionPDF.findMany({ where: { transactionId: id } });

for (const p of pdfs) {
  await deleteFromSupabase(p.filePath);
}

await prisma.transactionPDF.deleteMany({ where: { transactionId: id } });

    await prisma.transaction.delete({ where: { id } });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Delete failed", details: String(e.message || e) });
  }
});

// add pdfs to existing txn
app.post("/transactions/:id/pdfs", requireAdmin, uploadDisk.array("pdfs"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const txn = await prisma.transaction.findUnique({ where: { id } });
    if (!txn) return res.status(404).json({ error: "Transaction not found" });

    const created = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const finalFile = await maybeCompressPdf(file);

        const uploaded = await uploadFileToSupabase(
          finalFile,
          `transactions/${id}`
        );

        const p = await prisma.transactionPDF.create({
          data: {
            transactionId: id,
            filePath: uploaded.storagePath,
            originalName: uploaded.originalName,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
          },
        });

        created.push(p);

        if (finalFile.path && fs.existsSync(finalFile.path)) {
          try { fs.unlinkSync(finalFile.path); } catch {}
        }
      }
    }

    const pdfs = await prisma.transactionPDF.findMany({
      where: { transactionId: id },
    });

    res.json({ ok: true, added: created.length, pdfs });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "PDF add failed", details: String(e.message || e) });
  }
});

// remove pdf from txn
app.delete("/transactions/:id/pdfs/:pdfId", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pdfId = Number(req.params.pdfId);

    const pdf = await prisma.transactionPDF.findFirst({
      where: { id: pdfId, transactionId: id },
    });
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

await deleteFromSupabase(pdf.filePath);
await prisma.transactionPDF.delete({ where: { id: pdfId } });

    const pdfs = await prisma.transactionPDF.findMany({ where: { transactionId: id } });
    res.json({ ok: true, pdfs });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "PDF delete failed", details: String(e.message || e) });
  }
});

/* =========================
   SECURE PDF ROUTE (CUSTOMER ONLY)
========================= */
app.get("/pdfs/:pdfId", async (req, res) => {
  try {
    const pdfId = Number(req.params.pdfId);

    // ✅ allow both ADMIN and CUSTOMER via Bearer token (or ?token=)
    const auth = req.headers.authorization || "";
    const headerToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const queryToken = req.query?.token ? String(req.query.token) : null;
    const token = headerToken || queryToken;

    if (!token) return res.status(401).send("Unauthorized");

    const payload = jwt.verify(token, JWT_SECRET);

    const pdf = await prisma.transactionPDF.findUnique({
      where: { id: pdfId },
      include: { transaction: true },
    });

    if (!pdf) return res.status(404).send("Not found");

    // ✅ CUSTOMER can only view own party PDFs
    if (payload.role === "CUSTOMER") {
      if (!pdf.transaction || pdf.transaction.partyId !== payload.id) {
        return res.status(403).send("Forbidden");
      }
    }

    // ✅ ADMIN can view all (no extra check)
    if (payload.role !== "ADMIN" && payload.role !== "CUSTOMER") {
  return res.status(403).send("Forbidden");
}
const fileBuffer = await downloadFromSupabase(pdf.filePath);

res.setHeader("Content-Type", pdf.mimeType || "application/pdf");
res.setHeader(
  "Content-Disposition",
  `inline; filename="${String(pdf.originalName || "document.pdf").replace(/"/g, "")}"`
);

return res.send(fileBuffer);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Failed");
  }
});
function getFinancialYearRange(baseDate = new Date()) {
  const d = new Date(baseDate);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based
  const fyStartYear = month >= 3 ? year : year - 1;

  const from = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

function parseDateRangeOrFY(from, to) {
  if (from && to) {
    const fromDate = new Date(String(from));
    const toDate = new Date(String(to));
    toDate.setHours(23, 59, 59, 999);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return null;
    }

    return { fromDate, toDate };
  }

  const fy = getFinancialYearRange();
  return { fromDate: fy.from, toDate: fy.to };
}
/* =========================
   LEDGER HELPERS
========================= */
function signedAmount(txn) {
  return txn.drcr === "DR" ? Number(txn.amount) : -Number(txn.amount);
}

// STRICT To/By rule (your rule)
function particulars(txn) {
  const isDr = txn.drcr === "DR";
  const prefix = isDr ? "To" : "By";

  if (txn.type === "JOURNAL_DR" || txn.type === "JOURNAL_CR" || txn.type === "JOURNAL") {
    return `${prefix} ${txn.narration || "Journal"}`;
  }

  const map = {
    SALE: "Sales",
    SALES_RETURN: "Sales Return",
    PURCHASE: "Purchase",
    PURCHASE_RETURN: "Purchase Return",
    PAYMENT: "Payment",
    RECEIPT: "Receipt",
  };

  return `${prefix} ${map[txn.type] || txn.type}`;
}
function voucherTypeLabel(type) {
  const map = {
    SALE: "Sale",
    SALES_RETURN: "Sales Return",
    PURCHASE: "Purchase",
    PURCHASE_RETURN: "Purchase Return",
    PAYMENT: "Payment",
    RECEIPT: "Receipt",
    JOURNAL_DR: "Journal (Dr.)",
    JOURNAL_CR: "Journal (Cr.)",
  };
  return map[type] || String(type || "");
}
function fmtDate(d) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mmm = months[dt.getMonth()];
  const yy = dt.getFullYear();
  return `${dd}-${mmm}-${yy}`;
}

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function balText(v) {
  const n = Number(v || 0);
  if (n > 0) return `${money(n)} Dr`;
  if (n < 0) return `${money(Math.abs(n))} Cr`;
  return "";
}

/* =========================
   LEDGER (JSON)
========================= */
app.get("/ledger/:partyId", requireAdminOrSameCustomer, async (req, res) => {
  const { partyId } = req.params;
  const { from, to } = req.query;

  if (!from || !to) return res.status(400).json({ error: "from and to required" });

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const party = await prisma.user.findUnique({ where: { id: Number(partyId) } });
  if (!party) return res.status(404).json({ error: "Not found" });

  const beforeTxns = await prisma.transaction.findMany({
    where: { partyId: Number(partyId), date: { lt: fromDate } },
    orderBy: { date: "asc" },
  });

  let opening =
    party.openingType === "DR"
      ? Number(party.openingAmount || 0)
      : -Number(party.openingAmount || 0);

  for (const txn of beforeTxns) opening += signedAmount(txn);

  const txns = await prisma.transaction.findMany({
    where: { partyId: Number(partyId), date: { gte: fromDate, lte: toDate } },
    orderBy: { date: "asc" },
    include: { pdfs: true },
  });

  let running = opening;

  const rows = txns.map((txn) => {
    running += signedAmount(txn);
    return {
      date: txn.date,
      voucherNo: txn.voucherNo,
      voucherType: voucherTypeLabel(txn.type),
      particulars: particulars(txn),
      dr: txn.drcr === "DR" ? txn.amount : 0,
      cr: txn.drcr === "CR" ? txn.amount : 0,
      runningBalance: running,
      runningBalanceText: balText(running),
      pdfs: (txn.pdfs || []).map((p) => ({
        name: p.originalName,
        url: `/pdfs/${p.id}`,
      })),
    };
  });

  res.json({
    opening,
    openingText: balText(opening),
    closing: running,
    closingText: balText(running),
    rows,
  });
});

/* =========================
   LEDGER (PDF)
========================= */
app.get("/ledger/:partyId/pdf", requireAdminOrSameCustomer, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to required (YYYY-MM-DD)" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const party = await prisma.user.findUnique({ where: { id: Number(partyId) } });
    if (!party) return res.status(404).json({ error: "Party not found" });

    const beforeTxns = await prisma.transaction.findMany({
      where: { partyId: Number(partyId), date: { lt: fromDate } },
      orderBy: { date: "asc" },
    });

    let opening =
      party.openingType === "DR"
        ? Number(party.openingAmount || 0)
        : -Number(party.openingAmount || 0);

    for (const t of beforeTxns) opening += signedAmount(t);

    const txns = await prisma.transaction.findMany({
      where: { partyId: Number(partyId), date: { gte: fromDate, lte: toDate } },
      orderBy: { date: "asc" },
    });

    const rows = txns.map((t) => ({
      date: fmtDate(t.date),
      particulars: particulars(t),
      vchType: voucherTypeLabel(t.type),
      vchNo: t.voucherNo || "",
      dr: t.drcr === "DR" ? Number(t.amount) : 0,
      cr: t.drcr === "CR" ? Number(t.amount) : 0,
    }));

    let totalDr = opening > 0 ? opening : 0;
    let totalCr = opening < 0 ? Math.abs(opening) : 0;

    for (const r of rows) {
      totalDr += Number(r.dr || 0);
      totalCr += Number(r.cr || 0);
    }

    const diff = Math.abs(totalDr - totalCr);
    const drGreater = totalDr > totalCr;
    const crGreater = totalCr > totalDr;
    const grandTotal = Math.max(totalDr, totalCr);

    const filename = `Ledger_${String(party.name || "Party").replace(/[^\w]+/g, "_")}_${from}_to_${to}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");

    const doc = new PDFDocument({ size: "A4", margin: 36 });
    doc.pipe(res);

    const pageW = doc.page.width;
    const left = doc.page.margins.left;
    const right = doc.page.margins.right;
    const top = doc.page.margins.top;
    const bottom = doc.page.margins.bottom;
    const usableW = pageW - left - right;

    const col = { date: 72, particulars: 0, vchType: 78, vchNo: 120, debit: 78, credit: 78 };
    col.particulars = usableW - (col.date + col.vchType + col.vchNo + col.debit + col.credit);
    if (col.particulars < 160) {
      col.vchType = 70; col.vchNo = 120; col.debit = 74; col.credit = 74;
      col.particulars = usableW - (col.date + col.vchType + col.vchNo + col.debit + col.credit);
    }

    const X = {
      date: left,
      particulars: left + col.date,
      vchType: left + col.date + col.particulars,
      vchNo: left + col.date + col.particulars + col.vchType,
      debit: left + col.date + col.particulars + col.vchType + col.vchNo,
      credit: left + col.date + col.particulars + col.vchType + col.vchNo + col.debit,
    };

    function hr(y, thickness = 0.7) {
      doc.save();
      doc.lineWidth(thickness);
      doc.moveTo(left, y).lineTo(left + usableW, y).stroke();
      doc.restore();
    }

    function money2(n) {
      const v = Number(n || 0);
      if (!v) return "";
      return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

function drawHeader() {
  const titleY = top;

  // ===== Brand heading =====
  const gradient = doc.linearGradient(left, titleY, left + usableW, titleY);
  gradient.stop(0, "#0b3d91");
  gradient.stop(0.35, "#0b5ed7");
  gradient.stop(0.7, "#00a3ff");
  gradient.stop(1, "#ff8c00");

  doc.font("Helvetica-Bold").fontSize(22).fill(gradient);
  doc.text("SERVICE INDIA", left, titleY, { width: usableW, align: "center" });

  // shine line
  let y = titleY + 28;
  doc.save();
  doc.lineWidth(2);
  const lineGrad = doc.linearGradient(left + 120, y, left + usableW - 120, y);
  lineGrad.stop(0, "#0b3d91");
  lineGrad.stop(0.5, "#00a3ff");
  lineGrad.stop(1, "#ff8c00");
  doc.strokeColor(lineGrad);
  doc.moveTo(left + 120, y).lineTo(left + usableW - 120, y).stroke();
  doc.restore();

  y += 10;

  // ===== Company details =====
  doc.fillColor("#111827").font("Helvetica").fontSize(10);
  doc.text("H.N. 303, Sangam C.H.S., Indra Nagar,", left, y, { width: usableW, align: "center" });
  y += 14;
  doc.text("Pathan Wadi, R.S. Marg, Malad (E), Mumbai - 400097.", left, y, { width: usableW, align: "center" });
  y += 14;
  doc.text("Contact : +91-9702485922  |  E-Mail : corporate@serviceind.co.in", left, y, { width: usableW, align: "center" });
  y += 14;
  doc.fillColor("#0b5ed7");
  doc.text("www.serviceind.co.in", left, y, { width: usableW, align: "center", underline: false });

  y += 24;

  // ===== Party name =====
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(16);
  doc.text(String(party.name || "").toUpperCase(), left, y, { width: usableW, align: "center" });

  y += 18;
  doc.font("Helvetica").fontSize(12).fillColor("#1f2937");
  doc.text("Ledger Account", left, y, { width: usableW, align: "center" });

  y += 16;
  doc.font("Helvetica").fontSize(10).fillColor("#475569");
  doc.text(`Period: ${fmtDate(fromDate)} to ${fmtDate(toDate)}`, left, y, {
    width: usableW,
    align: "center",
  });

  y += 18;

  // ===== Divider =====
  doc.save();
  doc.lineWidth(1);
  doc.strokeColor("#cbd5e1");
  doc.moveTo(left, y).lineTo(left + usableW, y).stroke();
  doc.restore();

  doc.y = y + 10;
  doc.fillColor("#111827");
}
    function drawTableHeader(y) {
  // top line
  doc.save();
  doc.lineWidth(0.9);
  doc.strokeColor("#94a3b8");
  doc.moveTo(left, y).lineTo(left + usableW, y).stroke();
  doc.restore();

  y += 6;

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a");

  doc.text("DATE", X.date, y, { width: col.date });
  doc.text("PARTICULARS", X.particulars, y, { width: col.particulars });
  doc.text("VCH NO.", X.vchNo, y, { width: col.vchNo });
  doc.text("DEBIT", X.debit, y, { width: col.debit, align: "right" });
  doc.text("CREDIT", X.credit, y, { width: col.credit, align: "right" });

  y += 12;

  doc.save();
  doc.lineWidth(0.8);
  doc.strokeColor("#94a3b8");
  doc.moveTo(left, y).lineTo(left + usableW, y).stroke();
  doc.restore();

  y += 5;
  doc.font("Helvetica").fontSize(9).fillColor("#111827");
  return y;
}

    function rowHeight(particularsText) {
      const hPart = doc.heightOfString(particularsText || "", { width: col.particulars, align: "left" });
      return Math.max(13, Math.ceil(hPart)) + 0.5;
    }

    function drawRow(y, r, opts = {}) {
      const bold = !!opts.bold;
      const totalsLine = opts.totalsLine;
      const h = rowHeight(r.particulars || " ");

      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor("#111827");
      doc.text(r.date || "", X.date, y, { width: col.date });
      doc.text(r.particulars || "", X.particulars, y, { width: col.particulars });
      doc.text(r.vchNo || "", X.vchNo, y, { width: col.vchNo });
      doc.text(money2(r.dr), X.debit, y, { width: col.debit, align: "right" });
      doc.text(money2(r.cr), X.credit, y, { width: col.credit, align: "right" });

      if (totalsLine) {
        doc.save();
        doc.lineWidth(0.6);

        const drawTotalLine = (lineY) => {
          doc.moveTo(X.debit + 6, lineY).lineTo(X.debit + col.debit - 2, lineY).stroke();
          doc.moveTo(X.credit + 6, lineY).lineTo(X.credit + col.credit - 2, lineY).stroke();
        };

        if (totalsLine === "above") {
          drawTotalLine(y - 2);
        } else if (totalsLine === "below") {
          drawTotalLine(y + h - 2);
        } else if (totalsLine === "both") {
          drawTotalLine(y - 2);
          drawTotalLine(y + h - 2);
        }

        doc.restore();
      }

      return y + h;
    }

function drawFooter(pageNo) {
  const footerText =
    "This is a system generated ledger statement. No physical signature is required on digitally issued documents.";

  doc.save();
  doc.font("Helvetica").fontSize(7).fillColor("#64748b");

  const footerH = doc.heightOfString(footerText, {
    width: usableW - 70,
    align: "center",
  });

  const footerY = doc.page.height - doc.page.margins.bottom - footerH - 8;

  doc.text(footerText, left, footerY, {
    width: usableW - 70,
    align: "center",
  });

  doc.fillColor("#94a3b8");
  doc.text(`Page ${pageNo}`, left, footerY, {
    width: usableW,
    align: "right",
  });

  doc.restore();
  doc.fillColor("#111827");
}

    function bottomLimit() {
      return doc.page.height - bottom - 32;
    }

    let pageNo = 1;
    drawHeader();
    let y = doc.y;
    y = drawTableHeader(y);

    const openingRow = {
      date: fmtDate(fromDate),
      particulars: opening >= 0 ? "To Opening Balance" : "By Opening Balance",
      vchType: "",
      vchNo: "",
      dr: opening > 0 ? opening : 0,
      cr: opening < 0 ? Math.abs(opening) : 0,
    };

    if (y + rowHeight(openingRow.particulars) > bottomLimit()) {
      drawFooter(pageNo); doc.addPage(); pageNo++; drawHeader(); y = drawTableHeader(doc.y);
    }
    y = drawRow(y, openingRow, { bold: true });

    for (const r of rows) {
      if (y + rowHeight(r.particulars) > bottomLimit()) {
        drawFooter(pageNo); doc.addPage(); pageNo++; drawHeader(); y = drawTableHeader(doc.y);
      }
      y = drawRow(y, r);
    }

        const subTotalRow = {
      date: "",
      particulars: "",
      vchType: "",
      vchNo: "",
      dr: totalDr,
      cr: totalCr,
    };

    // ✅ CASE 1: closing balance ZERO
    // subtotal hi final grand total hai, isliye same row dubara mat print karo
    if (diff === 0) {
      if (y + rowHeight(" ") > bottomLimit()) {
        drawFooter(pageNo);
        doc.addPage();
        pageNo++;
        drawHeader();
        y = drawTableHeader(doc.y);
      }

      y = drawRow(y, subTotalRow, {
        bold: true,
        totalsLine: "both", // ✅ upar + niche line
      });
    } else {
      // ✅ CASE 2: closing balance exists
      if (y + rowHeight(" ") > bottomLimit()) {
        drawFooter(pageNo);
        doc.addPage();
        pageNo++;
        drawHeader();
        y = drawTableHeader(doc.y);
      }

      y = drawRow(y, subTotalRow, {
        bold: true,
        totalsLine: "above",
      });

      const closingRow = {
        date: "",
        particulars: drGreater ? "By Closing Balance" : "To Closing Balance",
        vchType: "",
        vchNo: "",
        dr: crGreater ? diff : 0,
        cr: drGreater ? diff : 0,
      };

      if (y + rowHeight(closingRow.particulars) > bottomLimit()) {
        drawFooter(pageNo);
        doc.addPage();
        pageNo++;
        drawHeader();
        y = drawTableHeader(doc.y);
      }

      y = drawRow(y, closingRow, {
        bold: true,
      });

      const grandRow = {
        date: "",
        particulars: "",
        vchType: "",
        vchNo: "",
        dr: grandTotal,
        cr: grandTotal,
      };

      if (y + rowHeight(" ") > bottomLimit()) {
        drawFooter(pageNo);
        doc.addPage();
        pageNo++;
        drawHeader();
        y = drawTableHeader(doc.y);
      }

      y = drawRow(y, grandRow, {
        bold: true,
        totalsLine: "both", // ✅ upar + niche line
      });
    }

    drawFooter(pageNo);
    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "PDF export failed", details: String(e.message || e) });
  }
});
app.get("/debug/txns", async (req, res) => {
  try {
    const txns = await prisma.transaction.findMany({
      orderBy: { id: "desc" },
      take: 20,
      select: {
        id: true,
        voucherNo: true,
        type: true,
        amount: true,
        drcr: true,
        date: true,
        partyId: true,
        createdById: true,
      },
    });

    res.json({
      ok: true,
      count: txns.length,
      txns,
      dbUrlPreview: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
        : "MISSING",
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message || "debug failed" });
  }
});
app.get("/debug/storage", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, message: "Supabase not configured" });
    }

    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list("", {
      limit: 20,
      offset: 0,
      sortBy: { column: "name", order: "desc" },
    });

    if (error) throw error;

    res.json({
      ok: true,
      bucket: SUPABASE_BUCKET,
      count: data?.length || 0,
      files: data || [],
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message || "storage debug failed" });
  }
});
/* =========================
   CUSTOMER PORTAL DASHBOARD
========================= */
app.get("/customer-portal/dashboard", requireCustomer, async (req, res) => {
  try {
    const partyId = req.customerId;
    const range = parseDateRangeOrFY(req.query.from, req.query.to);

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const { fromDate, toDate } = range;

    const txns = await prisma.transaction.findMany({
      where: {
        partyId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        type: true,
        date: true,
        amount: true,
        drcr: true,
        voucherNo: true,
        narration: true,
      },
    });

    let totalDebit = 0,
      totalCredit = 0,
      balance = 0;

    const salesMonth = new Map();
    const purchaseMonth = new Map();

    let SALE = 0,
      RECEIPT = 0,
      SALES_RETURN = 0,
      PURCHASE = 0,
      PAYMENT = 0,
      PURCHASE_RETURN = 0,
      JOURNAL_DR = 0,
      JOURNAL_CR = 0;

    function monthKey(d) {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "NA";
      return dt.toISOString().slice(0, 7);
    }

    function bump(map, key, field, amt) {
      const prev = map.get(key) || {
        month: key,
        SALE: 0,
        RECEIPT: 0,
        SALES_RETURN: 0,
        PURCHASE: 0,
        PAYMENT: 0,
        PURCHASE_RETURN: 0,
        JOURNAL: 0,
      };
      prev[field] = (prev[field] || 0) + amt;
      map.set(key, prev);
    }

    for (const t of txns) {
      const amt = Math.abs(Number(t.amount || 0));
      const isDr = t.drcr === "DR";

      totalDebit += isDr ? amt : 0;
      totalCredit += isDr ? 0 : amt;
      balance += isDr ? amt : -amt;

      const m = monthKey(t.date);

      if (t.type === "SALE") SALE += amt;
      if (t.type === "RECEIPT") RECEIPT += amt;
      if (t.type === "SALES_RETURN") SALES_RETURN += amt;
      if (t.type === "PURCHASE") PURCHASE += amt;
      if (t.type === "PAYMENT") PAYMENT += amt;
      if (t.type === "PURCHASE_RETURN") PURCHASE_RETURN += amt;

      if (t.type === "JOURNAL_DR") {
  JOURNAL_DR += amt;
}

if (t.type === "JOURNAL_CR") {
  JOURNAL_CR += amt;
}

if (["SALE", "RECEIPT", "SALES_RETURN", "JOURNAL_CR"].includes(t.type)) {
  bump(salesMonth, m, t.type === "JOURNAL_CR" ? "JOURNAL" : t.type, amt);
}

if (["PURCHASE", "PAYMENT", "PURCHASE_RETURN", "JOURNAL_DR"].includes(t.type)) {
  bump(purchaseMonth, m, t.type === "JOURNAL_DR" ? "JOURNAL" : t.type, amt);
}
    }

    const salesNet = SALE - RECEIPT - SALES_RETURN - JOURNAL_CR;
    const salesTotal = SALE + JOURNAL_DR;
    const salesOutstanding = Math.max(salesNet, 0);
    const salesSettled = Math.max(salesTotal - salesOutstanding, 0);

    const purchaseNet = PURCHASE - PAYMENT - PURCHASE_RETURN - JOURNAL_DR;
    const purchaseTotal = PURCHASE + JOURNAL_CR;
    const purchaseOutstanding = Math.max(purchaseNet, 0);
    const purchaseSettled = Math.max(purchaseTotal - purchaseOutstanding, 0);

    const salesTrend = Array.from(salesMonth.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    const purchaseTrend = Array.from(purchaseMonth.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return res.json({
      summary: {
        outstanding: balance,
        totalDebit,
        totalCredit,
        txnCount: txns.length,
        byType: {
          SALE,
          RECEIPT,
          SALES_RETURN,
          PURCHASE,
          PAYMENT,
          PURCHASE_RETURN,
          JOURNAL_DR,
          JOURNAL_CR,
        },
      },
      charts: {
        salesTrend,
        purchaseTrend,
        salesPie: {
          SALE,
          RECEIPT,
          SALES_RETURN,
          JOURNAL_CR,
          net: salesNet,
          total: salesTotal,
          outstanding: salesOutstanding,
          settled: salesSettled,
        },
        purchasePie: {
          PURCHASE,
          PAYMENT,
          PURCHASE_RETURN,
          JOURNAL_DR,
          net: purchaseNet,
          total: purchaseTotal,
          outstanding: purchaseOutstanding,
          settled: purchaseSettled,
        },
      },
      recent: txns
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10),
      period: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
    });
  } catch (e) {
    console.error("CUSTOMER PORTAL DASHBOARD ERROR:", e);
    return res.status(500).json({
      message: "Dashboard failed",
      details: String(e.message || e),
    });
  }
});
/* =========================
   CUSTOMER PORTAL TRANSACTIONS
========================= */
app.get("/customer-portal/transactions", requireCustomer, async (req, res) => {
  try {
    const partyId = req.customerId;
    const range = parseDateRangeOrFY(req.query.from, req.query.to);

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const { fromDate, toDate } = range;

    const party = await prisma.user.findUnique({ where: { id: partyId } });
    if (!party) return res.status(404).json({ message: "Customer not found" });

    let opening =
      party.openingType === "DR"
        ? Number(party.openingAmount || 0)
        : -Number(party.openingAmount || 0);

    const beforeTxns = await prisma.transaction.findMany({
      where: { partyId, date: { lt: fromDate } },
      orderBy: { date: "asc" },
    });

    for (const t of beforeTxns) {
      const amt = Number(t.amount || 0);
      opening += t.drcr === "DR" ? amt : -amt;
    }

    const items = await prisma.transaction.findMany({
      where: {
        partyId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        date: "desc",
      },
      include: {
        pdfs: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    let running = opening;

    const ascItems = items.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const t of ascItems) {
      const amt = Number(t.amount || 0);
      running += t.drcr === "DR" ? amt : -amt;
    }

    const mapped = items.map((t) => ({
      id: t.id,
      date: t.date ? t.date.toISOString().slice(0, 10) : "",
      voucherNo: t.voucherNo,
      voucherType: t.type,
      narration: t.narration || "",
      debit: t.drcr === "DR" ? Number(t.amount || 0) : 0,
      credit: t.drcr === "CR" ? Number(t.amount || 0) : 0,
      pdfs: (t.pdfs || []).map((p) => ({
        id: p.id,
        name: p.originalName,
        url: `/pdfs/${p.id}`,
      })),
    }));

    return res.json({
      opening,
      closing: running,
      items: mapped,
      period: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
    });
  } catch (e) {
    console.error("CUSTOMER PORTAL TRANSACTIONS ERROR:", e);
    return res.status(500).json({
      message: "Failed",
      details: String(e.message || e),
    });
  }
});

// ✅ Export Ledger PDF (customer)
app.get("/customer-portal/export-ledger-pdf", requireCustomer, async (req, res) => {
  const partyId = req.customerId;
  const { from, to } = req.query;

  const range = parseDateRangeOrFY(from, to);
  if (!range) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const fromDate = range.fromDate.toISOString().slice(0, 10);
  const toDate = range.toDate.toISOString().slice(0, 10);

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : req.query?.token
    ? String(req.query.token)
    : "";

  return res.redirect(
    `/ledger/${partyId}/pdf?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(
      toDate
    )}&token=${encodeURIComponent(token)}`
  );
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("SERVICE INDIA API RUNNING 🚀");
});
// ✅ Multer error handler (so "too many files" doesn't become 500)
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Too many files uploaded",
      details: err.message,
    });
  }
  return next(err);
});
app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});