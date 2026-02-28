import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/transactions", label: "Transactions" }
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-72 border-r bg-white/80 backdrop-blur">
      <div className="h-16 px-5 flex items-center justify-between">
        <div className="star-animated-gradient-text font-semibold text-slate-900">STAR ENGINEERING</div>
        <span className="text-xs text-slate-500">Portal</span>
      </div>

      <nav className="px-3 py-3 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/"}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-3 right-3 text-xs text-slate-500">
        Secure • Fast • Mobile Ready
      </div>
    </aside>
  );
}
