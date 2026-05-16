const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    text: String,
    summary: String,
    quiz: {
      type: Array,
      default: [],
    },
    type: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);