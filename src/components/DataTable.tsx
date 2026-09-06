import type { ReactNode } from "react";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

type DataTableProps = {
  children: ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
  className?: string;
  ariaLabel?: string;
  recordCount?: number;
};

export function DataTable({
  children,
  isEmpty = false,
  emptyText = "No records found.",
  className,
  ariaLabel = "Records",
  recordCount
}: DataTableProps) {
  return (
    <div className={`data-table-panel ${className ?? ""}`.trim()}>
      <div className="data-table-wrap" role="region" aria-label={ariaLabel} tabIndex={0}>
        {isEmpty ? (
          <div className="empty-state">
            <InboxOutlinedIcon />
            <strong>No records to display</strong>
            <span>{emptyText}</span>
          </div>
        ) : (
          <table className="data-table">{children}</table>
        )}
      </div>
      {recordCount !== undefined ? (
        <div className="data-table-footer" role="status">
          <strong>{recordCount.toLocaleString()}</strong> {recordCount === 1 ? "record" : "records"}
        </div>
      ) : null}
    </div>
  );
}
