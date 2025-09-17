import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { Reading, Unit } from "../api/client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
// Register only what we use
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .get<Unit[]>("/api/units")
      .then((r) => {
        if (!alive) return;
        setUnits(r.data);
        setUnitId(r.data[0]?.id ?? "");
      })
      .catch((e) => setErr(e?.message ?? "Failed to load units"));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    setErr(null);
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    api
      .get<Reading[]>("/api/readings", { params: { unitId, from } })
      .then((r) => setReadings(r.data ?? []))
      .catch((e) => setErr(e?.message ?? "Failed to load readings"))
      .finally(() => setLoading(false));
  }, [unitId]);

  const temp = readings.filter((r) => r.sensorType === 1);
  const hum = readings.filter((r) => r.sensorType === 2);

  const labels = useMemo(
    () => readings.map((r) => new Date(r.recordedAtUtc).toLocaleTimeString()),
    [readings]
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        { label: "Temperature (°C)", data: temp.map((r) => r.value) },
        { label: "Humidity (%)", data: hum.map((r) => r.value) },
      ],
    }),
    [labels, temp, hum]
  );

  return (
    <section>
      <h1>Dashboard</h1>

      <div className="row">
        <div className="card">
          <label>Unit</label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a unit…
            </option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.location}
              </option>
            ))}
          </select>
          {err && <p style={{ color: "#ff9797" }}>{err}</p>}
        </div>
      </div>

      <div className="card">
        {loading && <p>Loading...</p>}
        {!loading && readings.length === 0 && <p>No data for the last 24h.</p>}
        {!loading && readings.length > 0 && (
          <div style={{ height: 360 }}>
            <Line
              data={data}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
