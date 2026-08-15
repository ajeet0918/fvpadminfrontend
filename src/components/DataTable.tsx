import type { ReactNode } from "react";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

type DataTableProps = {
  children: ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
  className?: string;
};

export function DataTable({ children, isEmpty = false, emptyText = "No records found.", className }: DataTableProps) {
  return (
    <div className={`data-table-wrap ${className ?? ""}`.trim()}>
      {isEmpty ? (
        <div className="empty-state">
          <InboxOutlinedIcon />
          <strong>No records to display</strong>
          <span>{emptyText}</span>
        </div>
      ) : (
        <div className="data-table-scroll" tabIndex={0} aria-label="Scrollable records table">
          <table className="data-table">{children}</table>
        </div>
      )}
    </div>
  );
}
