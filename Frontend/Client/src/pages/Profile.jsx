import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../services/api";
import {
  Container, Card, CardContent, Typography, TextField, Button, Avatar,
  Box, CircularProgress, Alert, Switch, FormControlLabel, MenuItem, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";
import LockIcon from "@mui/icons-material/Lock";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TabIcon from "@mui/icons-material/Tab";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Profile({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [quizDifficulty, setQuizDifficulty] = useState(() => localStorage.getItem("studius-default-difficulty") || "easy");
  const [quizCount, setQuizCount] = useState(() => Number(localStorage.getItem("studius-default-count")) || 5);
  const [quizTimer, setQuizTimer] = useState(() => localStorage.getItem("studius-default-timer") !== "off");
  const [defaultTab, setDefaultTab] = useState(() => Number(localStorage.getItem("studius-default-tab")) || 0);
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("studius-autosave") !== "off");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("studius-fontsize") || "medium");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setPwMessage("Fill both fields"); return; }
    if (newPassword.length < 6) { setPwMessage("Min 6 characters"); return; }
    setPwSaving(true);
    setPwMessage("");
    try {
      await changePassword({ currentPassword, newPassword });
      setPwMessage("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwMessage(err.response?.data?.message || "Failed");
    }
    setPwSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount();
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Logout?")) return;
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const updateLS = (key, value) => localStorage.setItem(key, value);

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
        Settings
      </Typography>

      {/* Profile Card */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#7c3aed", width: 64, height: 64, fontSize: 24, fontWeight: 700, mx: "auto", mb: 2 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
          <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
        </CardContent>
      </Card>

      {/* Edit Profile */}
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

      {/* Change Password */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon sx={{ color: "#7c3aed" }} /> Change Password
          </Typography>
          <TextField fullWidth label="Current Password"
            type={showCurrent ? "text" : "password"} value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} size="small" sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" tabIndex={-1}>
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField fullWidth label="New Password"
            type={showNew ? "text" : "password"} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} size="small" sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end" tabIndex={-1}>
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" startIcon={<LockIcon />} onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || pwSaving}
            sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </Button>
          {pwMessage && <Alert severity={pwMessage.includes("Failed") || pwMessage.includes("incorrect") || pwMessage.includes("Fill") || pwMessage.includes("Min") ? "error" : "success"} sx={{ mt: 2, borderRadius: 2 }}>{pwMessage}</Alert>}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DarkModeIcon sx={{ color: "#7c3aed" }} /> Appearance
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel control={
              <Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
            } label="Dark Mode" />
            <TextField select label="Font Size" value={fontSize}
              onChange={(e) => { setFontSize(e.target.value); updateLS("studius-fontsize", e.target.value); }}
              size="small"
            >
              {[{ v: "small", l: "Small" }, { v: "medium", l: "Medium" }, { v: "large", l: "Large" }].map((o) => (
                <MenuItem key={o.v} value={o.v}>{o.l}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Quiz Defaults */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QuizIcon sx={{ color: "#7c3aed" }} /> Quiz Defaults
          </Typography>
          <Stack spacing={2}>
            <TextField select label="Difficulty" value={quizDifficulty}
              onChange={(e) => { setQuizDifficulty(e.target.value); updateLS("studius-default-difficulty", e.target.value); }}
              size="small"
            >
              {["easy", "medium", "hard"].map((d) => (
                <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Questions" value={quizCount}
              onChange={(e) => { setQuizCount(Number(e.target.value)); updateLS("studius-default-count", e.target.value); }}
              size="small"
            >
              {[5, 10, 15, 20].map((n) => (<MenuItem key={n} value={n}>{n} questions</MenuItem>))}
            </TextField>
            <FormControlLabel control={
              <Switch checked={quizTimer} onChange={(e) => { setQuizTimer(e.target.checked); updateLS("studius-default-timer", e.target.checked ? "on" : "off"); }} />
            } label="Timer On By Default" />
          </Stack>
        </CardContent>
      </Card>

      {/* Home Defaults */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TabIcon sx={{ color: "#7c3aed" }} /> Home Defaults
          </Typography>
          <Stack spacing={2}>
            <TextField select label="Default Tab" value={defaultTab}
              onChange={(e) => { setDefaultTab(Number(e.target.value)); updateLS("studius-default-tab", e.target.value); }}
              size="small"
            >
              <MenuItem value={0}>Summary</MenuItem>
              <MenuItem value={1}>Key Points</MenuItem>
              <MenuItem value={2}>Quiz</MenuItem>
            </TextField>
            <FormControlLabel control={
              <Switch checked={autoSave} onChange={(e) => { setAutoSave(e.target.checked); updateLS("studius-autosave", e.target.checked ? "on" : "off"); }} />
            } label="Auto-save History" />
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card sx={{ borderRadius: 4, mb: 3, borderColor: "#ef4444" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1, color: "#ef4444" }}>
            <DeleteForeverIcon /> Danger Zone
          </Typography>
          <Button variant="outlined" fullWidth startIcon={<DeleteForeverIcon />} onClick={() => setDeleteOpen(true)}
            sx={{ color: "#ef4444", borderColor: "#ef4444", "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(239,68,68,0.04)" } }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Button variant="outlined" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}
        sx={{ color: "#ef4444", borderColor: "#ef4444", "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(239,68,68,0.04)" } }}
      >
        Logout
      </Button>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography mb={2}>This cannot be undone. Type <b>DELETE</b> to confirm.</Typography>
          <TextField fullWidth value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE" size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETE" || deleting}
            color="error" variant="contained"
          >
            {deleting ? "Deleting..." : "Delete Forever"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;
