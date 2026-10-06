import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { summarizeText, generateQuiz } from "../services/api";
import Summary from "../components/Summary";
import Quiz from "../components/Quiz";
import Loader from "../components/Loader";
import FileUpload from "../components/FileUpload";
import UsageChip from "../components/UsageChip";

import {
  Container, TextField, Button, Stack, Typography, MenuItem, Tabs, Tab, Alert, Box, Chip, Switch, FormControlLabel,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import QuizIcon from "@mui/icons-material/Quiz";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";

function Home() {
  const location = useLocation();
  const [navState] = useState(() => location.state);

  const initialTab = Number(localStorage.getItem("studius-default-tab")) || 0;
  const tabFromNav =
    navState?.type === "quiz" ? 2 : navState?.type === "points" ? 1 : null;

  const [text, setText] = useState(() => navState?.text || "");
  const [summary, setSummary] = useState(() =>
    navState?.summary && navState.type !== "quiz" ? navState.summary : ""
  );
  const [points, setPoints] = useState(() => navState?.points || []);
  const [quiz, setQuiz] = useState(() => navState?.quiz || []);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem("studius-default-difficulty") || "easy");
  const [questionCount, setQuestionCount] = useState(() => Number(localStorage.getItem("studius-default-count")) || 5);
  const [timerEnabled, setTimerEnabled] = useState(() => localStorage.getItem("studius-default-timer") !== "off");
  const [tab, setTab] = useState(() => tabFromNav ?? initialTab);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [customQuiz, setCustomQuiz] = useState([]);

  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const maxWords = 15000;
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
    setUsage(null);

    try {
      const body = { text: text.trim() };

      if (type === "summary") {
        const res = await summarizeText(body);
        setSummary(res.data.summary);
        setUsage(res.data.usage || null);
      }
      if (type === "points") {
        const res = await summarizeText({ ...body, type: "points" });
        const raw = res.data.summary || "";
        const bullets = raw.split("\n").map((p) => p.replace(/^[-•*\d.]+ */, "").trim()).filter(Boolean);
        setPoints(bullets);
        setUsage(res.data.usage || null);
      }
      if (type === "quiz") {
        const res = await generateQuiz(text.trim(), difficulty, questionCount);
        setQuiz(res.data.quiz || []);
        setUsage(res.data.usage || null);
        if (res.data.partial) {
          setError(`AI returned only ${res.data.quiz.length} of ${res.data.requested} valid questions.`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      setError("Please paste a prompt first");
      return;
    }

    setLoading(true);
    setError("");
    setCustomQuiz([]);
    setUsage(null);
    setNotice("");

    try {
      const res = await generateQuiz(
        customPrompt.trim(),
        difficulty,
        questionCount,
        true
      );
      setCustomQuiz(res.data.quiz || []);
      setUsage(res.data.usage || null);

      if (res.data.partial) {
        setError(`AI returned only ${res.data.quiz.length} of ${res.data.requested} valid questions.`);
      } else if (res.data.countSource === "prompt") {
        setNotice(`Count taken from your prompt: ${res.data.requested} questions.`);
      } else {
        setNotice(`Your prompt had no number, so the fallback count was used: ${res.data.requested} questions.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleCopyPoints = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(true);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      setCopiedIdx(null);
    }
  };

  const handleExportPoints = () => {
    const content = points.map((p, i) => `${i + 1}. ${p}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "key-points.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 4, md: 5 } }}>
      <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}>
          Transform Notes into Intelligence
        </Typography>
        <Typography color="text.secondary" mt={1} sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
          Paste your notes and let AI do the heavy lifting
        </Typography>
      </Box>

      <Box sx={{
        p: { xs: 1.5, sm: 3 }, borderRadius: 4, bgcolor: "background.paper",
        border: "1px solid", borderColor: "divider",
      }}>
        <TextField
          fullWidth multiline
          rows={5}
          placeholder="Start writing or paste your notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          sx={{
            "& textarea": { fontSize: "15px", lineHeight: "1.7" },
            "& fieldset": { border: "none" },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, flexWrap: "wrap", gap: 1 }}>
          <Chip label={`${wordCount} / ${maxWords} words`} size="small"
            color={isOverLimit ? "error" : wordCount > 200 ? "warning" : "default"} variant="outlined"
          />
          <FileUpload setText={setText} />
        </Box>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}
        variant="scrollable" scrollButtons="auto"
        sx={{
          mt: { xs: 2, sm: 4 },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: { xs: "13px", sm: "15px" }, minHeight: 48 },
          "& .Mui-selected": { color: "#7c3aed !important" },
          "& .MuiTabs-indicator": { bgcolor: "#7c3aed" },
        }}
      >
        <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Summary" />
        <Tab icon={<FormatListBulletedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Key Points" />
        <Tab icon={<QuizIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Quiz" />
        <Tab icon={<EditNoteIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Custom Prompt" />
      </Tabs>

      {(tab === 2 || tab === 3) && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3} sx={{ alignItems: { sm: "center" } }}>
          <TextField select label="Difficulty" value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)} size="small" sx={{ minWidth: 140 }}
          >
            {["easy", "medium", "hard"].map((d) => (
              <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={tab === 3 ? "Fallback count" : "Questions"}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            size="small"
            helperText={tab === 3 ? "used only if your prompt has no number" : ""}
            sx={{ minWidth: 140 }}
          >
            {[5, 10, 15, 20].map((n) => (<MenuItem key={n} value={n}>{n} questions</MenuItem>))}
          </TextField>
          <FormControlLabel control={<Switch checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />} label="Timer" />
        </Stack>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        {tab === 0 && (
          <Button variant="contained" onClick={() => handleAction("summary")}
            disabled={!text.trim() || loading} startIcon={summary ? <RefreshIcon /> : <AutoAwesomeIcon />}
            sx={{ px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, width: { xs: "100%", sm: "auto" }, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
          >
            {loading ? "Generating..." : summary ? "Regenerate Summary" : "Generate Summary"}
          </Button>
        )}
        {tab === 1 && (
          <Button variant="outlined" onClick={() => handleAction("points")}
            disabled={!text.trim() || loading} startIcon={points.length ? <RefreshIcon /> : <FormatListBulletedIcon />}
            sx={{ px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, width: { xs: "100%", sm: "auto" }, borderColor: "#7c3aed", color: "#7c3aed" }}
          >
            {loading ? "Extracting..." : points.length ? "Regenerate Points" : "Extract Key Points"}
          </Button>
        )}
        {tab === 2 && (
          <Button variant="contained" onClick={() => handleAction("quiz")}
            disabled={!text.trim() || loading} startIcon={quiz.length ? <RefreshIcon /> : <QuizIcon />}
            sx={{ px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, width: { xs: "100%", sm: "auto" }, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
          >
            {loading ? "Generating..." : quiz.length ? "Regenerate Quiz" : "Generate Quiz"}
          </Button>
        )}
        {tab === 3 && (
          <Button variant="contained" onClick={handleCustomPrompt}
            disabled={!customPrompt.trim() || loading} startIcon={customQuiz.length ? <RefreshIcon /> : <EditNoteIcon />}
            sx={{ px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, width: { xs: "100%", sm: "auto" }, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
          >
            {loading ? "Generating..." : customQuiz.length ? "Regenerate Quiz" : "Generate Quiz from Prompt"}
          </Button>
        )}
      </Box>

      {tab === 3 && (
        <Box sx={{ mt: 3, p: { xs: 1.5, sm: 3 }, borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" mb={0.5}>Paste your prompt</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Grab a prompt from ChatGPT, Claude or anywhere else — e.g. &ldquo;generate 10 MCQs on photosynthesis&rdquo; — and paste it below.
          </Typography>
          <TextField
            fullWidth multiline rows={5}
            placeholder="e.g. Create 10 medium-difficulty MCQs about the Krebs cycle with 4 options each"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            sx={{
              "& textarea": { fontSize: "15px", lineHeight: "1.7" },
              "& fieldset": { border: "none" },
            }}
          />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>{error}</Alert>}
      {!error && notice && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>{notice}</Alert>
      )}
      {loading && (
        <Loader message={tab === 2 || tab === 3 ? "Generating quiz..." : "Analyzing text..."} />
      )}
      {tab === 0 && summary && <Summary summary={summary} usage={usage} />}

      {tab === 1 && points.length > 0 && (
        <Box sx={{ mt: 2, p: { xs: 1.5, sm: 3 }, borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FormatListBulletedIcon sx={{ color: "#7c3aed" }} />
            <Typography variant="h6" sx={{ flex: 1 }}>Key Points</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyPoints}
                sx={{ color: copiedIdx ? "#22c55e" : "#7c3aed", textTransform: "none", fontSize: "13px" }}
              >
                {copiedIdx ? "Copied!" : "Copy"}
              </Button>
              <Button size="small" startIcon={<FileDownloadIcon />} onClick={handleExportPoints}
                sx={{ color: "#7c3aed", textTransform: "none", fontSize: "13px" }}
              >
                Export
              </Button>
            </Stack>
          </Box>
          {usage && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <UsageChip usage={usage} />
            </Box>
          )}
          <Stack spacing={1.5}>
            {points.map((p, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: "50%", bgcolor: "#7c3aed", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, flexShrink: 0, mt: "2px",
                }}>
                  {i + 1}
                </Box>
                <Typography sx={{ fontSize: { xs: "14px", sm: "16px" } }}>{p}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {tab === 2 && quiz.length > 0 && <Quiz quiz={quiz} timerEnabled={timerEnabled} usage={usage} />}
      {tab === 3 && customQuiz.length > 0 && <Quiz quiz={customQuiz} timerEnabled={timerEnabled} usage={usage} />}
    </Container>
  );
}

export default Home;
