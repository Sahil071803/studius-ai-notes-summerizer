import { Box, CircularProgress, Typography } from "@mui/material";

function Loader({ message = "Processing..." }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, my: 6 }}>
      <CircularProgress size={48} sx={{ color: "#7c3aed" }} />
      <Typography sx={{ color: "#64748b", fontWeight: 500 }}>{message}</Typography>
    </Box>
  );
}

export default Loader;
