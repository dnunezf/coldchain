import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit, Threshold } from "../api/client";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

export default function Thresholds() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [items, setItems] = useState<Threshold[]>([]);
  const [metric, setMetric] = useState<1 | 2>(1);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      if (r.data.length) setUnitId(r.data[0].id);
    });
  }, []);

  const load = () => {
    if (!unitId) return;
    setLoading(true);
    api
      .get<Threshold[]>(`/api/thresholds/${unitId}`)
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, [unitId]);

  const upsert = async () => {
    if (!unitId) return;
    setBusy(true);
    try {
      await api.put("/api/thresholds", {
        refrigerationUnitId: unitId,
        metric,
        min,
        max,
      });
      setMin(0);
      setMax(0);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <header className="page-head">
        <h1>Thresholds</h1>
        <div className="filters">
          <label>
            <span>Unit</span>
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
          </label>
        </div>
      </header>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">Edit</h3>
          <label>
            <span>Metric</span>
            <select
              value={metric}
              onChange={(e) => setMetric(Number(e.target.value) as 1 | 2)}
            >
              <option value={1}>Temperature</option>
              <option value={2}>Humidity</option>
            </select>
          </label>
          <div className="grid grid-2">
            <label>
              <span>Min</span>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
              />
            </label>
            <label>
              <span>Max</span>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
              />
            </label>
          </div>
          <button disabled={busy} onClick={upsert}>
            Save
          </button>
        </div>

        <div className="card">
          <h3 className="card-title">Current</h3>
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState title="No thresholds" />
          ) : (
            <ul className="list">
              {items.map((t) => (
                <li key={t.id} className="list-row">
                  <b>{t.metric === 1 ? "Temperature" : "Humidity"}</b>
                  <span>
                    {t.min} – {t.max}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
