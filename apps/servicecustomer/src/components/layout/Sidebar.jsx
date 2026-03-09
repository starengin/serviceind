import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, logout } from "../../lib/auth.js";

const nav = [
  { to: "/app", label: "Home" },
  { to: "/app/transactions", label: "Transactions" },
];

export default function Sidebar() {
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
    logout();
    window.location.href = PUBLIC_HOME;
  }

  const initial = String(user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <aside className="h-screen w-72 border-r border-slate-200/70 bg-white/88 backdrop-blur-xl shadow-[0_14px_40px_rgba(15,23,42,0.06)] flex flex-col">
        <div className="h-20 px-5 border-b border-slate-200/70 flex items-center justify-between">
          <div className="min-w-0">
            <div
              className="truncate text-[22px] font-extrabold tracking-tight"
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
            <div className="text-xs text-slate-500 -mt-0.5">
              Customer Portal
            </div>
          </div>

          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
            LIVE
          </span>
        </div>

        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white grid place-items-center text-sm font-extrabold shadow-[0_10px_24px_rgba(37,99,235,0.20)]">
              {initial}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {user?.name || "Customer"}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email || "Portal User"}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]"
                    : "text-slate-700 hover:bg-blue-50 hover:text-[#0f3d91]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/70">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
          >
            Logout
          </button>

          <div className="mt-4 text-center text-xs text-slate-500">
            Industrial • Reliable • Modern
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLogoutModal}
            />

            <motion.div
              className="fixed inset-0 z-[95] flex items-center justify-center px-4"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{
                    background:
                      "linear-gradient(90deg, #0f3d91 0%, #2563eb 40%, #0ea5e9 72%, #f59e0b 100%)",
                  }}
                />

                <div className="p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0f3d91] via-[#2563eb] to-[#f59e0b] text-white grid place-items-center shadow-[0_14px_34px_rgba(37,99,235,0.22)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
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
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                        Logout from portal?
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        You are about to sign out of your Service India customer
                        portal session and return to the public website.
                      </p>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700 shadow-sm">
                        Session for:{" "}
                        <span className="font-bold text-slate-900">
                          {user?.name || user?.email || "Customer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeLogoutModal}
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Stay here
                    </button>

                    <button
                      type="button"
                      onClick={confirmLogout}
                      className="h-11 rounded-2xl px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.24)] transition hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background:
                          "linear-gradient(135deg, #0f3d91 0%, #2563eb 52%, #0ea5e9 78%, #f59e0b 100%)",
                      }}
                    >
                      Yes, logout
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