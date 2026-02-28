import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import MobileSidebar from "./MobileSidebar.jsx";

export default function AppShell() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="hidden lg:block"><Sidebar /></div>
      <div className="lg:hidden"><MobileSidebar /></div>

      <div className="lg:pl-72">
        <Topbar />
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
