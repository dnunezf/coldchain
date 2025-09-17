import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit, Threshold } from "../api/client";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

export default function Thresholds() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [items, setItems] = useState<Threshold[]>([]);
  const [metric, setMetric] = useState<1 | 2>(1);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    t: string;
    tone: "ok" | "warn" | "danger" | "info";
  } | null>(null);

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

  const valid = unitId && !Number.isNaN(min) && !Number.isNaN(max) && min < max;

  const upsert = async () => {
    if (!unitId || !valid) {
      setToast({ t: "Please enter a valid range (min < max).", tone: "warn" });
      return;
    }
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
      setToast({ t: "Threshold saved.", tone: "ok" });
      load();
    } catch {
      setToast({ t: "Failed to save threshold.", tone: "danger" });
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
          <button disabled={busy || !valid} onClick={upsert}>
            Save
          </button>
          {!valid && (
            <div className="muted" style={{ marginTop: 8 }}>
              Min must be less than Max.
            </div>
          )}
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

      {toast && (
        <Toast
          text={toast.t}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
