import { useState } from "react";
import { TextField, Button, Typography, Paper, Box, Alert, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { registerUser } from "../services/authService";

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("All fields are required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
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
          <Typography variant="h5" fontWeight={800}>Get Started</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create your Studius account
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="Name" name="name" margin="normal"
          value={form.name} onChange={handleChange} autoFocus
          disabled={loading} autoComplete="name"
        />
        <TextField
          fullWidth label="Email" name="email" type="email" margin="normal"
          value={form.email} onChange={handleChange}
          disabled={loading} autoComplete="email"
        />
        <TextField
          fullWidth label="Password" name="password"
          type={showPassword ? "text" : "password"} margin="normal"
          value={form.password} onChange={handleChange}
          disabled={loading} autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          fullWidth variant="contained" type="submit"
          disabled={loading}
          sx={{ mt: 3, py: 1.5, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Create Account"}
        </Button>

        <Button fullWidth variant="text" component={Link} to="/login" sx={{ mt: 1, color: "#7c3aed" }}>
          Already have an account? Sign In
        </Button>
      </Paper>
    </Box>
  );
}

export default RegisterForm;
