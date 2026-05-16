const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getScores,
  addScore,
} = require("../controllers/scoresController");

router.get("/", protect, getScores);
router.post("/", protect, addScore);

module.exports = router;