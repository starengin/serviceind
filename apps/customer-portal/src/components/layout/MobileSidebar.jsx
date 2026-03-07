import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, logout } from "../../lib/auth.js";

const nav = [
  { to: "/app", label: "Home" },
  { to: "/app/transactions", label: "Transactions" },
];

export default function MobileSidebar({ open, onClose }) {
  const user = getUser();

  function handleLogout() {
    logout();

    const PUBLIC_HOME =
      import.meta.env.VITE_PUBLIC_HOME_URL ||
      (import.meta.env.DEV
        ? "http://localhost:5173"
        : "https://www.serviceind.co.in");

    window.location.href = PUBLIC_HOME;
  }

  const initial = String(user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
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
            {/* HEADER */}
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

            {/* USER */}
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

            {/* NAV */}
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

            {/* FOOTER */}
            <div className="p-3 border-t border-slate-200">
              <button
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                onClick={handleLogout}
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
  );
}