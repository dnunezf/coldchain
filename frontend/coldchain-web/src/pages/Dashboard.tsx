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
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
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
  const [range, setRange] = useState<"24h" | "7d">("24h");

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      setUnitId(r.data[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!unitId) return;
    const ms = range === "24h" ? 24 * 3600e3 : 7 * 24 * 3600e3;
    const fetchData = () => {
      setLoading(true);
      const from = new Date(Date.now() - ms).toISOString();
      api
        .get<Reading[]>("/api/readings", { params: { unitId, from } })
        .then((r) => setReadings(r.data ?? []))
        .finally(() => setLoading(false));
    };
    fetchData();
    const t = setInterval(fetchData, 15000);
    return () => clearInterval(t);
  }, [unitId, range]);

  const temp = readings.filter((r) => r.sensorType === 1);
  const hum = readings.filter((r) => r.sensorType === 2);
  const labels = useMemo(
    () =>
      readings.map((r) =>
        new Date(r.recordedAtUtc).toLocaleTimeString([], { hour12: false })
      ),
    [readings]
  );
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temp.map((r) => r.value),
          borderWidth: 2,
        },
        {
          label: "Humidity (%)",
          data: hum.map((r) => r.value),
          borderWidth: 2,
        },
      ],
    }),
    [labels, temp, hum]
  );

  const lastTemp = temp.at(-1)?.value ?? "-";
  const lastHum = hum.at(-1)?.value ?? "-";

  return (
    <section className="page">
      <header className="page-head">
        <h1>Dashboard</h1>
        <div className="filters">
          <label>
            <span>Unit</span>
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
          </label>
          <label>
            <span>Range</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
            </select>
          </label>
        </div>
      </header>

      <div className="grid grid-kpi">
        <StatCard title="Temperature" value={lastTemp} unit="°C" tone="info" />
        <StatCard title="Humidity" value={lastHum} unit="%" tone="ok" />
        <StatCard
          title="Status"
          value={readings.length > 0 ? "Online" : "—"}
          tone={readings.length > 0 ? "ok" : "warn"}
        />
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : readings.length === 0 ? (
          <EmptyState title="No data for the selected range." />
        ) : (
          <div className="chart">
            <Line
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
