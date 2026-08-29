import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#147A46",
      dark: "#0F6037",
      light: "#EAF7EF"
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
      default: "#F5F8F6",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#17261E",
      secondary: "#607269"
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "Inter, Manrope, Segoe UI, sans-serif",
    h1: {
      fontWeight: 750,
      letterSpacing: "-0.025em"
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.018em"
    },
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },
  components: {
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: "#147A46" }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.75rem"
        }
      }
    }
  }
});
