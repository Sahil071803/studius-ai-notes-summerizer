const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getHistory,
  deleteHistory,
  updateHistory,
} = require("../controllers/historyController");

router.get("/", protect, getHistory);
router.delete("/:id", protect, deleteHistory);
router.put("/:id", protect, updateHistory);

module.exports = router;