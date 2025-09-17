import { useEffect, useState } from "react";
export default function ErrorBar() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setMsg(ce.detail);
      const t = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(t);
    };
    window.addEventListener("api-error", h as EventListener);
    return () => window.removeEventListener("api-error", h as EventListener);
  }, []);
  if (!msg) return null;
  return (
    <div className="errorbar">
      <span>{msg}</span>
      <button onClick={() => setMsg(null)}>Dismiss</button>
    </div>
  );
}
