import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, TextField, Button, Box,
  Typography, IconButton, Rating, Alert, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FeedbackIcon from "@mui/icons-material/Feedback";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function FeedbackDialog({ open, onClose }) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setError("Please enter your feedback"); return; }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/feedback`,
        { message: message.trim(), rating, name: userData.name, email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setMessage(""); setRating(null); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) { onClose(); setTimeout(() => { setSuccess(false); setError(""); setMessage(""); setRating(null); }, 200); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FeedbackIcon sx={{ color: "#7c3aed" }} />
          <Typography variant="h6" fontWeight={700}>Send Feedback</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" color="#22c55e" fontWeight={700}>Thank You!</Typography>
            <Typography color="text.secondary" mt={1}>Your feedback helps us improve.</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" mb={1}>Rate your experience</Typography>
              <Rating
                value={rating}
                onChange={(e, v) => setRating(v)}
                size="large"
                sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" } }}
              />
            </Box>

            <TextField
              fullWidth multiline rows={4}
              label="Your feedback"
              placeholder="Tell us what you think..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(""); }}
              disabled={loading}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />

            <Button
              fullWidth variant="contained" type="submit"
              disabled={loading || !message.trim()}
              sx={{ mt: 2, py: 1.5, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 3 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Feedback"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackDialog;
