const axios = require("axios");
const History = require("../models/History");

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const { YoutubeTranscript } = require("youtube-transcript");

function getTranscript(videoId) {
  return YoutubeTranscript.fetchTranscript(videoId).then((segments) =>
    segments.map((s) => s.text).join(" ")
  );
}

const summarizeText = async (req, res, next) => {
  try {
    const { text, youtube, type } = req.body;

    const inputText = typeof text === "string" ? text : "";

    if (!inputText.trim() && !youtube) {
      return res.status(400).json({
        success: false,
        message: "Text or YouTube URL required",
      });
    }

    let prompt = "";
    let transcriptText = "";

    if (youtube) {
      const videoId = extractVideoId(youtube);
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL. Use a valid YouTube link.",
        });
      }
      try {
        transcriptText = await getTranscript(videoId);
      } catch (err) {
        const msg = err.message || "";
        const hint = msg.includes("disabled")
          ? "This video has captions disabled. Try a video with captions/subtitles enabled, or switch to Text Input and paste your notes directly."
          : "Could not fetch transcript: " + msg + ". Try a different video or use Text Input mode.";
        return res.status(400).json({
          success: false,
          message: hint,
        });
      }
      if (!transcriptText.trim()) {
        return res.status(400).json({
          success: false,
          message: "No transcript found for this video. Try a different video or use Text Input mode.",
        });
      }
      const truncated = transcriptText.slice(0, 8000);
      if (type === "points") {
        prompt = `Extract key points in bullet form from this transcript:\n${truncated}`;
      } else {
        prompt = `Summarize this transcript clearly:\n${truncated}`;
      }
    } else if (type === "points") {
      prompt = `Extract key points in bullet form:\n${inputText}`;
    } else {
      prompt = `Summarize this text clearly:\n${inputText}`;
    }

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

    const summary =
      response?.data?.choices?.[0]?.message?.content ||
      "No summary generated";

    await History.create({
      userId: req.user,
      text: youtube || inputText,
      summary,
      type: "summary",
    });

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
