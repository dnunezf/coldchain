import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="navbar">
      <div className="brand">ColdChain</div>
      <nav>
        <Link className={pathname === "/" ? "active" : ""} to="/">
          Dashboard
        </Link>
        <Link className={pathname === "/units" ? "active" : ""} to="/units">
          Units
        </Link>
        <Link
          className={pathname === "/thresholds" ? "active" : ""}
          to="/thresholds"
        >
          Thresholds
        </Link>
        <Link className={pathname === "/alerts" ? "active" : ""} to="/alerts">
          Alerts
        </Link>
      </nav>
    </header>
  );
}
