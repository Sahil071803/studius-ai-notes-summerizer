const fs = require("fs/promises");
const path = require("path");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let content = "";

    if (ext === ".txt") {
      content = await fs.readFile(filePath, "utf-8");
    } else {
      content = `[${ext.toUpperCase()} file uploaded: ${req.file.originalname}]`;
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: filePath,
        size: req.file.size,
      },
      content,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadFile };