const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      default: 10,
    },

    percentage: {
      type: Number,
    },
  },
  { timestamps: true }
);

scoreSchema.pre("save", function () {
  if (this.totalQuestions > 0) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  }
});

module.exports = mongoose.model("Score", scoreSchema);