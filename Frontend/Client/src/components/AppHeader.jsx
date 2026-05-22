import { useState } from "react";
import {
  AppBar, Toolbar, Button, Box, Avatar, Typography, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MenuIcon from "@mui/icons-material/Menu";

function AppHeader({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userData = localStorage.getItem("user");
  let user = null;
  try { user = userData ? JSON.parse(userData) : null; } catch { user = null; }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const handleLogout = () => {
    if (!window.confirm("Logout?")) return;
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "History", path: "/history" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: darkMode ? "rgba(26, 26, 46, 0.8)" : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 1, md: 4 } }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <AutoStoriesIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{
              fontWeight: 800, fontSize: { xs: "16px", sm: "20px" },
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}>
              Studius
            </Typography>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.label} component={Link} to={item.path}
                sx={{
                  textTransform: "none",
                  fontWeight: isActive(item.path) ? 700 : 500,
                  color: isActive(item.path) ? "#7c3aed" : darkMode ? "#cbd5e1" : "#475569",
                  background: isActive(item.path)
                    ? darkMode ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)"
                    : "transparent",
                  borderRadius: "10px", px: 2,
                  "&:hover": { background: darkMode ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)" },
                }}
              >
                {item.label}
              </Button>
            ))}

            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ ml: 1, color: darkMode ? "#fbbf24" : "#64748b" }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {user && (
              <>
                <Avatar sx={{ bgcolor: "#7c3aed", width: 32, height: 32, fontSize: 13, fontWeight: 700, ml: 1 }}>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: "14px", fontWeight: 500, color: darkMode ? "#e2e8f0" : "#1e293b", display: { xs: "none", sm: "block" } }}>
                  {displayName}
                </Typography>
                <Button onClick={handleLogout} sx={{ textTransform: "none", color: "#ef4444", fontWeight: 500, minWidth: "auto", "&:hover": { background: darkMode ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)" } }}>
                  Logout
                </Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1, alignItems: "center" }}>
            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: darkMode ? "#fbbf24" : "#64748b" }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: darkMode ? "#e2e8f0" : "#1e293b" }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 260, bgcolor: darkMode ? "#1a1a2e" : "#fff" } } }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 2,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <AutoStoriesIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography fontWeight={800}>Studius</Typography>
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link} to={item.path}
                selected={isActive(item.path)}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2, mx: 1, my: 0.5,
                  "&.Mui-selected": { bgcolor: "rgba(124,58,237,0.12)" },
                }}
              >
                <ListItemText primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 700 : 500,
                    color: isActive(item.path) ? "#7c3aed" : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {user && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "#7c3aed", width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography sx={{ flex: 1, fontWeight: 500 }}>{displayName}</Typography>
              <Button onClick={handleLogout} sx={{ color: "#ef4444", fontWeight: 600, minWidth: "auto" }}>Logout</Button>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
}

export default AppHeader;
