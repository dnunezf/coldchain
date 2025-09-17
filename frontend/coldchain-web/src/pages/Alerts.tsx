import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit, Alert } from "../api/client";

export default function Alerts() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [status, setStatus] = useState<1 | 2 | undefined>(1);
  const [items, setItems] = useState<Alert[]>([]);

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      if (r.data.length) setUnitId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!unitId) return;
    api
      .get<Alert[]>("/api/alerts", { params: { unitId, status } })
      .then((r) => setItems(r.data));
  }, [unitId, status]);

  return (
    <section>
      <h1>Alerts</h1>
      <div className="row">
        <div className="card">
          <label>Unit</label>
          <select
            value={unitId ?? ""}
            onChange={(e) => setUnitId(Number(e.target.value))}
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <label>Status</label>
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
        </div>

        <div className="card">
          <h3>Results</h3>
          <ul className="list">
            {items.map((a) => (
              <li key={a.id}>
                <b>{a.metric === 1 ? "Temperature" : "Humidity"}</b> — opened{" "}
                {new Date(a.openedAtUtc).toLocaleString()}
                {a.closedAtUtc
                  ? `, closed ${new Date(a.closedAtUtc).toLocaleString()}`
                  : ", still open"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
