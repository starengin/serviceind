import { Routes, Route } from "react-router-dom";
import SiteLayout from "../components/layout/SiteLayout";

import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop.jsx";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";

import Privacy from "../pages/Legal/Privacy";
import Terms from "../pages/Legal/Terms";
import Shipping from "../pages/Legal/Shipping";
import Refund from "../pages/Legal/Refund";
import Return from "../pages/Legal/Return";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/return" element={<Return />} />
        
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}