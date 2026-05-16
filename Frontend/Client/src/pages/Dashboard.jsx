import { useEffect, useState } from "react";
import {
  Container, Card, CardContent, Typography, CircularProgress, Box,
} from "@mui/material";
import { getScores } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimelineIcon from "@mui/icons-material/Timeline";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

function Dashboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await getScores();
        setScores(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const total = scores.length;
  const avg = total > 0 ? (scores.reduce((a, b) => a + (b.score || 0), 0) / total).toFixed(1) : 0;
  const lastScore = total > 0 ? scores[scores.length - 1]?.score || 0 : 0;
  const bestScore = total > 0 ? Math.max(...scores.map((s) => s.score)) : 0;

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Container>
    );
  }

  const stats = [
    { title: "Total Attempts", value: total, icon: <TimelineIcon />, color: "#7c3aed" },
    { title: "Average Score", value: avg, icon: <TrendingUpIcon />, color: "#06b6d4" },
    { title: "Last Score", value: lastScore, icon: <StarIcon />, color: "#f59e0b" },
    { title: "Best Score", value: bestScore, icon: <EmojiEventsIcon />, color: "#22c55e" },
  ];

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Dashboard
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3 }}>
        {stats.map((stat) => (
          <Card key={stat.title} sx={{ borderRadius: 4, transition: "0.3s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                <Typography color="text.secondary" variant="body2">{stat.title}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: stat.color }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {scores.length > 0 && <ScoreChart scores={scores} />}

      {scores.length === 0 && (
        <Card sx={{ mt: 4, p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography color="text.secondary">
            No quiz attempts yet. Head to the Home page to take a quiz!
          </Typography>
        </Card>
      )}
    </Container>
  );
}

export default Dashboard;
