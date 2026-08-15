import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
};

const toneClassMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "border-border bg-card",
  brand: "border-brand/20 bg-brand-light",
  success: "border-green-200 bg-green-50",
  warning: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50"
};

export function StatCard({ label, value, icon, hint, tone = "neutral" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone} ${toneClassMap[tone]}`}>
      <div className="stat-card-layout">
        <div className="stat-card-copy">
          <p className="stat-card-label"><span className="stat-card-indicator" aria-hidden="true" />{label}</p>
          <p className="stat-card-value">{value}</p>
          {hint ? <p className="stat-card-hint">{hint}</p> : null}
        </div>
        {icon ? <div className="stat-card-icon">{icon}</div> : null}
      </div>
    </article>
  );
}
