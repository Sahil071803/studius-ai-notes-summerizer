const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { generateQuiz } = require("../controllers/quizController");
const validateRequest = require("../middleware/validateRequest");

router.post("/", protect, validateRequest(["text"]), generateQuiz);

module.exports = router;