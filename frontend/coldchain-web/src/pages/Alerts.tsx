import { useEffect, useMemo, useState } from "react";
import { api, fmtDate } from "../api/client";
import type { Unit, Alert } from "../api/client";
import Badge from "../components/Badge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const PAGE = 10;

export default function Alerts() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [status, setStatus] = useState<1 | 2 | undefined>(1);
  const [metric, setMetric] = useState<1 | 2 | 0>(0); // 0=all
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(
    () => items.filter((a) => (metric === 0 ? true : a.metric === metric)),
    [items, metric]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageItems = filtered.slice((page - 1) * PAGE, page * PAGE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const exportCsv = () => {
    const rows = [["Id", "Metric", "Status", "OpenedAt", "ClosedAt"]];
    filtered.forEach((a) =>
      rows.push([
        String(a.id),
        a.metric === 1 ? "Temperature" : "Humidity",
        a.status === 1 ? "Open" : "Closed",
        fmtDate(a.openedAtUtc),
        a.closedAtUtc ? fmtDate(a.closedAtUtc) : "",
      ])
    );
    const csv = rows
      .map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alerts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <label>
            <span>Metric</span>
            <select
              value={metric}
              onChange={(e) => setMetric(Number(e.target.value) as 0 | 1 | 2)}
            >
              <option value={0}>All</option>
              <option value={1}>Temperature</option>
              <option value={2}>Humidity</option>
            </select>
          </label>
          <button onClick={exportCsv}>Export CSV</button>
        </div>
      </header>

      <div className="card">
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No alerts"
            desc="No alerts for the selected filters."
          />
        ) : (
          <>
            <ul className="grid grid-alerts">
              {pageItems.map((a) => (
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <div className="muted">Total: {filtered.length}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <div className="muted">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
