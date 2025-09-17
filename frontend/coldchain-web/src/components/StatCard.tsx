export default function StatCard({
  title,
  value,
  unit,
  tone = "info",
}: {
  title: string;
  value: string | number;
  unit?: string;
  tone?: "info" | "ok" | "warn" | "danger";
}) {
  return (
    <div className={`card stat border-${tone}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">
        {value}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
    </div>
  );
}
