import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Unit } from "../api/client";

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const load = () =>
    api.get<Unit[]>("/api/units").then((r) => setUnits(r.data));
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name || !location) return;
    await api.post("/api/units", { name, location });
    setName("");
    setLocation("");
    load();
  };

  return (
    <section>
      <h1>Units</h1>
      <div className="row">
        <div className="card">
          <h3>Create Unit</h3>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button onClick={create}>Save</button>
        </div>
        <div className="card">
          <h3>Existing</h3>
          <ul className="list">
            {units.map((u) => (
              <li key={u.id}>
                <b>{u.name}</b> — {u.location}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
