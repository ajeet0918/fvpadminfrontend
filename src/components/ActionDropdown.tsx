import { type ReactNode, useEffect, useRef, useState } from "react";

type ActionItem = {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  icon?: ReactNode;
};

type ActionDropdownProps = {
  items: ActionItem[];
  triggerLabel?: string;
  disabled?: boolean;
};

export function ActionDropdown({ items, triggerLabel, disabled = false }: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Open actions"
        className={
          triggerLabel
            ? "button-link button-small button-link-secondary px-3"
            : "button-link button-small button-link-secondary icon-button"
        }
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        {triggerLabel ? (
          <span className="inline-flex items-center gap-1.5">
            {triggerLabel}
            <span aria-hidden="true" className="text-xs text-text-secondary">&#9662;</span>
          </span>
        ) : (
          <span aria-hidden="true">&#8942;</span>
        )}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 min-w-36 rounded-lg border border-border bg-card p-1 shadow-card">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`w-full justify-start rounded-md px-3 py-2 text-left text-sm font-medium ${
                item.tone === "danger"
                  ? "text-danger hover:bg-red-50"
                  : "text-text-primary hover:bg-gray-50"
              }`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              <span className="inline-flex items-center gap-2">
                {item.icon ? <span aria-hidden="true" className="text-sm leading-none">{item.icon}</span> : null}
                <span>{item.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
