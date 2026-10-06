const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getScores,
  getMyScores,
  addScore,
} = require("../controllers/scoresController");

router.get("/mine", protect, getMyScores);
router.get("/", protect, getScores);
router.post("/", protect, addScore);

module.exports = router;