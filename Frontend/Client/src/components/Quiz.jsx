import { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, Button, Box, LinearProgress, Chip, Alert,
} from "@mui/material";
import { saveScore } from "../services/api";

export default function Quiz({ quiz = [], timerEnabled = true }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [time, setTime] = useState(15);

  const currentQ = quiz[current];

  useEffect(() => {
    if (!timerEnabled || submitted) return;
    if (time === 0) { handleNext(); return; }
    const timer = setTimeout(() => setTime((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [time, submitted, timerEnabled]);

  useEffect(() => { if (timerEnabled) setTime(15); }, [current, timerEnabled]);

  const select = (idx) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [current]: idx }));
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    let s = 0;
    quiz.forEach((q, i) => {
      const correctIdx = q.options.indexOf(q.answer);
      if (selected[i] === correctIdx) s++;
    });
    setScore(s);
    setSubmitted(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      await saveScore({
        score: s,
        totalQuestions: quiz.length,
        name: userData.name || "Anonymous",
      });
    } catch (err) {
      const detail = err.response?.data?.error || "";
      const msg = err.response?.data?.message || err.message || "Score save failed";
      setSaveError(detail ? `${msg}: ${detail}` : msg);
      console.error("Score save error detail:", err.response?.data);
    }
  };

  if (!quiz.length) return null;

  if (submitted) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <Box sx={{ mt: 3, textAlign: "center" }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{saveError}</Alert>
        )}
        <Card sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: pct >= 60 ? "#22c55e" : "#ef4444" }}>
            {score}/{quiz.length}
          </Typography>
          <Typography variant="h5" mt={1}>{pct}%</Typography>
          <Chip
            label={pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Practicing!"}
            color={pct >= 60 ? "success" : "error"}
            sx={{ mt: 2, fontWeight: 600 }}
          />
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Question {current + 1} of {quiz.length}
        </Typography>
        {timerEnabled ? (
          <Chip label={`${time}s`} size="small" color={time <= 5 ? "error" : "default"} sx={{ fontWeight: 600 }} />
        ) : (
          <Chip label="No timer" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        )}
      </Box>

      <LinearProgress
        variant="determinate"
        value={((current + 1) / quiz.length) * 100}
        sx={{ height: 6, borderRadius: 3, mb: 3, bgcolor: "divider" }}
      />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>{currentQ.question}</Typography>

          {currentQ.options.map((opt, i) => {
            const isSelected = selected[current] === i;
            return (
              <Button
                key={i}
                fullWidth
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => select(i)}
                sx={{
                  mb: 1,
                  justifyContent: "flex-start",
                  py: 1.5,
                  px: 2,
                  bgcolor: isSelected ? "#7c3aed" : "transparent",
                  color: isSelected ? "#fff" : "text.primary",
                  borderColor: isSelected ? "#7c3aed" : "divider",
                  "&:hover": {
                    bgcolor: isSelected ? "#6d28d9" : "action.hover",
                  },
                }}
              >
                <Box component="span" sx={{ mr: 1, fontWeight: 700, opacity: 0.5 }}>
                  {String.fromCharCode(65 + i)}.
                </Box>
                {opt}
              </Button>
            );
          })}

          <Button
            variant="contained"
            onClick={handleNext}
            fullWidth
            disabled={selected[current] === undefined || selected[current] === null}
            sx={{ mt: 2, py: 1.5, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {current === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
