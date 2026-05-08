type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const className = tone === "success"
    ? "status-pill status-pill-success"
    : tone === "warning"
      ? "status-pill status-pill-warning"
      : tone === "danger"
        ? "status-pill status-pill-danger"
        : "status-pill status-pill-neutral";

  return <span className={className}>{label}</span>;
}
