import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import EmailEditor from "../components/EmailEditor";

// ---------- helpers ----------
function escHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bytes(n) {
  const v = Number(n || 0);
  if (!v) return "";
  const kb = v / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function normalizeEditorHtml(html = "") {
  let out = String(html || "");

  out = out.replace(/<div><br><\/div>/gi, "<br>");
  out = out.replace(/<div>/gi, "<br>");
  out = out.replace(/<\/div>/gi, "");
  out = out.replace(/<p[^>]*>/gi, "<br>");
  out = out.replace(/<\/p>/gi, "");
  out = out.replace(/&nbsp;/gi, " ");

  out = out.replace(/(<br>\s*){3,}/gi, "<br><br>");
  out = out.replace(/^(\s*<br>\s*)+/gi, "");

  return out.trim();
}

function getPlainTextFromHtml(html = "") {
  if (typeof document === "undefined") return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

function fileKey(file) {
  return `${file?.name || ""}__${file?.size || 0}__${file?.lastModified || 0}`;
}

const BRAND_NAME = "SERVICE INDIA";
const BRAND_EMAIL = "corporate@serviceind.co.in";
const BRAND_WEBSITE = "https://www.serviceind.co.in";
const BRAND_PHONE = "+91-9702485922";
const BRAND_WHATSAPP = "https://wa.me/919702485922";
const LOGO_URL = "https://www.serviceind.co.in/brand/logo.jpeg";

function getDefaultHtml() {
  return "";
}

export default function EmailCenter() {
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Notification`);
  const [messageHtml, setMessageHtml] = useState(getDefaultHtml());
  const [extraFiles, setExtraFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const extraFilesInputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1180 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1180);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function resetExtraFilesInput() {
    if (extraFilesInputRef.current) {
      extraFilesInputRef.current.value = "";
    }
  }

  function clearComposer() {
    setTo("");
    setSubject(`${BRAND_NAME} – Notification`);
    setMessageHtml(getDefaultHtml());
    setExtraFiles([]);
    setOkMsg("");
    setErr("");
    resetExtraFilesInput();
  }

  function chooseExtraFiles() {
    extraFilesInputRef.current?.click();
  }

  function onExtraFilesChange(e) {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) {
      resetExtraFilesInput();
      return;
    }

    setExtraFiles((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      incoming.forEach((f) => {
        map.set(fileKey(f), f);
      });
      return Array.from(map.values());
    });

    resetExtraFilesInput();
  }

  function removeExtra(i) {
    setExtraFiles((prev) => prev.filter((_, idx) => idx !== i));
    resetExtraFilesInput();
  }

  const previewHtml = useMemo(() => {
    const bodyHtml = normalizeEditorHtml(messageHtml || "");

    return `
<table align="center" width="100%" cellpadding="0" cellspacing="0"
style="
max-width:600px;
margin:18px auto;
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
                  ${escHtml(subject || "Notification")}
                </p>

                <p style="
                  margin:10px 0 0 0;
                  font-size:12px;
                  color:rgba(255,255,255,0.92);
                  line-height:1.6;
                  text-shadow:0 2px 8px rgba(0,0,0,0.30);
                ">
                  Please find the message below.
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
              For any clarification, please contact us at
              <a href="mailto:${escHtml(BRAND_EMAIL)}"
                 style="color:#0b5ed7;text-decoration:none;font-weight:bold;"
                 target="_blank">
                ${escHtml(BRAND_EMAIL)}
              </a>
            </p>

            <p style="font-size:14px;margin:16px 0 0 0;color:#1f2937;line-height:1.7;">
              Warm Regards,<br/>
              <b>${BRAND_NAME}</b><br/>
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
        <div style="
          height:2px;
          width:160px;
          margin:2px auto 10px auto;
          border-radius:999px;
          background:linear-gradient(90deg, rgba(11,61,145,0.25), rgba(255,140,0,0.35), rgba(0,163,255,0.25));
        "></div>

        <div style="line-height:1.7;">
          📧
          <a target="_blank" href="mailto:${escHtml(BRAND_EMAIL)}"
             style="color:#0b5ed7;text-decoration:none;font-weight:bold;">
            ${escHtml(BRAND_EMAIL)}
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
  }, [messageHtml, subject]);

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
        extraFiles,
      });

      setOkMsg(`✅ Email sent successfully. Attachments: ${res?.attached || 0}`);
      setExtraFiles([]);
      resetExtraFilesInput();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Email failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.bgGlow1} />
      <div style={S.bgGlow2} />
      <div style={S.bgGlow3} />

      <div style={S.wrap}>
        <div style={S.topBar}>
          <div>
            <div style={S.pageTitle}>Email Center</div>
            <div style={S.pageSub}>Compose, preview and send branded emails.</div>
          </div>

          <button style={S.secondary} onClick={clearComposer} disabled={sending}>
            Clear
          </button>
        </div>

        {(err || okMsg) && (
          <div style={{ display: "grid", gap: 8, marginBottom: 10, flexShrink: 0 }}>
            {err ? <div style={S.err}>{err}</div> : null}
            {okMsg ? <div style={S.ok}>{okMsg}</div> : null}
          </div>
        )}

        <div
          style={{
            ...S.grid,
            gridTemplateColumns: isMobile
              ? "1fr"
              : "minmax(340px, 470px) minmax(0, 1fr)",
          }}
        >
          <div style={S.previewCard}>
            <div style={S.mainHead}>
              <div>
                <div style={S.sideTitle}>Preview</div>
                <div style={S.sideSub}>Live branded email preview</div>
              </div>
            </div>

            <div style={S.previewBox}>
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>

          <div style={S.mainCard}>
            <div style={S.mainHead}>
              <div>
                <div style={S.sideTitle}>Compose & Send</div>
                <div style={S.sideSub}>Compact layout with attachments and direct send.</div>
              </div>
            </div>

            <div style={S.formGrid}>
              <div style={S.topFields}>
                <label style={S.labelWrap}>
                  <div style={S.label}>To</div>
                  <input
                    style={S.input}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="customer@email.com"
                  />
                </label>

                <label style={S.labelWrap}>
                  <div style={S.label}>Subject</div>
                  <input
                    style={S.input}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ ...S.labelWrap, minHeight: 0 }}>
                <div style={S.label}>Message</div>

                <div style={S.editorOnlyWrap}>
                  <EmailEditor
                    value={messageHtml}
                    onChange={setMessageHtml}
                    editorStyle={S.editor}
                  />
                </div>

                <div style={S.editorHint}>
                  Plain clean editor view with bigger visible message area.
                </div>
              </div>

              <div style={S.attachCompactCard}>
                <div style={S.attachCompactHead}>
                  <div>
                    <div style={S.label}>Attachments (optional)</div>
                    <div style={S.attachSub}>Multiple files can be added again and again</div>
                  </div>

                  <div style={S.attachActions}>
                    <button type="button" style={S.filePickBtn} onClick={chooseExtraFiles}>
                      Add Files
                    </button>

                    {extraFiles.length ? (
                      <button
                        type="button"
                        style={S.fileGhostBtn}
                        onClick={() => {
                          setExtraFiles([]);
                          resetExtraFilesInput();
                        }}
                      >
                        Remove All
                      </button>
                    ) : null}
                  </div>
                </div>

                <input
                  ref={extraFilesInputRef}
                  type="file"
                  multiple
                  onChange={onExtraFilesChange}
                  style={{ display: "none" }}
                />

                {extraFiles?.length ? (
                  <div style={S.fileTagsCompact}>
                    {extraFiles.map((f, i) => (
                      <div key={fileKey(f)} style={S.fileChip}>
                        <div style={S.fileChipLeft}>
                          <span style={S.fileTagIcon}>📎</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={S.fileTagName}>{f.name}</div>
                            <div style={S.fileTagMeta}>{bytes(f.size)}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={S.removeBtn}
                          onClick={() => removeExtra(i)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={S.fileMuted}>No files selected</div>
                )}
              </div>

              <div style={S.actionBar}>
                <button style={S.primary} onClick={send} disabled={sending}>
                  {sending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        html, body, #root {
          height: 100%;
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

        .email-editor-prose p {
          margin: 0 0 8px 0;
        }

        .email-editor-prose ul,
        .email-editor-prose ol {
          margin: 8px 0 8px 20px;
        }

        .email-editor-prose li {
          margin: 4px 0;
        }

        .email-editor-prose strong {
          font-weight: 700;
        }

        .email-editor-prose em {
          font-style: italic;
        }

        .email-editor-prose u {
          text-decoration: underline;
        }

        .email-editor-prose:empty::before {
          content: "Type your email here...";
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

const S = {
  page: {
    position: "relative",
    overflow: "hidden",
    height: "calc(100vh - 20px)",
    minHeight: 0,
    padding: 10,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  wrap: {
    maxWidth: 1400,
    height: "100%",
    minHeight: 0,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "4px 2px 2px 2px",
    flexShrink: 0,
    flexWrap: "wrap",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: 900,
    color: "#111827",
    lineHeight: 1.05,
  },

  pageSub: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
    marginTop: 4,
  },

  bgGlow1: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(0,123,255,0.10)",
    filter: "blur(70px)",
    pointerEvents: "none",
  },

  bgGlow2: {
    position: "absolute",
    top: 140,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(255,140,0,0.10)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  bgGlow3: {
    position: "absolute",
    bottom: -120,
    left: "25%",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(0,170,255,0.10)",
    filter: "blur(95px)",
    pointerEvents: "none",
  },

  grid: {
    display: "grid",
    gap: 10,
    alignItems: "stretch",
    flex: 1,
    minHeight: 0,
  },

  previewCard: {
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))",
    borderRadius: 20,
    border: "1px solid rgba(148,163,184,0.20)",
    boxShadow: "0 14px 30px rgba(17,24,39,0.07)",
    padding: 12,
    overflow: "hidden",
  },

  mainCard: {
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))",
    borderRadius: 20,
    border: "1px solid rgba(148,163,184,0.20)",
    boxShadow: "0 14px 30px rgba(17,24,39,0.07)",
    padding: 12,
    overflow: "hidden",
  },

  mainHead: {
    marginBottom: 10,
    flexShrink: 0,
  },

  sideTitle: {
    fontSize: 15,
    fontWeight: 900,
    color: "#111827",
  },

  sideSub: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  formGrid: {
    display: "grid",
    gap: 10,
    minHeight: 0,
    flex: 1,
    overflow: "hidden",
  },

  topFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  labelWrap: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    color: "#475569",
  },

  input: {
    width: "100%",
    height: 42,
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,0.10)",
    fontSize: 13,
    outline: "none",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
    color: "#111827",
    boxShadow: "0 8px 18px rgba(17,24,39,0.04)",
  },

  editorOnlyWrap: {
    minHeight: 0,
    flex: 1,
    border: "1px solid rgba(17,24,39,0.10)",
    borderRadius: 16,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
    boxShadow: "0 8px 18px rgba(17,24,39,0.04)",
  },

  editor: {
    minHeight: 300,
    maxHeight: 360,
    overflowY: "auto",
    padding: 14,
    outline: "none",
    fontSize: 14,
    lineHeight: 1.8,
    color: "#111827",
    whiteSpace: "normal",
    wordBreak: "break-word",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  editorHint: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
    flexShrink: 0,
  },

  attachCompactCard: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 18,
    padding: 12,
    background:
      "radial-gradient(700px 180px at 15% 0%, rgba(0,123,255,0.03), transparent 55%), linear-gradient(180deg,#ffffff,#fbfdff)",
    boxShadow: "0 10px 24px rgba(17,24,39,0.04)",
    overflow: "hidden",
    minWidth: 0,
  },

  attachCompactHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  attachSub: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
  },

  attachActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },

  filePickBtn: {
    padding: "10px 13px",
    borderRadius: 14,
    border: "1px solid rgba(11,94,215,0.20)",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxShadow: "0 12px 24px rgba(11,94,215,0.16)",
  },

  fileGhostBtn: {
    padding: "10px 13px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxShadow: "0 8px 18px rgba(17,24,39,0.04)",
  },

  fileMuted: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  fileTagsCompact: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 8,
    maxHeight: 130,
    overflowY: "auto",
    paddingRight: 2,
  },

  fileChip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    border: "1px solid rgba(148,163,184,0.22)",
    padding: "8px 10px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 6px 14px rgba(17,24,39,0.04)",
    minWidth: 0,
  },

  fileChipLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flex: 1,
    overflow: "hidden",
  },

  fileTagIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(0,163,255,0.10), rgba(255,140,0,0.10))",
    flexShrink: 0,
  },

  fileTagName: {
    fontSize: 12,
    fontWeight: 900,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },

  fileTagMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
  },

  removeBtn: {
    height: 28,
    minWidth: 28,
    padding: "0 8px",
    borderRadius: 999,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
    color: "#111827",
    fontWeight: 900,
    boxShadow: "0 6px 12px rgba(17,24,39,0.04)",
    flexShrink: 0,
  },

  actionBar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    flexShrink: 0,
  },

  previewBox: {
    border: "1px solid rgba(148,163,184,0.20)",
    borderRadius: 18,
    padding: 8,
    background: "#fff",
    overflow: "auto",
    flex: 1,
    minHeight: 0,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },

  primary: {
    padding: "11px 14px",
    borderRadius: 14,
    border: "1px solid rgba(11,94,215,0.20)",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxShadow: "0 12px 24px rgba(11,94,215,0.16)",
  },

  secondary: {
    padding: "11px 14px",
    borderRadius: 14,
    border: "1px solid rgba(17,24,39,0.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  err: {
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#991b1b",
    padding: "10px 12px",
    borderRadius: 16,
    fontWeight: 900,
    fontSize: 13,
  },

  ok: {
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: 16,
    fontWeight: 900,
    fontSize: 13,
  },
};