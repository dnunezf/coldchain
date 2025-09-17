import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

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
