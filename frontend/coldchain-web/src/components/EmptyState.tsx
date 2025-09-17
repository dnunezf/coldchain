export default function EmptyState({
  title = "No data",
  desc,
}: {
  title?: string;
  desc?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">📉</div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc">{desc}</div>}
    </div>
  );
}
