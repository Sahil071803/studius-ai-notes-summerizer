const axios = require("axios");
const History = require("../models/History");

// extract only valid JSON array safely
const extractJSON = (text) => {
  const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
  return match ? match[0] : null;
};

const generateQuiz = async (req, res, next) => {
  try {
    const {
      text,
      difficulty = "easy",
      questionCount = 5, // 🔥 NEW
    } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text required",
      });
    }

    const count = Math.min(Math.max(questionCount, 5), 20); // 🔒 limit 5–20

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `
Return ONLY valid JSON array.

Generate EXACTLY ${count} ${difficulty} MCQs.

Format:
[
  {
    "question": "string",
    "options": ["A","B","C","D"],
    "answer": "A"
  }
]

Text:
${text}
`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = response.data.choices[0].message.content;

    raw = raw.replace(/```json|```/g, "").trim();

    const jsonString = extractJSON(raw);

    if (!jsonString) {
      return res.json({ success: true, quiz: [] });
    }

    let quiz;

    try {
      quiz = JSON.parse(jsonString);
    } catch {
      return res.json({ success: true, quiz: [] });
    }

    // 🔥 FORCE LIMIT (AI kabhi zyada de deta hai)
    quiz = quiz.slice(0, count);

    await History.create({
      userId: req.user,
      text,
      quiz,
      type: "quiz",
    });

    res.json({ success: true, quiz });

  } catch (err) {
    console.error("🔥 Quiz Error:", err.message);
    next(err);
  }
};

module.exports = { generateQuiz };