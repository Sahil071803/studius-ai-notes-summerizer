const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    provider: { type: String, default: null },
  },
  { _id: false }
);

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
    usage: { type: usageSchema, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);