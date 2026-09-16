export function Loader({ label, variant = "inline" }) {
  return (
    <span className={`loader loader-${variant}`} role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
