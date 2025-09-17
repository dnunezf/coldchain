import { useEffect, useMemo, useRef, useState } from "react";
import { api, loadPref, savePref } from "../api/client";
import type { Reading, Unit, Threshold } from "../api/client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Chart,
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

type Range = "24h" | "7d";
const PREF_UNIT = "cc.unit";
const PREF_RANGE = "cc.range";
const PREF_AUTO = "cc.auto";
const PREF_IV = "cc.iv";

/** Lightweight drag-zoom + wheel zoom/pan plugin */
const zoomPlugin = {
  id: "ccZoom",
  beforeEvent(chart: Chart, args: any) {
    const e = args.event?.native ?? args.event;
    if (!e) return;
    const ca = chart.chartArea;
    const xScale: any = chart.scales.x;
    if (!xScale) return;

    const st =
      (chart as any)._zoomState ??
      ((chart as any)._zoomState = { drag: false, sx: 0, ex: 0 });

    const inArea = (x: number, y: number) =>
      x >= ca.left && x <= ca.right && y >= ca.top && y <= ca.bottom;
    const range = () => {
      const min =
        xScale.min ?? xScale.options.min ?? xScale.getUserBounds().min;
      const max =
        xScale.max ?? xScale.options.max ?? xScale.getUserBounds().max;
      return { min, max };
    };
    const apply = (min: number, max: number) => {
      xScale.options.min = min;
      xScale.options.max = max;
      chart.update("none");
    };

    // Mouse down: start drag to zoom
    if (e.type === "mousedown" && inArea(e.x, e.y)) {
      st.drag = true;
      st.sx = e.x;
      st.ex = e.x;
    }

    // Mouse move: update rectangle
    if (e.type === "mousemove" && st.drag) {
      st.ex = e.x;
      chart.draw();
    }

    // Mouse up: perform zoom if width > threshold
    if (e.type === "mouseup" && st.drag) {
      st.drag = false;
      const w = Math.abs(st.ex - st.sx);
      if (w > 10) {
        const x1 = Math.min(st.sx, st.ex);
        const x2 = Math.max(st.sx, st.ex);
        const v1 = xScale.getValueForPixel(x1);
        const v2 = xScale.getValueForPixel(x2);
        if (v1 < v2) apply(v1, v2);
      }
      chart.draw();
    }

    // Double click: reset zoom
    if (e.type === "dblclick") {
      xScale.options.min = undefined;
      xScale.options.max = undefined;
      chart.update("none");
    }

    // Wheel:
    //  - Zoom centered at cursor (no modifier)
    //  - Pan with Shift + wheel
    if (e.type === "wheel" && inArea(e.x, e.y)) {
      e.preventDefault?.();
      const { min, max } = range();
      const cur = xScale.getValueForPixel(e.x);

      if (e.shiftKey) {
        // PAN: move by 10% of current range per wheel notch
        const span = max - min;
        const dir = e.deltaY > 0 ? 1 : -1;
        const shift = span * 0.1 * dir;
        apply(min + shift, max + shift);
      } else {
        // ZOOM: factor 0.9 in, 1.1 out
        const factor = e.deltaY < 0 ? 0.9 : 1.1;
        const newMin = cur - (cur - min) * factor;
        const newMax = cur + (max - cur) * factor;
        if (newMax - newMin > 1000) apply(newMin, newMax);
      }
    }
  },
  afterDraw(chart: Chart) {
    const st = (chart as any)._zoomState;
    if (!st?.drag) return;
    const { ctx, chartArea } = chart;
    const x1 = st.sx;
    const x2 = st.ex;
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    ctx.save();
    ctx.fillStyle = "rgba(58,160,255,0.15)";
    ctx.strokeStyle = "rgba(58,160,255,0.9)";
    ctx.lineWidth = 1;
    ctx.fillRect(
      left,
      chartArea.top,
      right - left,
      chartArea.bottom - chartArea.top
    );
    ctx.strokeRect(
      left,
      chartArea.top,
      right - left,
      chartArea.bottom - chartArea.top
    );
    ctx.restore();
  },
};

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<Range>(
    (loadPref(PREF_RANGE, "24h") as Range) || "24h"
  );
  const [auto, setAuto] = useState(loadPref(PREF_AUTO, "1") === "1");
  const [intervalSec, setIntervalSec] = useState<number>(
    Number(loadPref(PREF_IV, "15")) || 15
  );
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const timerRef = useRef<number | null>(null);

  // Threshold shading plugin (temperature band)
  const bandPlugin = useMemo(
    () => ({
      id: "thresholdBand",
      beforeDraw(chart: Chart) {
        const t = thresholds.find((x) => x.metric === 1);
        if (!t) return;
        const { ctx, chartArea, scales } = chart;
        const y = scales["y"] as any;
        const top = y.getPixelForValue(t.max);
        const bottom = y.getPixelForValue(t.min);
        ctx.save();
        ctx.fillStyle = "rgba(58,160,255,0.08)";
        ctx.fillRect(
          chartArea.left,
          Math.min(top, bottom),
          chartArea.right - chartArea.left,
          Math.abs(bottom - top)
        );
        ctx.restore();
      },
    }),
    [thresholds]
  );

  useEffect(() => {
    api.get<Unit[]>("/api/units").then((r) => {
      setUnits(r.data);
      const stored = Number(loadPref(PREF_UNIT, "0"));
      const initial =
        r.data.find((u) => u.id === stored)?.id ?? r.data[0]?.id ?? "";
      setUnitId(initial);
    });
  }, []);

  const fetchAll = () => {
    if (!unitId) return;
    const ms = range === "24h" ? 24 * 3600e3 : 7 * 24 * 3600e3;
    setLoading(true);
    const from = new Date(Date.now() - ms).toISOString();
    Promise.all([
      api.get<Reading[]>("/api/readings", { params: { unitId, from } }),
      api.get<Threshold[]>(`/api/thresholds/${unitId}`),
    ])
      .then(([r1, r2]) => {
        setReadings(r1.data ?? []);
        setThresholds(r2.data ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, [unitId, range]);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (auto) {
      timerRef.current = window.setInterval(fetchAll, intervalSec * 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [auto, intervalSec, unitId, range]);

  useEffect(() => savePref(PREF_UNIT, String(unitId)), [unitId]);
  useEffect(() => savePref(PREF_RANGE, range), [range]);
  useEffect(() => savePref(PREF_AUTO, auto ? "1" : "0"), [auto]);
  useEffect(() => savePref(PREF_IV, String(intervalSec)), [intervalSec]);

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

  const resetZoom = () => {
    const anyChart = (Chart as any).instances?.[0] as Chart | undefined;
    if (!anyChart) return;
    const x: any = anyChart.scales.x;
    if (!x) return;
    x.options.min = undefined;
    x.options.max = undefined;
    anyChart.update("none");
  };

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
              onChange={(e) => setRange(e.target.value as Range)}
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
            </select>
          </label>
          <label>
            <span>Auto refresh</span>
            <select
              value={auto ? "on" : "off"}
              onChange={(e) => setAuto(e.target.value === "on")}
            >
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
          <label>
            <span>Interval</span>
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              disabled={!auto}
            >
              <option value={10}>10 s</option>
              <option value={15}>15 s</option>
              <option value={30}>30 s</option>
              <option value={60}>60 s</option>
            </select>
          </label>
          <button onClick={resetZoom}>Reset Zoom</button>
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
          <div className="chart zoom-cursor">
            <Line
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
              }}
              plugins={[zoomPlugin, bandPlugin]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
