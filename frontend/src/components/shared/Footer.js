import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="nav-link">
        <span className="vaultpay-wallet" title="Home">
Copyright © 2023 &nbsp;VaultPay Wallet
        </span>
      </Link>
      <Link to="/about" className="nav-link">
        <span className="about">
          About
        </span>
      </Link>
    </footer>
  );
}
