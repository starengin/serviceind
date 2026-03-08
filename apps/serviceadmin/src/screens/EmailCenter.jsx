import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

// ---------- helpers ----------
function escHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmtDateTime(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

function bytes(n) {
  const v = Number(n || 0);
  if (!v) return "";
  const kb = v / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function textToEditorHtml(text = "") {
  return escHtml(text).replace(/\n/g, "<br>");
}

function normalizeEditorHtml(html = "") {
  let out = String(html || "");

  // browser generated junk cleanup
  out = out.replace(/<div><br><\/div>/gi, "<br>");
  out = out.replace(/<div>/gi, "<br>");
  out = out.replace(/<\/div>/gi, "");
  out = out.replace(/<p[^>]*>/gi, "<br>");
  out = out.replace(/<\/p>/gi, "");
  out = out.replace(/&nbsp;/gi, " ");

  // collapse too many breaks
  out = out.replace(/(<br>\s*){3,}/gi, "<br><br>");

  // remove leading breaks
  out = out.replace(/^(\s*<br>\s*)+/gi, "");

  return out.trim();
}

function getPlainTextFromHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

function insertHtmlAtCursor(html) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  range.deleteContents();

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const frag = document.createDocumentFragment();
  let node;
  let lastNode = null;

  while ((node = temp.firstChild)) {
    lastNode = frag.appendChild(node);
  }

  range.insertNode(frag);

  if (lastNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

const BRAND_NAME = "SERVICE INDIA";
const REPLY_TO = "corporate@serviceind.co.in";
const BRAND_WEBSITE = "https://www.serviceind.co.in";
const BRAND_PHONE = "+91-9702485922";
const BRAND_WHATSAPP = "https://wa.me/919702485922";
const LOGO_URL = `https://www.serviceind.co.in/brand/logo.jpeg`;

export default function EmailCenter() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [err, setErr] = useState("");

  const [selectedLead, setSelectedLead] = useState(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`${BRAND_NAME} – Notification`);
  const [messageHtml, setMessageHtml] = useState("");
  const [mainPdf, setMainPdf] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const editorRef = useRef(null);

  async function loadLeads() {
    try {
      setErr("");
      setOkMsg("");
      setLoading(true);
      const items = await api.adminLeads();
      setLeads(Array.isArray(items) ? items : []);
    } catch (e) {
      setErr(e?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== messageHtml) {
      editorRef.current.innerHTML = messageHtml || "";
    }
  }, [messageHtml]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function syncFromEditor() {
    const html = normalizeEditorHtml(editorRef.current?.innerHTML || "");
    setMessageHtml(html);
  }

  function runCmd(command, value = null) {
    focusEditor();
    document.execCommand(command, false, value);
    syncFromEditor();
  }

  function setFontSize(size) {
    focusEditor();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("fontSize", false, size);
    syncFromEditor();
  }

  function clearComposer() {
    setSelectedLead(null);
    setTo("");
    setSubject(`${BRAND_NAME} – Notification`);
    setMessageHtml("");
    setMainPdf(null);
    setExtraFiles([]);
    setOkMsg("");
    setErr("");

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }

  function composeFromLead(l) {
    setOkMsg("");
    setErr("");
    setSelectedLead(l || null);

    const leadName = l?.name || "Customer";
    const leadEmail = l?.email || "";
    const leadSubject = (l?.subject || "Enquiry").trim();

    setTo(leadEmail);
    setSubject(`${BRAND_NAME} – ${leadSubject}`);

    const baseMsg = [
      `Dear ${leadName},`,
      ``,
      `Thank you for contacting ${BRAND_NAME}.`,
      `We have received your requirement and our team will get back to you shortly.`,
      ``,
      `Please find the relevant quotation / attachment with this email.`,
      ``,
      `If you need any clarification, simply reply to this email or contact us at ${REPLY_TO}.`,
      ``,
      `Warm Regards,`,
      `${BRAND_NAME}`,
      `${REPLY_TO}`,
      `${BRAND_WEBSITE.replace("https://", "")}`,
    ].join("\n");

    const html = textToEditorHtml(baseMsg);
    setMessageHtml(html);

    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  }

  function onEditorInput() {
    syncFromEditor();
  }

  function onEditorKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusEditor();
      insertHtmlAtCursor("<br>");
      syncFromEditor();
    }
  }

  function onEditorPaste(e) {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    const safe = escHtml(text).replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
    focusEditor();
    insertHtmlAtCursor(safe);
    syncFromEditor();
  }

  const previewHtml = useMemo(() => {
    const lead = selectedLead;

    const titleLine = lead ? escHtml(lead.subject || "Enquiry") : "Notification";
    const introLine = lead
      ? `We received your requirement and will assist you shortly.`
      : `Please find the message below.`;

    const bodyHtml = normalizeEditorHtml(messageHtml || "");

    const summaryBlock = lead
      ? `
      <div style="
        margin-top:18px;
        border-radius:12px;
        overflow:hidden;
        border:1px solid rgba(17,24,39,0.10);
        box-shadow:0 10px 18px rgba(17,24,39,0.08);
        background:#ffffff;
      ">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px;">
          <tbody>
            <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Name</b></td>
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${escHtml(lead.name || "-")}</td>
            </tr>
            <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Email</b></td>
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${escHtml(lead.email || "-")}</td>
            </tr>
            <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Phone</b></td>
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${escHtml(lead.phone || "-")}</td>
            </tr>
            <tr style="background:linear-gradient(90deg,#eef7ff,#ffffff);">
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>City</b></td>
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${escHtml(lead.city || "-")}</td>
            </tr>
            <tr style="background:linear-gradient(90deg,#ffffff,#fbfbfb);">
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;"><b>Material</b></td>
              <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;">${escHtml(lead.material || "ALL")}</td>
            </tr>
            <tr style="background:linear-gradient(90deg,#fff3e6,#ffffff);">
              <td style="padding:12px 14px;"><b>Details</b></td>
              <td style="padding:12px 14px;line-height:1.7;">
                ${escHtml(lead.details || "-").replace(/\n/g, "<br/>")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      `
      : "";

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
                <img src="${LOGO_URL}"
                     alt="${BRAND_NAME}"
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
                  ${BRAND_NAME}
                </h1>
                <p style="
                  margin:6px 0 0 0;
                  font-size:14px;
                  color:#eef8ff;
                  font-weight:bold;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  ${titleLine}
                </p>

                <p style="
                  margin:10px 0 0 0;
                  font-size:12px;
                  color:rgba(255,255,255,0.92);
                  line-height:1.6;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  ${escHtml(introLine)}<br/>
                  Reply-To: <b>${escHtml(REPLY_TO)}</b>
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
          <div style="font-size:14px;line-height:1.85;color:#1f2937;">
            ${bodyHtml || "—"}
          </div>

          ${summaryBlock}

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
              For any clarification, please reply to this email or contact us at
              <a href="mailto:${escHtml(REPLY_TO)}"
                 style="color:#0b5ed7;text-decoration:none;font-weight:bold;"
                 target="_blank">
                ${escHtml(REPLY_TO)}
              </a>
            </p>

            <p style="font-size:14px;margin:16px 0 0 0;color:#1f2937;line-height:1.7;">
              Warm Regards,<br/>
              <b>${BRAND_NAME}</b><br/>
              📧 <a target="_blank" href="mailto:${escHtml(REPLY_TO)}" style="color:#0b5ed7;text-decoration:none;">
                ${escHtml(REPLY_TO)}
              </a><br/>
              🌐 <a href="${BRAND_WEBSITE}" style="color:#0b5ed7;text-decoration:none;" target="_blank">
                ${BRAND_WEBSITE.replace("https://", "")}
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
        <div style="font-weight:bold; color:#111827; margin-bottom:6px;">
          This is a system-generated email. Please reply to the email address mentioned above.
        </div>

        <div style="
          height:2px;
          width:160px;
          margin:10px auto 10px auto;
          border-radius:999px;
          background:linear-gradient(90deg, rgba(11,61,145,0.25), rgba(255,140,0,0.35), rgba(0,163,255,0.25));
        "></div>

        <div style="line-height:1.7;">
          📧
          <a target="_blank" href="mailto:${escHtml(REPLY_TO)}"
             style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
            ${escHtml(REPLY_TO)}
          </a><br/>

          📞
          <a href="tel:${BRAND_PHONE.replace(/[^\d+]/g, "")}"
             style="color:#111827;text-decoration:none;font-weight:bold;">
            Call Now: ${BRAND_PHONE}
          </a><br/>

          💬
          <a target="_blank" href="${BRAND_WHATSAPP}"
             style="color:#111827;text-decoration:none;font-weight:bold;">
            WhatsApp Support
          </a>
        </div>

        <div style="
          height:2px;
          width:160px;
          margin:10px auto 10px auto;
          border-radius:999px;
          background:linear-gradient(90deg, rgba(11,61,145,0.25), rgba(255,140,0,0.35), rgba(0,163,255,0.25));
        "></div>

        <div style="margin-top:6px; line-height:1.7;">
          Website:
          <a href="${BRAND_WEBSITE}" style="color:#6b7280; text-decoration:none;" target="_blank">
            ${BRAND_WEBSITE}
          </a>
        </div>
      </td>
    </tr>
  </tbody>
</table>
    `;
  }, [messageHtml, selectedLead]);

  function removeExtra(i) {
    setExtraFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function send() {
    setOkMsg("");
    setErr("");

    const plainText = getPlainTextFromHtml(messageHtml);

    if (!to.trim()) return setErr("To email required");
    if (!subject.trim()) return setErr("Subject required");
    if (!plainText.trim()) return setErr("Message required");

    setSending(true);
    try {
      const res = await api.adminSendEmail({
        to: to.trim(),
        subject: subject.trim(),
        html: previewHtml,
        mainPdf,
        extraFiles,
      });

      setOkMsg(`✅ Email sent successfully. Attachments: ${res?.attached || 0}`);
      setMainPdf(null);
      setExtraFiles([]);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Email failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 12, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Email Center</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Reply-To will be set to <b>{REPLY_TO}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={loadLeads} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Leads"}
          </button>
          <button className="btn btn-ghost" onClick={clearComposer} disabled={sending}>
            Clear
          </button>
        </div>
      </div>

      <div
        className="emailCenterGrid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 380px) 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 1000 }}>Leads</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{leads.length}</div>
          </div>

          {loading ? (
            <div style={{ padding: 10, color: "#64748b" }}>Loading...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 10, color: "#64748b" }}>No leads</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {leads.map((l) => {
                const active = selectedLead?.id === l.id;

                return (
                  <button
                    key={l.id}
                    className="sideLink"
                    style={{
                      textAlign: "left",
                      border: active ? "1px solid rgba(11,94,215,0.35)" : "1px solid var(--line)",
                      background: active ? "rgba(11,94,215,0.06)" : "transparent",
                      borderRadius: 14,
                      padding: 10,
                    }}
                    onClick={() => composeFromLead(l)}
                    title="Click to compose email"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 1000 }}>{l.name || "Lead"}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {fmtDateTime(l.createdAt) || ""}
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      {l.email || "-"} • {l.city || "-"}
                    </div>

                    <div style={{ fontSize: 12, marginTop: 6, color: "#0f172a" }}>
                      {l.subject || "Enquiry"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {err ? <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 900 }}>{err}</div> : null}
          {okMsg ? <div style={{ marginTop: 10, color: "#166534", fontWeight: 1000 }}>{okMsg}</div> : null}
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 1000 }}>Compose & Send</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Attach PDFs and send directly to the customer.
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <label>
              <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>To</div>
              <input
                className="input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="customer@email.com"
              />
            </label>

            <label>
              <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>Subject</div>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>

            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)", marginBottom: 6 }}>Message</div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    background: "rgba(2,6,23,0.03)",
                  }}
                >
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("bold")} title="Bold">
                    <b>B</b>
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("italic")} title="Italic">
                    <i>I</i>
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("underline")} title="Underline">
                    <u>U</u>
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setFontSize(2)} title="Small text">
                    A-
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setFontSize(3)} title="Normal text">
                    A
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setFontSize(5)} title="Large text">
                    A+
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("insertUnorderedList")} title="Bullet list">
                    • List
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("insertOrderedList")} title="Number list">
                    1. List
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("removeFormat")} title="Clear format">
                    Clear Format
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("undo")} title="Undo">
                    Undo
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => runCmd("redo")} title="Redo">
                    Redo
                  </button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={onEditorInput}
                  onKeyDown={onEditorKeyDown}
                  onPaste={onEditorPaste}
                  data-placeholder="Type your email here..."
                  style={{
                    minHeight: 180,
                    padding: 12,
                    outline: "none",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#0f172a",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                />
              </div>

              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                Enter = single line break. Paste will keep plain text only.
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>
                  Main PDF (optional)
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setMainPdf(e.target.files?.[0] || null)}
                />

                {mainPdf ? (
                  <div style={{ fontSize: 12, color: "#0f172a" }}>
                    ✅ <b>{mainPdf.name}</b>{" "}
                    <span style={{ color: "var(--muted)" }}>({bytes(mainPdf.size)})</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>No main PDF selected</div>
                )}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>
                  Extra Files (optional)
                </div>
                <input type="file" multiple onChange={(e) => setExtraFiles(Array.from(e.target.files || []))} />

                {extraFiles?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {extraFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          border: "1px solid var(--line)",
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(2,6,23,0.02)",
                          fontSize: 12,
                        }}
                      >
                        <b>{f.name}</b>
                        <span style={{ color: "var(--muted)" }}>{bytes(f.size)}</span>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ height: 24, padding: "0 8px" }}
                          onClick={() => removeExtra(i)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>No extra files selected</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn" onClick={send} disabled={sending}>
                {sending ? "Sending..." : "Send Email"}
              </button>

              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Customer replies will come to: <b>{REPLY_TO}</b>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 1000, marginBottom: 8 }}>Preview</div>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 10,
                  background: "#fff",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px){
          .emailCenterGrid { grid-template-columns: 1fr !important; }
        }

        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 8px 0 8px 20px;
        }

        [contenteditable] b,
        [contenteditable] strong {
          font-weight: 700;
        }

        [contenteditable] i,
        [contenteditable] em {
          font-style: italic;
        }

        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}