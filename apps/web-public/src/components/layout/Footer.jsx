import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div>
          <div className="footerBrand">STAR ENGINEERING</div>
          <div className="muted">Quality engineering products & services.</div>
        </div>

        <div className="footerLinks">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Condition</Link>
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/refund">Refund Policy</Link>
          <Link to="/return">Return Policy</Link>
        </div>
      </div>

      <div className="container footBottom">
        <span className="muted">© {new Date().getFullYear()} STAR Engineering</span>
      </div>
    </footer>
  );
}