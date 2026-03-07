import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";

const IconBtn = ({ title, onClick, danger, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      height: 34,
      width: 38,
      borderRadius: 12,
      border: "1px solid rgba(2,6,23,0.12)",
      background: danger ? "rgba(239,68,68,0.08)" : "white",
      color: danger ? "#991b1b" : "#0f172a",
      fontWeight: 900,
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 6px 14px rgba(2,6,23,0.04)",
    }}
  >
    {children}
  </button>
);

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div style={S.modalBackdrop} onMouseDown={onClose}>
      <motion.div
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        style={S.modalCard}
      >
        <div style={S.modalHead}>
          <div style={S.modalTitle}>{title}</div>
          <button type="button" onClick={onClose} style={S.modalClose}>
            ✕
          </button>
        </div>
        <div style={S.modalBody}>{children}</div>
      </motion.div>
    </div>
  );
};

function Field({ label, children, full }) {
  return (
    <div style={{ ...S.field, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <div style={S.label}>{label}</div>
      {children}
    </div>
  );
}

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit | view
  const [saving, setSaving] = useState(false);

  const blank = { name: "", email: "", password: "", sendEmail: true };
  const [form, setForm] = useState(blank);

  async function load(keepSelectionId) {
    setErr("");
    setLoading(true);

    try {
      const res = await api.customers();
      const rows = res?.data ?? res ?? [];
      const arr = Array.isArray(rows) ? rows : [];
      setList(arr);

      if (keepSelectionId) {
        const found = arr.find((x) => x.id === keepSelectionId);
        setSelected(found || null);
      } else {
        setSelected(null);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;

    return list.filter((x) => {
      const name = (x?.name || "").toLowerCase();
      const email = (x?.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });
  }, [q, list]);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setForm(blank);
    setOpen(true);
  }

  function openView(row) {
    setMode("view");
    setSelected(row);
    setForm({
      name: row?.name || "",
      email: row?.email || "",
      password: "",
      sendEmail: false,
    });
    setOpen(true);
  }

  function openEdit(row) {
    setMode("edit");
    setSelected(row);
    setForm({
      name: row?.name || "",
      email: row?.email || "",
      password: "",
      sendEmail: false,
    });
    setOpen(true);
  }

  async function onSave() {
    setErr("");

    if (!form.name.trim()) return setErr("Customer name is required");
    if (!form.email.trim()) return setErr("Customer email is required");
    if (mode === "create" && !form.password.trim()) return setErr("Password is required");

    try {
      setSaving(true);

      if (mode === "create") {
        await api.createCustomer({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          sendEmail: !!form.sendEmail,
        });

        await load();
        setOpen(false);
        return;
      }

      if (mode === "edit" && selected?.id) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
        };

        if (form.password.trim()) {
          payload.password = form.password;
          payload.sendEmail = !!form.sendEmail;
        }

        await api.updateCustomer(selected.id, payload);
        await load(selected.id);
        setOpen(false);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row) {
    if (!row?.id) return;

    const ok = confirm(`Delete customer "${row.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      await api.deleteCustomer(row.id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  async function onSendCredentials(row) {
    try {
      const newPass = prompt(
        `Enter NEW password for "${row.name}" (min 4 chars).\n\nOld password cannot be retrieved.`
      );

      if (newPass === null) return;

      if (!String(newPass).trim() || String(newPass).trim().length < 4) {
        return alert("Password required (minimum 4 characters)");
      }

      await api.sendCustomerCredentials(row.id, String(newPass).trim());
      alert("Credentials email sent successfully ✅");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to send email");
    }
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div>
          <div style={S.badge}>SERVICE INDIA • Customer Management</div>
          <div style={S.h1}>Customers</div>
          <div style={S.sub}>
            Create, edit, view, delete and send customer portal credentials.
          </div>
        </div>

        <div style={S.topActions}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customer by name or email..."
            style={S.search}
          />
          <motion.button whileTap={{ scale: 0.98 }} onClick={openCreate} style={S.primary}>
            + Add Customer
          </motion.button>
        </div>
      </div>

      {err ? <div style={S.err}>{err}</div> : null}

      <div style={S.layout}>
        <div style={S.listCard}>
          <div style={S.listHead}>
            <div style={S.listTitle}>All Customers</div>
            <div style={S.listMeta}>
              {loading ? "Loading..." : `${filtered.length} record(s)`}
            </div>
          </div>

          {loading ? (
            <div style={S.muted}>Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div style={S.muted}>No customers found</div>
          ) : (
            <div style={S.list}>
              {filtered.map((row) => (
                <div key={row.id} style={S.listItem}>
                  <div style={S.itemLeft}>
                    <div style={S.avatar}>
                      {(row?.name || "?").trim().charAt(0).toUpperCase()}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={S.nameOnly}>{row.name}</div>
                      <div style={S.emailText}>{row.email || "No email"}</div>
                    </div>
                  </div>

                  <div style={S.actions}>
                    <IconBtn title="View" onClick={() => openView(row)}>👁</IconBtn>
                    <IconBtn title="Edit" onClick={() => openEdit(row)}>✏️</IconBtn>
                    <IconBtn title="Send Credentials Email" onClick={() => onSendCredentials(row)}>
                      ✉️
                    </IconBtn>
                    <IconBtn title="Delete" danger onClick={() => onDelete(row)}>🗑</IconBtn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={open}
        title={
          mode === "create"
            ? "Create Customer"
            : mode === "edit"
            ? "Edit Customer"
            : "View Customer"
        }
        onClose={() => setOpen(false)}
      >
        <div style={S.formGrid}>
          <Field label="Customer Name">
            <input
              style={S.input}
              value={form.name}
              disabled={mode === "view"}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Customer Email (Login)">
            <input
              style={S.input}
              value={form.email}
              disabled={mode === "view"}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              inputMode="email"
              autoComplete="off"
            />
          </Field>

          <Field label={mode === "create" ? "Password" : "Password (optional reset)"} full>
            <input
              style={S.input}
              value={form.password}
              disabled={mode === "view"}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              autoComplete="new-password"
              placeholder={mode === "edit" ? "Leave blank to keep same password" : ""}
            />
          </Field>

          {mode !== "view" && (
            <div style={S.checkWrap}>
              <label style={S.checkLabel}>
                <input
                  type="checkbox"
                  checked={!!form.sendEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sendEmail: e.target.checked }))
                  }
                />
                Send credentials email
              </label>

              <div style={S.checkHint}>
                Uncheck this if you want to create or update the customer without sending email.
              </div>
            </div>
          )}
        </div>

        <div style={S.modalFoot}>
          <button type="button" onClick={() => setOpen(false)} style={S.secondary}>
            Close
          </button>

          {mode !== "view" && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={saving}
              style={S.primary}
            >
              {saving
                ? "Saving..."
                : mode === "create"
                ? form.sendEmail
                  ? "Create & Send Email"
                  : "Create Customer"
                : "Save Changes"}
            </motion.button>
          )}
        </div>

        <div style={S.note}>
          Note: Customer credentials can be emailed directly from here. Later, a dedicated reset-password flow can be added for stronger security.
        </div>
      </Modal>
    </div>
  );
}

const S = {
  page: {
    padding: 14,
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.16)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 8,
  },

  h1: {
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
  },

  sub: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 700,
    marginTop: 6,
    lineHeight: 1.6,
  },

  topActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  search: {
    width: 290,
    maxWidth: "92vw",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.12)",
    fontSize: 13,
    outline: "none",
    fontFamily: "Arial, Helvetica, sans-serif",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    boxSizing: "border-box",
  },

  primary: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
    boxShadow: "0 12px 24px rgba(11,94,215,0.18)",
  },

  secondary: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  err: {
    marginBottom: 12,
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    fontSize: 13,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },

  listCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
    padding: 14,
    minHeight: 420,
    backdropFilter: "blur(10px)",
  },

  listHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  listTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  },

  listMeta: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800,
  },

  list: {
    display: "grid",
    gap: 10,
  },

  listItem: {
    width: "100%",
    border: "1px solid rgba(2,6,23,0.10)",
    borderRadius: 16,
    background: "white",
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  avatar: {
    height: 42,
    width: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(135deg,#0b3d91,#0b5ed7,#00a3ff,#ff8c00)",
    boxShadow: "0 10px 20px rgba(11,94,215,0.18)",
    flex: "0 0 auto",
  },

  nameOnly: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },

  emailText: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  actions: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
    flexWrap: "wrap",
  },

  muted: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 800,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.45)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 999,
  },

  modalCard: {
    width: "min(760px, 96vw)",
    background: "#fff",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 24px 90px rgba(2,6,23,0.30)",
    overflow: "hidden",
  },

  modalHead: {
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  },

  modalClose: {
    height: 34,
    width: 34,
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  modalBody: {
    padding: 14,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  field: {
    display: "grid",
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0f172a",
  },

  input: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.12)",
    outline: "none",
    fontSize: 13,
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#0f172a",
    background: "#fff",
  },

  checkWrap: {
    gridColumn: "1 / -1",
    marginTop: 4,
  },

  checkLabel: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontWeight: 900,
    fontSize: 12,
    color: "#0f172a",
  },

  checkHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    lineHeight: 1.5,
  },

  modalFoot: {
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    lineHeight: 1.6,
  },
};