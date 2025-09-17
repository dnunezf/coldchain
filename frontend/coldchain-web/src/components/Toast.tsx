import { useEffect, useState } from "react";
export default function Toast({
  text,
  onClose,
  tone = "ok",
}: {
  text: string;
  onClose: () => void;
  tone?: "ok" | "warn" | "danger" | "info";
}) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!show) onClose();
  }, [show, onClose]);
  return show ? <div className={`toast toast-${tone}`}>{text}</div> : null;
}
