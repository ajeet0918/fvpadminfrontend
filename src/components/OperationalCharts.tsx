import type { CSSProperties } from "react";

export type ChartDataPoint = {
  label: string;
  value: number;
  detail?: string;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
};

type ChartProps = {
  data: ChartDataPoint[];
  emptyText: string;
  ariaLabel: string;
};

const chartColorMap: Record<NonNullable<ChartDataPoint["tone"]>, string> = {
  brand: "#166534",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
  neutral: "#9ca3af"
};

export function ColumnChart({ data, emptyText, ariaLabel }: ChartProps) {
  const maximumValue = Math.max(...data.map((item) => item.value), 0);
  const accessibleLabel = getAccessibleLabel(ariaLabel, data);

  if (maximumValue === 0) {
    return <ChartEmptyState message={emptyText} />;
  }

  return (
    <div className="column-chart" role="img" aria-label={accessibleLabel}>
      {data.map((item) => {
        const height = Math.max((item.value / maximumValue) * 100, item.value > 0 ? 8 : 0);
        return (
          <div className="column-chart-item" key={item.label}>
            <div className="column-chart-value">{item.value}</div>
            <div className="column-chart-track">
              <div className="column-chart-bar" style={{ height: `${height}%` }} />
            </div>
            <div className="column-chart-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBarChart({ data, emptyText, ariaLabel }: ChartProps) {
  const maximumValue = Math.max(...data.map((item) => item.value), 0);
  const accessibleLabel = getAccessibleLabel(ariaLabel, data);

  if (maximumValue === 0) {
    return <ChartEmptyState message={emptyText} />;
  }

  return (
    <div className="horizontal-chart" role="img" aria-label={accessibleLabel}>
      {data.map((item) => {
        const width = Math.max((item.value / maximumValue) * 100, item.value > 0 ? 3 : 0);
        return (
          <div className="horizontal-chart-row" key={item.label}>
            <div className="horizontal-chart-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="horizontal-chart-track">
              <div
                className="horizontal-chart-bar"
                style={{
                  "--chart-width": `${width}%`,
                  "--chart-color": chartColorMap[item.tone ?? "brand"]
                } as CSSProperties}
              />
            </div>
            {item.detail ? <div className="horizontal-chart-detail">{item.detail}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="chart-empty-state">
      <strong>No activity to chart</strong>
      <span>{message}</span>
    </div>
  );
}

function getAccessibleLabel(title: string, data: ChartDataPoint[]) {
  const values = data.map((item) => `${item.label}: ${item.value}`).join(", ");
  return `${title}. ${values}`;
}
