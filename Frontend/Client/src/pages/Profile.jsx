import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";
import {
  Container, Card, CardContent, Typography, TextField, Button, Avatar,
  Box, CircularProgress, Alert, Divider, Switch, FormControlLabel,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";

function Profile({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfile();
        setUser(res.data.user);
        setName(res.data.user.name);
      } catch {
        setMessage("Failed to load profile");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await updateProfile({ name });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Profile updated!");
    } catch {
      setMessage("Failed to update profile");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    if (!window.confirm("Logout?")) return;
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 5 } }}>
      <Typography variant="h4" fontWeight={800} mb={{ xs: 2, md: 4 }} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
        Profile & Settings
      </Typography>

      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#7c3aed", width: 64, height: 64, fontSize: 24, fontWeight: 700, mx: "auto", mb: 2 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
          <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ color: "#7c3aed" }} /> Edit Profile
          </Typography>
          <TextField fullWidth label="Name" value={name}
            onChange={(e) => setName(e.target.value)} size="small" sx={{ mb: 2 }}
          />
          <TextField fullWidth label="Email" value={user?.email || ""} size="small" disabled
            sx={{ mb: 2, "& .MuiInputBase-root": { opacity: 0.7 } }}
          />
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}
            disabled={!name.trim() || saving}
            sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {message && <Alert severity={message.includes("Failed") ? "error" : "success"} sx={{ mt: 2, borderRadius: 2 }}>{message}</Alert>}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DarkModeIcon sx={{ color: "#7c3aed" }} /> Appearance
          </Typography>
          <FormControlLabel control={
            <Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
          } label="Dark Mode" />
        </CardContent>
      </Card>

      <Button variant="outlined" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}
        sx={{ color: "#ef4444", borderColor: "#ef4444", "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(239,68,68,0.04)" } }}
      >
        Logout
      </Button>
    </Container>
  );
}

export default Profile;
