import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err?.message || "Network error";
    window.dispatchEvent(new CustomEvent("api-error", { detail: msg }));
    return Promise.reject(err);
  }
);

export type Unit = { id: number; name: string; location: string };
export type Threshold = {
  id: number;
  refrigerationUnitId: number;
  metric: 1 | 2;
  min: number;
  max: number;
};
export type Reading = {
  sensorType: 1 | 2;
  value: number;
  recordedAtUtc: string;
};
export type Alert = {
  id: number;
  metric: 1 | 2;
  openedAtUtc: string;
  closedAtUtc?: string | null;
  status: 1 | 2;
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString([], { hour12: false });

// simple localStorage helpers
export const savePref = (k: string, v: string) => localStorage.setItem(k, v);
export const loadPref = (k: string, d = "") => localStorage.getItem(k) ?? d;
