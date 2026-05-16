const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { summarizeText } = require("../controllers/summarizeController");

router.post("/", protect, summarizeText);

module.exports = router;