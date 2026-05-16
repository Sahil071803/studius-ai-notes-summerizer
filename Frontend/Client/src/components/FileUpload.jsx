import { Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function FileUpload({ setText }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    } else {
      alert("PDF and DOCX parsing coming soon. For now, please use .txt files.");
    }
  };

  return (
    <Button
      variant="outlined"
      component="label"
      startIcon={<CloudUploadIcon />}
      fullWidth
      sx={{
        mt: 2,
        py: 1.5,
        border: "2px dashed",
        borderColor: "divider",
        color: "text.secondary",
        "&:hover": { borderColor: "#7c3aed", color: "#7c3aed", bgcolor: "rgba(124,58,237,0.04)" },
      }}
    >
      <Typography sx={{ fontSize: "14px" }}>Upload .txt file</Typography>
      <input type="file" hidden onChange={handleFile} accept=".txt,.pdf,.docx" />
    </Button>
  );
}

export default FileUpload;
