import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#176348"
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
      default: "#F4F6F5",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#192B24",
      secondary: "#62746B"
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "Inter, Manrope, Segoe UI, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  }
});
