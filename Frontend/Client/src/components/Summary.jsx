import { Box, Typography, Paper } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

function Summary({ summary }) {
  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AutoStoriesIcon sx={{ color: "#7c3aed" }} />
        <Typography variant="h6">Summary</Typography>
      </Box>
      <Typography
        sx={{
          color: "text.primary",
          lineHeight: 1.8,
          fontSize: "15px",
        }}
      >
        {summary}
      </Typography>
    </Paper>
  );
}

export default Summary;
