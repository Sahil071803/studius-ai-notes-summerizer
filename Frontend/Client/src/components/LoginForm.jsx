import { useState } from "react";
import { TextField, Button, Typography, Paper, Box, Alert, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { loginUser } from "../services/authService";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("All fields are required"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      const userData = res.data.user || { name: res.data.name, email: res.data.email };
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 4, maxWidth: 420, width: "100%", borderRadius: 4 }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 2,
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 28, color: "#fff" }} />
          </Box>
          <Typography variant="h5" fontWeight={800}>Welcome Back</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to MindForge
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="Email" name="email" type="email" margin="normal"
          value={form.email} onChange={handleChange} autoFocus
          disabled={loading}
        />
        <TextField
          fullWidth label="Password" name="password" type="password" margin="normal"
          value={form.password} onChange={handleChange}
          disabled={loading}
        />

        <Button
          fullWidth variant="contained" type="submit"
          disabled={loading}
          sx={{ mt: 3, py: 1.5, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign In"}
        </Button>

        <Button fullWidth variant="text" component={Link} to="/register" sx={{ mt: 1, color: "#7c3aed" }}>
          Create Account
        </Button>
      </Paper>
    </Box>
  );
}

export default LoginForm;
