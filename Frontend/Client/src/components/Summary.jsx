import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useState } from "react";

function Summary({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleExport = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <Typography variant="h6" sx={{ flex: 1 }}>Summary</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}
            sx={{ color: copied ? "#22c55e" : "#7c3aed", textTransform: "none", fontSize: "13px" }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="small" startIcon={<FileDownloadIcon />} onClick={handleExport}
            sx={{ color: "#7c3aed", textTransform: "none", fontSize: "13px" }}
          >
            Export
          </Button>
        </Stack>
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
