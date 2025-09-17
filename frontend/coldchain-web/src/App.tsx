import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Units from "./pages/Units";
import Thresholds from "./pages/Thresholds";
import Alerts from "./pages/Alerts";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/units" element={<Units />} />
          <Route path="/thresholds" element={<Thresholds />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>
          ColdChain Web • <Link to="/units">Units</Link> •{" "}
          <Link to="/thresholds">Thresholds</Link> •{" "}
          <Link to="/alerts">Alerts</Link>
        </span>
      </footer>
    </div>
  );
}
