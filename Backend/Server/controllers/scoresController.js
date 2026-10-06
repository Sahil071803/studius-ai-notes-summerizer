const Score = require("../models/Score");

// 🔥 GET ALL SCORES (Leaderboard) - intentionally global
const getScores = async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: scores,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scores",
      error: err.message,
    });
  }
};

// GET ONLY THE AUTHENTICATED USER'S SCORES (Dashboard)
const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: scores,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scores",
      error: err.message,
    });
  }
};

const addScore = async (req, res) => {
  try {
    const { name, score, totalQuestions } = req.body;
    const userId = req.user;

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const newScore = await Score.create({
      userId,
      name: name || "Anonymous",
      score,
      totalQuestions,
    });

    res.status(201).json({
      success: true,
      message: "Score saved",
      data: newScore,
    });
  } catch (err) {
    console.error("Score save full error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save score",
      error: err.message,
    });
  }
};

module.exports = { getScores, getMyScores, addScore };