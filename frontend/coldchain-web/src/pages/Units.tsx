import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit } from "../api/client";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<Unit[]>("/api/units")
      .then((r) => setUnits(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async () => {
    if (!name || !location) return;
    setBusy(true);
    try {
      await api.post("/api/units", { name, location });
      setName("");
      setLocation("");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <header className="page-head">
        <h1>Units</h1>
      </header>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">Create Unit</h3>
          <label>
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Freezer A"
            />
          </label>
          <label>
            <span>Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Warehouse 1"
            />
          </label>
          <button disabled={busy} onClick={create}>
            Save
          </button>
        </div>

        <div className="card">
          <h3 className="card-title">Existing</h3>
          {loading ? (
            <Loader />
          ) : units.length === 0 ? (
            <EmptyState title="No units" />
          ) : (
            <div className="table">
              <div className="t-head">
                <div>ID</div>
                <div>Name</div>
                <div>Location</div>
              </div>
              <div className="t-body">
                {units.map((u) => (
                  <div key={u.id} className="t-row">
                    <div>{u.id}</div>
                    <div>{u.name}</div>
                    <div className="muted">{u.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
