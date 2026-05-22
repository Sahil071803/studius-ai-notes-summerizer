import { useEffect, useState } from "react";
import {
  Container, Typography, Card, CardContent, CircularProgress, Box, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
} from "@mui/material";
import { getScores } from "../services/api";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const rankBadges = { 1: "🥇", 2: "🥈", 3: "🥉" };

function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getScores();
        setScores(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Container>
    );
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score || a.totalQuestions - b.totalQuestions);

  return (
    <Container sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 5 } }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 48, color: "#f59e0b", mb: 1 }} />
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          Leaderboard
        </Typography>
        <Typography color="text.secondary" mt={1}>Top quiz scorers</Typography>
      </Box>

      {sorted.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography color="text.secondary">No scores yet. Take a quiz to get on the board!</Typography>
        </Card>
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((s, i) => {
                const rank = i + 1;
                const pct = s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0;
                return (
                  <TableRow key={s._id} hover
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                      bgcolor: rank === 1 ? "rgba(255,215,0,0.05)" : "transparent",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography fontWeight={700} sx={{ fontSize: "1.1rem", minWidth: 28 }}>
                          {rankBadges[rank] || rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: "#7c3aed", width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                          {s.name?.charAt(0)?.toUpperCase() || "?"}
                        </Avatar>
                        <Typography fontWeight={600}>{s.name || "Anonymous"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700} sx={{ color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444" }}>
                        {s.score}/{s.totalQuestions}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${pct}%`} size="small"
                        color={pct >= 80 ? "success" : pct >= 60 ? "warning" : "error"}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Leaderboard;
