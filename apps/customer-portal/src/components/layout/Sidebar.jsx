import { NavLink } from "react-router-dom";
import { getUser, logout } from "../../lib/auth.js";

const nav = [
  { to: "/app", label: "Home" },
  { to: "/app/transactions", label: "Transactions" },
];

export default function Sidebar() {
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
    <aside className="h-screen w-72 border-r border-slate-200/70 bg-white/88 backdrop-blur-xl shadow-[0_14px_40px_rgba(15,23,42,0.06)] flex flex-col">
      {/* HEADER */}
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

      {/* USER */}
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

      {/* NAV */}
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

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-200/70">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
        >
          Logout
        </button>

        <div className="mt-4 text-center text-xs text-slate-500">
          Industrial • Reliable • Modern
        </div>
      </div>
    </aside>
  );
}