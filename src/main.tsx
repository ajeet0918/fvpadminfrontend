import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthSessionProvider } from "./components/AuthSessionProvider";
import { adminTheme } from "./theme";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthSessionProvider>
          <App />
        </AuthSessionProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
