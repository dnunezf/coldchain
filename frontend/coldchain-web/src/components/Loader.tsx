export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
