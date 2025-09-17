import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const is = (p: string) => pathname === p;
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand">ColdChain</div>
        <nav>
          <Link className={is("/") ? "active" : ""} to="/">
            Dashboard
          </Link>
          <Link className={is("/units") ? "active" : ""} to="/units">
            Units
          </Link>
          <Link className={is("/thresholds") ? "active" : ""} to="/thresholds">
            Thresholds
          </Link>
          <Link className={is("/alerts") ? "active" : ""} to="/alerts">
            Alerts
          </Link>
        </nav>
      </div>
    </header>
  );
}
