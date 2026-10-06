const History = require("../models/History");
const { chat } = require("../services/aiService");

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

    const { content: summary, usage } = await chat(prompt);

    if (!summary) {
      return res.status(502).json({
        success: false,
        message: "The AI returned an empty response. Please try again.",
      });
    }

    await History.create({
      userId: req.user,
      text: youtube || inputText,
      summary,
      type: "summary",
      usage: usage || undefined,
    });

    res.json({
      success: true,
      summary,
      usage,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { summarizeText };
