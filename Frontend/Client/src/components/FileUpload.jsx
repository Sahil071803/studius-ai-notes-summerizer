import { Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function FileUpload({ setText }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      if (ext === "txt") {
        const reader = new FileReader();
        reader.onload = (e) => setText(e.target.result);
        reader.readAsText(file);
      } else if (ext === "pdf") {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).href;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ") + "\n";
        }
        setText(fullText.trim());
      } else if (ext === "docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value.trim());
      } else {
        alert("Unsupported format. Please use .txt, .pdf, or .docx files.");
      }
    } catch (err) {
      alert("Failed to read file: " + err.message);
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
      <Typography sx={{ fontSize: "14px" }}>Upload .txt / .pdf / .docx</Typography>
      <input type="file" hidden onChange={handleFile} accept=".txt,.pdf,.docx" />
    </Button>
  );
}

export default FileUpload;
