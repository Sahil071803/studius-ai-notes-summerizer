const axios = require("axios");
const History = require("../models/History");

const summarizeText = async (req, res, next) => {
  try {
    const { text, youtube, type } = req.body;

    // ✅ Safe input
    const inputText = typeof text === "string" ? text : "";

    // ❌ Validation
    if (!inputText.trim() && !youtube) {
      return res.status(400).json({
        success: false,
        error: "Text or YouTube URL required",
      });
    }

    // 🧠 Prompt logic
    let prompt = "";

    if (youtube) {
      prompt = `Summarize this YouTube video:\n${youtube}`;
    } else if (type === "points") {
      prompt = `Extract key points in bullet form:\n${inputText}`;
    } else {
      prompt = `Summarize this text clearly:\n${inputText}`;
    }

    // 🔥 API Call
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Notes",
        },
      }
    );

    // ✅ Extract summary
    const summary =
      response?.data?.choices?.[0]?.message?.content ||
      "No summary generated";

    await History.create({
      userId: req.user,
      text: inputText,
      summary,
      type: "summary",
    });

    // ✅ Response
    res.json({
      success: true,
      summary,
    });

  } catch (err) {
    console.error("🔥 Summarize Error:", err.message);
    next(err);
  }
};

module.exports = { summarizeText };