import { useState } from "react";
import { summarizeText, generateQuiz } from "../services/api";
import Summary from "../components/Summary";
import Quiz from "../components/Quiz";
import Loader from "../components/Loader";
import FileUpload from "../components/FileUpload";

import {
  Container, TextField, Button, Stack, Typography, MenuItem, Tabs, Tab, Alert, Box, Chip, Switch, FormControlLabel,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import QuizIcon from "@mui/icons-material/Quiz";

function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [points, setPoints] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState(5);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");

  const maxWords = 300;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > maxWords;

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const trimmed = pasted.split(/\s+/).slice(0, maxWords).join(" ");
    setText(trimmed);
  };

  const handleAction = async (type) => {
    if (!text.trim()) { setError("Please enter or upload notes"); return; }
    if (isOverLimit) { setError(`Text exceeds ${maxWords} words`); return; }

    setLoading(true);
    setError("");
    setSummary("");
    setPoints([]);
    setQuiz([]);

    try {
      if (type === "summary") {
        const res = await summarizeText({ text });
        setSummary(res.data.summary);
      }
      if (type === "points") {
        const res = await summarizeText({ text, type: "points" });
        const raw = res.data.summary || "";
        const bullets = raw.split("\n").map((p) => p.replace(/^[-•*\d.]+ */, "").trim()).filter(Boolean);
        setPoints(bullets);
      }
      if (type === "quiz") {
        const res = await generateQuiz(text, difficulty, questionCount);
        setQuiz(res.data.quiz || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Transform Notes into Intelligence
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Paste your notes and let AI do the heavy lifting
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Start writing or paste your notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          sx={{
            "& textarea": { fontSize: "15px", lineHeight: "1.7" },
            "& fieldset": { border: "none" },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Chip
            label={`${wordCount} / ${maxWords} words`}
            size="small"
            color={isOverLimit ? "error" : wordCount > 200 ? "warning" : "default"}
            variant="outlined"
          />
          <FileUpload setText={setText} />
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mt: 4,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "15px" },
          "& .Mui-selected": { color: "#7c3aed !important" },
          "& .MuiTabs-indicator": { bgcolor: "#7c3aed" },
        }}
      >
        <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Summary" />
        <Tab icon={<FormatListBulletedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Key Points" />
        <Tab icon={<QuizIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Quiz" />
      </Tabs>

      {tab === 2 && (
        <Stack direction="row" spacing={2} mt={3} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            select
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {["easy", "medium", "hard"].map((d) => (
              <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Questions"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {[5, 10, 15, 20].map((n) => (
              <MenuItem key={n} value={n}>{n} questions</MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Switch checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />}
            label="Timer"
          />
        </Stack>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        {tab === 0 && (
          <Button
            variant="contained"
            onClick={() => handleAction("summary")}
            disabled={!text.trim() || loading}
            startIcon={<AutoAwesomeIcon />}
            sx={{ px: 4, py: 1.5, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </Button>
        )}
        {tab === 1 && (
          <Button
            variant="outlined"
            onClick={() => handleAction("points")}
            disabled={!text.trim() || loading}
            startIcon={<FormatListBulletedIcon />}
            sx={{ px: 4, py: 1.5, borderColor: "#7c3aed", color: "#7c3aed" }}
          >
            {loading ? "Extracting..." : "Extract Key Points"}
          </Button>
        )}
        {tab === 2 && (
          <Button
            variant="contained"
            onClick={() => handleAction("quiz")}
            disabled={!text.trim() || loading}
            startIcon={<QuizIcon />}
            sx={{ px: 4, py: 1.5, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>{error}</Alert>}

      {loading && <Loader message={tab === 2 ? "Generating quiz..." : "Analyzing text..."} />}

      {tab === 0 && summary && <Summary summary={summary} />}

      {tab === 1 && points.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" mb={2}>Key Points</Typography>
          <Stack spacing={1.5}>
            {points.map((p, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "#7c3aed",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography>{p}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {tab === 2 && quiz.length > 0 && <Quiz quiz={quiz} timerEnabled={timerEnabled} />}
    </Container>
  );
}

export default Home;
