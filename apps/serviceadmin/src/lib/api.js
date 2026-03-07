import axios from "axios";

const base =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://api.serviceind.co.in");

const API = axios.create({
  baseURL: base,
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("serviceind_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// helper: always return data
async function getData(promise) {
  const res = await promise;
  return res.data;
}

export const api = {
  // Admin Auth
  adminCaptcha: () => getData(API.get("/admin/captcha")),
  adminLogin: (data) => getData(API.post("/admin/login", data)),

  // Dashboard
  dashboard: (params) => getData(API.get("/dashboard", { params })),

  // Customers
  customers: () => getData(API.get("/customers")),
  createCustomer: (data) => getData(API.post("/customers", data)),
  updateCustomer: (id, data) => getData(API.put(`/customers/${id}`, data)),
  deleteCustomer: (id) => getData(API.delete(`/customers/${id}`)),
  sendCustomerCredentials: (id, password) =>
    getData(API.post(`/customers/${id}/send-welcome-email`, { password })),

  // Transactions
  transactions: (params) => getData(API.get("/transactions", { params })),

  createTransaction: (formData) =>
    getData(
      API.post("/transactions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  updateTransaction: (id, data) =>
    getData(API.put(`/transactions/${id}`, data)),

  deleteTransaction: (id) =>
    getData(API.delete(`/transactions/${id}`)),

  sendTransactionEmail: (id) =>
    getData(API.post(`/transactions/${id}/send-email`)),

  scanTransactionPDF: (file) => {
    const fd = new FormData();
    fd.append("pdf", file);

    return getData(
      API.post("/transactions/scan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  addTransactionPDFs: (id, files) => {
    const fd = new FormData();
    for (const f of files) fd.append("pdfs", f);

    return getData(
      API.post(`/transactions/${id}/pdfs`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  deleteTransactionPDF: (id, pdfId) =>
    getData(API.delete(`/transactions/${id}/pdfs/${pdfId}`)),

  // Ledger
  adminLedger: (partyId, from, to) =>
    getData(
      API.get(`/ledger/${encodeURIComponent(partyId)}`, {
        params: { from, to },
      })
    ),

  exportAdminLedgerPdf: (partyId, from, to, token) => {
    return `${base}/ledger/${encodeURIComponent(
      partyId
    )}/pdf?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to
    )}&token=${encodeURIComponent(token)}`;
  },

  // Admin Email Center
  sendAdminEmail: ({ to, subject, html, mainPdf, extraFiles = [] }) => {
    const fd = new FormData();
    fd.append("to", to);
    fd.append("subject", subject);
    fd.append("html", html || "");

    if (mainPdf) fd.append("mainPdf", mainPdf);
    for (const f of extraFiles) fd.append("extraFiles", f);

    return getData(
      API.post("/admin/emails/send", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  adminLeads: () => getData(API.get("/admin/leads")),

  adminSendEmail: (payload) => {
    const fd = new FormData();
    fd.append("to", payload.to);
    fd.append("subject", payload.subject);
    fd.append("html", payload.html);

    if (payload.mainPdf) fd.append("mainPdf", payload.mainPdf);
    (payload.extraFiles || []).forEach((f) => fd.append("extraFiles", f));

    return getData(
      API.post("/admin/emails/send", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

export default API;