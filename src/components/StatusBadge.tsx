type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`status-pill status-pill-${tone}`}>{label}</span>;
}
