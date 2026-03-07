import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ 1) window scroll
    window.scrollTo(0, 0);

    // ✅ 2) agar app me inner scroll container ho
    const main = document.querySelector(".main");
    if (main && typeof main.scrollTo === "function") {
      main.scrollTo(0, 0);
    } else if (main) {
      main.scrollTop = 0;
    }

    // ✅ 3) fallback: document roots
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}