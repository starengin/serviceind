import { Routes, Route } from "react-router-dom";
import SiteLayout from "../components/layout/SiteLayout";

import Home from "../pages/Home/Home";
import Work from "../pages/Work/Work.jsx"; // ✅ NEW
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";

import Privacy from "../pages/Legal/Privacy";
import Terms from "../pages/Legal/Terms";
import WorkPolicy from "../pages/Legal/WorkPolicy";
import Refund from "../pages/Legal/Refund";
import CancellationPolicy from "../pages/Legal/CancellationPolicy";

import LoginRedirect from "../pages/LoginRedirect";
import AdminLoginRedirect from "../pages/AdminLoginRedirect";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />

        {/* ✅ Shop ➜ Work */}
        <Route path="/work" element={<Work />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
<Route path="/work-policy" element={<WorkPolicy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />

        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/admin/login" element={<AdminLoginRedirect />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}