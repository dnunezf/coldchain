import { useEffect, useState } from "react";
import { api, fmtDate } from "../api/client";
import type { Unit, Alert } from "../api/client";
import Badge from "../components/Badge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

export default function Alerts() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [status, setStatus] = useState<1 | 2 | undefined>(1);
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      if (r.data.length) setUnitId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    api
      .get<Alert[]>("/api/alerts", { params: { unitId, status } })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [unitId, status]);

  return (
    <section className="page">
      <header className="page-head">
        <h1>Alerts</h1>
        <div className="filters">
          <label>
            <span>Unit</span>
            <select
              value={unitId ?? ""}
              onChange={(e) => setUnitId(Number(e.target.value))}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.location}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              value={status ?? ""}
              onChange={(e) =>
                setStatus(
                  e.target.value ? (Number(e.target.value) as 1 | 2) : undefined
                )
              }
            >
              <option value="1">Open</option>
              <option value="2">Closed</option>
              <option value="">All</option>
            </select>
          </label>
        </div>
      </header>

      <div className="card">
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState
            title="No alerts"
            desc="No alerts for the selected filters."
          />
        ) : (
          <ul className="grid grid-alerts">
            {items.map((a) => (
              <li key={a.id} className="alert-row">
                <div className="alert-main">
                  <div className="alert-title">
                    {a.metric === 1 ? "Temperature" : "Humidity"}
                  </div>
                  <Badge tone={a.status === 1 ? "danger" : "ok"}>
                    {a.status === 1 ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="alert-meta">
                  <div>
                    <span>Opened:</span> {fmtDate(a.openedAtUtc)}
                  </div>
                  <div>
                    <span>Closed:</span>{" "}
                    {a.closedAtUtc ? fmtDate(a.closedAtUtc) : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
