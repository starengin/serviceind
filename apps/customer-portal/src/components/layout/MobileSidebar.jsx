import { useState } from "react";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/transactions", label: "Transactions" }
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="h-14 bg-white/80 backdrop-blur border-b flex items-center px-3 justify-between">
        <button className="btn-ghost" onClick={() => setOpen(true)}>Menu</button>
        <div className="text-sm font-semibold">Your Reports</div>
        <div className="w-16" />
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-3">
            <div className="h-12 flex items-center justify-between px-2">
              <div className="font-semibold">Navigation</div>
              <button className="btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="space-y-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
