import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit, Threshold } from "../api/client";

export default function Thresholds() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [items, setItems] = useState<Threshold[]>([]);
  const [metric, setMetric] = useState<1 | 2>(1);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(0);

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      if (r.data.length) setUnitId(r.data[0].id);
    });
  }, []);

  const load = () => {
    if (!unitId) return;
    api
      .get<Threshold[]>(`/api/thresholds/${unitId}`)
      .then((r) => setItems(r.data));
  };
  useEffect(() => {
    load();
  }, [unitId]);

  const upsert = async () => {
    if (!unitId) return;
    await api.put("/api/thresholds", {
      refrigerationUnitId: unitId,
      metric,
      min,
      max,
    });
    setMin(0);
    setMax(0);
    load();
  };

  return (
    <section>
      <h1>Thresholds</h1>
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

          <label>Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>Temperature</option>
            <option value={2}>Humidity</option>
          </select>

          <div className="grid2">
            <input
              type="number"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
            />
          </div>
          <button onClick={upsert}>Save</button>
        </div>

        <div className="card">
          <h3>Current</h3>
          <ul className="list">
            {items.map((t) => (
              <li key={t.id}>
                <b>{t.metric === 1 ? "Temperature" : "Humidity"}</b> → {t.min}{" "}
                .. {t.max}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
