const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const feedback = await Feedback.create({
      userId: req.user,
      name: req.body.name || "Anonymous",
      email: req.body.email || "",
      message: message.trim(),
      rating: rating || null,
    });

    res.status(201).json({ success: true, message: "Feedback submitted", data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { submitFeedback, getFeedback };
