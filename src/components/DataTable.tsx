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
      <table className="data-table">{children}</table>
      {isEmpty ? <p className="empty-state">{emptyText}</p> : null}
    </div>
  );
}
