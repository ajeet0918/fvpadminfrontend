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
    <article className={`rounded-lg border p-4 shadow-card ${toneClassMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}
        </div>
        {icon ? <div className="mt-0.5 text-brand">{icon}</div> : null}
      </div>
    </article>
  );
}
