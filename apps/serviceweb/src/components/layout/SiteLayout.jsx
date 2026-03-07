import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function SiteLayout() {
  return (
    <div className="site">
      <ScrollToTop />   {/* ✅ TOP pe hona chahiye */}

      <Header />

      <main className="main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}