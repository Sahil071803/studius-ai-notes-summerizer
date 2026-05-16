const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { submitFeedback, getFeedback } = require("../controllers/feedbackController");

router.post("/", protect, submitFeedback);
router.get("/", protect, getFeedback);

module.exports = router;
