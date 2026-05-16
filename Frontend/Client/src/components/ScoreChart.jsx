import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Card, CardContent, Typography, useTheme } from "@mui/material";

function ScoreChart({ scores }) {
  const theme = useTheme();
  const data = scores.map((item, index) => ({
    name: `#${index + 1}`,
    score: item.score,
    total: item.totalQuestions || 10,
    pct: item.percentage || Math.round((item.score / (item.totalQuestions || 10)) * 100),
  }));

  if (!scores.length) return null;

  return (
    <Card sx={{ mt: 4, borderRadius: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Score Analytics
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="score"
              radius={[8, 8, 0, 0]}
              fill="#7c3aed"
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default ScoreChart;
