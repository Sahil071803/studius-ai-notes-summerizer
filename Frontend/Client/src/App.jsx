import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppHeader from "./components/AppHeader";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedbackDialog from "./components/FeedbackDialog";
import { Fab, Tooltip } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";

function AppContent() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindforge-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("mindforge-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#7c3aed",
            light: "#a78bfa",
            dark: "#5b21b6",
          },
          secondary: {
            main: "#06b6d4",
          },
          background: {
            default: darkMode ? "#0f0f1a" : "#f0f2f5",
            paper: darkMode ? "#1a1a2e" : "#ffffff",
          },
          text: {
            primary: darkMode ? "#e2e8f0" : "#1e293b",
            secondary: darkMode ? "#94a3b8" : "#64748b",
          },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 12,
                padding: "10px 24px",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: darkMode
                  ? "0 4px 20px rgba(0,0,0,0.3)"
                  : "0 4px 20px rgba(0,0,0,0.06)",
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!hideNavbar && <AppHeader darkMode={darkMode} setDarkMode={setDarkMode} />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {isLoggedIn && !hideNavbar && (
        <Tooltip title="Send Feedback" placement="left">
          <Fab
            onClick={() => setFeedbackOpen(true)}
            sx={{
              position: "fixed", bottom: 24, right: 24,
              bgcolor: "#7c3aed", color: "#fff",
              "&:hover": { bgcolor: "#6d28d9" },
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            <FeedbackIcon />
          </Fab>
        </Tooltip>
      )}

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
