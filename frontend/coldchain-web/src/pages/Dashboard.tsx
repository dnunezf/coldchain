import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { Unit, Reading } from "../api/client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      if (r.data.length) setUnitId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    api
      .get<Reading[]>("/api/readings", { params: { unitId, from } })
      .then((r) => setReadings(r.data))
      .finally(() => setLoading(false));
  }, [unitId]);

  const temp = readings.filter((r) => r.sensorType === 1);
  const hum = readings.filter((r) => r.sensorType === 2);

  const data = useMemo(
    () => ({
      labels: readings.map((r) =>
        new Date(r.recordedAtUtc).toLocaleTimeString()
      ),
      datasets: [
        { label: "Temperature (°C)", data: temp.map((r) => r.value) },
        { label: "Humidity (%)", data: hum.map((r) => r.value) },
      ],
    }),
    [readings]
  );

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="row">
        <div className="card">
          <label>Unit</label>
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
        </div>
      </div>
      <div className="card">
        {loading ? <p>Loading...</p> : <Line data={data} />}
      </div>
    </section>
  );
}
