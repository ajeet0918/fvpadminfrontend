import { type ReactNode, useId, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerId = useId();
  const menuId = useId();
  const open = Boolean(anchorEl);

  return (
    <>
      <button
        id={triggerId}
        type="button"
        aria-label={triggerLabel ?? "Open actions"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`button-link button-small button-link-secondary ${triggerLabel ? "px-3" : "icon-button"}`}
        disabled={disabled}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {triggerLabel ? <>{triggerLabel}<KeyboardArrowDownRoundedIcon fontSize="small" /></> : <MoreHorizRoundedIcon fontSize="small" />}
      </button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: { "aria-labelledby": triggerId },
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 180,
              border: "1px solid #dfe6e2",
              boxShadow: "0 12px 32px -8px rgba(25,43,36,0.2)"
            }
          }
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              setAnchorEl(null);
              item.onClick();
            }}
            sx={{ minHeight: 40, gap: 1.5, fontSize: 14, color: item.tone === "danger" ? "error.main" : "text.primary" }}
          >
            {item.icon ? <span aria-hidden="true" className="inline-flex">{item.icon}</span> : null}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
