import type { ReactNode } from "react";

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
          <strong>No records to display</strong>
          <span>{emptyText}</span>
        </div>
      ) : (
        <table className="data-table">{children}</table>
      )}
    </div>
  );
}
