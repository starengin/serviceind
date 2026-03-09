import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, logout } from "../../lib/auth.js";

const nav = [
  { to: "/app", label: "Home" },
  { to: "/app/transactions", label: "Transactions" },
];

export default function MobileSidebar({ open, onClose }) {
  const user = getUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const PUBLIC_HOME =
    import.meta.env.VITE_PUBLIC_HOME_URL ||
    (import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://www.serviceind.co.in");

  function handleLogoutClick() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function confirmLogout() {
    setShowLogoutModal(false);
    onClose?.();
    logout();
    window.location.href = PUBLIC_HOME;
  }

  const initial = String(user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-[84vw] max-w-[320px] bg-white shadow-2xl flex flex-col lg:hidden"
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="h-20 px-4 border-b border-slate-200 flex items-center justify-between">
                <div className="min-w-0">
                  <div
                    className="truncate text-[17px] font-extrabold tracking-tight"
                    style={{
                      background:
                        "linear-gradient(135deg, #0f3d91 0%, #2563eb 48%, #0ea5e9 78%, #f59e0b 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    SERVICE INDIA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Customer Portal
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-700">
                    LIVE
                  </span>

                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="px-4 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white grid place-items-center text-sm font-extrabold shadow-[0_10px_24px_rgba(37,99,235,0.20)]">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {user?.name || "Customer"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {user?.email || "Portal User"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2 flex-1">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/app"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]"
                          : "text-slate-700 hover:bg-blue-50 hover:text-[#0f3d91]"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </div>

              <div className="p-3 border-t border-slate-200">
                <button
                  className="w-full rounded-2xl px-4 py-3 text-sm font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>

                <div className="mt-4 text-xs text-slate-500 text-center">
                  Industrial • Fast • Mobile Ready
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLogoutModal}
            />

            <motion.div
              className="fixed inset-0 z-[95] flex items-center justify-center px-4 lg:hidden"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="relative w-full max-w-sm overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{
                    background:
                      "linear-gradient(90deg, #0f3d91 0%, #2563eb 40%, #0ea5e9 72%, #f59e0b 100%)",
                  }}
                />

                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white grid place-items-center shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H9m4 8H7a2 2 0 01-2-2V6a2 2 0 012-2h6"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                        Logout from portal?
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        You are about to sign out and return to the Service
                        India public website.
                      </p>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm">
                        Session for:{" "}
                        <span className="font-bold text-slate-900">
                          {user?.name || user?.email || "Customer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={confirmLogout}
                      className="h-11 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.24)] transition active:scale-[0.98]"
                      style={{
                        background:
                          "linear-gradient(135deg, #0f3d91 0%, #2563eb 52%, #0ea5e9 78%, #f59e0b 100%)",
                      }}
                    >
                      Yes, logout
                    </button>

                    <button
                      type="button"
                      onClick={closeLogoutModal}
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Stay here
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}