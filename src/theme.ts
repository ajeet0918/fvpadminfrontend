import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#166534"
    },
    success: {
      main: "#16A34A"
    },
    warning: {
      main: "#F59E0B"
    },
    error: {
      main: "#DC2626"
    },
    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Inter, Manrope, Segoe UI, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  }
});
