const History = require("../models/History");
const { chat } = require("../services/aiService");

// extract only valid JSON array safely
const extractJSON = (text) => {
  const arr = text.match(/\[\s*\{[\s\S]*}\s*\]/);
  if (arr) return arr[0];

  const obj = text.match(/\{\s*[\s\S]*}/);
  if (obj) {
    try {
      const parsed = JSON.parse(obj[0]);
      for (const key of ["questions", "quiz", "mcqs", "data", "items"]) {
        if (Array.isArray(parsed?.[key])) return JSON.stringify(parsed[key]);
      }
    } catch {}
  }
  return null;
};

const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");

// Reads the intended question count out of a free-form prompt,
// e.g. "make 10 MCQs" / "5 questions on SQL" / "generate 3 quiz questions".
const inferCount = (prompt) => {
  const text = prompt.toLowerCase();

  const patterns = [
    /(\d{1,2})\s*(?:\+\s*)?(?:mcqs?|multiple[\s-]choice|questions?|quiz\s*questions?)\b/,
    /(?:mcqs?|questions?)\s*[:\-=]?\s*(\d{1,2})/,
    /(?:generate|create|make|give|write|prepare|provide|quiz)\s*(?:me)?\s*(?:with)?\s*(\d{1,2})\b/,
  ];

  // Handles absurd numbers like "make 1000 mcqs" instead of discarding them.
  const oversized = text.match(
    /(\d{1,4})\s*(?:\+\s*)?(?:mcqs?|multiple[\s-]choice|questions?)\b/
  );
  if (oversized) {
    const big = parseInt(oversized[1], 10);
    if (big > 50) return 50;
  }

  for (const p of patterns) {
    const m = text.match(p);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 50) return n;
  }

  const loose = text.match(/\b(\d{1,2})\b/);
  if (loose) {
    const n = parseInt(loose[1], 10);
    if (n >= 1 && n <= 50) return n;
  }

  return null;
};

// Tolerates the shapes models actually emit: answer as text, as an index,
// as a letter label, or with small casing/whitespace drift.
const normalizeQuestion = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const question =
    [raw.question, raw.q, raw.text, raw.title].find(
      (v) => typeof v === "string" && v.trim()
    );
  if (!question) return null;

  const rawOptions = [raw.options, raw.choices, raw.opts, raw.answers].find(
    (v) => Array.isArray(v) && v.length >= 2
  );
  if (!rawOptions) return null;

  const options = rawOptions.map((o) =>
    typeof o === "string" ? o.trim() : String(o?.text ?? o ?? "").trim()
  );
  if (options.some((o) => !o)) return null;

  const rawAnswer = raw.answer ?? raw.correct ?? raw.correctAnswer ?? raw.answerText;

  if (typeof rawAnswer === "number" && options[rawAnswer] !== undefined) {
    return { question, options, answer: options[rawAnswer] };
  }
  if (typeof rawAnswer !== "string" || !rawAnswer.trim()) return null;

  if (options.includes(rawAnswer)) {
    return { question, options, answer: rawAnswer };
  }

  const target = norm(rawAnswer);
  const ci = options.findIndex((o) => norm(o) === target);
  if (ci !== -1) return { question, options, answer: options[ci] };

  if (/^[a-e]$/i.test(rawAnswer.trim())) {
    const li = rawAnswer.trim().toUpperCase().charCodeAt(0) - 65;
    if (options[li] !== undefined && /^[a-e]$/i.test(options[li])) {
      return { question, options, answer: options[li] };
    }
  }

  const partial = options.filter(
    (o) => norm(o).includes(target) || target.includes(norm(o))
  );
  if (partial.length === 1) return { question, options, answer: partial[0] };

  return null;
};

const runOnce = async (prompt) => {
  const { content: raw, usage } = await chat(prompt);

  const stripped = raw.replace(/```json|```/g, "").trim();
  const jsonString = extractJSON(stripped);

  if (!jsonString) {
    console.warn("Quiz JSON not found. Raw response:", stripped.slice(0, 500));
    return { questions: [], usage };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseErr) {
    console.warn(
      "Quiz JSON parse failed:",
      parseErr.message,
      "| Raw:",
      stripped.slice(0, 500)
    );
    return { questions: [], usage };
  }

  if (!Array.isArray(parsed)) {
    console.warn("Quiz response was not an array. Raw:", stripped.slice(0, 300));
    return { questions: [], usage };
  }

  return { questions: parsed.map(normalizeQuestion).filter(Boolean), usage };
};

const sumUsage = (list) => {
  const valid = list.filter(Boolean);
  if (!valid.length) return null;

  // A quiz can span two providers (e.g. one attempt on Groq, the retry on
  // OpenRouter), so the names are collected rather than overwritten.
  const providers = [...new Set(valid.map((u) => u.provider).filter(Boolean))];

  return {
    promptTokens: valid.reduce((a, u) => a + (u.promptTokens || 0), 0),
    completionTokens: valid.reduce((a, u) => a + (u.completionTokens || 0), 0),
    totalTokens: valid.reduce((a, u) => a + (u.totalTokens || 0), 0),
    cost: Number(valid.reduce((a, u) => a + (u.cost || 0), 0).toFixed(8)),
    provider: providers.length === 1 ? providers[0] : providers.join("+") || null,
  };
};

const generateQuiz = async (req, res, next) => {
  try {
    const {
      text,
      difficulty = "easy",
      questionCount = 5,
      customPrompt = false,
    } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text required",
      });
    }

    const fallback = Math.min(Math.max(Number(questionCount) || 5, 5), 20);

    // In custom mode the number written in the prompt wins over the dropdown.
    let count = fallback;
    let countSource = "selection";

    if (customPrompt) {
      const inferred = inferCount(text);
      if (inferred) {
        count = Math.min(Math.max(inferred, 2), 25);
        countSource = "prompt";
      }
    }

    const allowedDifficulty = ["easy", "medium", "hard"];
    const level = allowedDifficulty.includes(difficulty) ? difficulty : "easy";

    const rules = `Rules:
- "options" must be an array of exactly 4 strings.
- "answer" MUST be copied character-for-character from one of the "options" strings. Never invent an answer that is not listed.
- Do not wrap the output in markdown code fences.

Format:
[
  {
    "question": "string",
    "options": ["A","B","C","D"],
    "answer": "A"
  }
]`;

    const buildPrompt = (n, nudge) => {
      const body = customPrompt
        ? `You will receive an instruction from the user. Follow it, but ALWAYS respond with ONLY a valid JSON array of MCQs in this exact format, with no prose and no markdown fences.

${nudge ? `IMPORTANT: your previous attempt was rejected. ${nudge}\n\n` : ""}Maximize the number of questions to ${n}. Never exceed ${n}.

User instruction:
"""
${text}
"""${rules}`
        : `Return ONLY a valid JSON array. No prose, no markdown fences.

${nudge ? `IMPORTANT: your previous attempt was rejected. ${nudge}\n\n` : ""}Generate EXACTLY ${n} ${level} MCQs based only on the text below.

${rules}

Text:
${text}`;
      return body;
    };

    const attempts = [];
    let collected = [];
    const seen = new Set();

    for (let i = 0; i < 2; i++) {
      const nudge =
        i === 0
          ? ""
          : "Make sure every \"answer\" value is one of the exact strings in its \"options\" array.";

      const { questions, usage } = await runOnce(buildPrompt(count, nudge));
      attempts.push(usage);

      for (const q of questions) {
        const key = norm(q.question);
        if (seen.has(key)) continue;
        seen.add(key);
        collected.push(q);
      }

      if (collected.length >= count) break;
    }

    const quiz = collected.slice(0, count);
    const usage = sumUsage(attempts);

    if (!quiz.length) {
      return res.status(502).json({
        success: false,
        message:
          "The AI could not generate valid questions. Try rephrasing your prompt.",
        usage,
      });
    }

    if (quiz.length < count) {
      console.warn(
        `Requested ${count} questions, only ${quiz.length} were valid after ${attempts.length} attempt(s)`
      );
    }

    await History.create({
      userId: req.user,
      text,
      quiz,
      type: "quiz",
      usage: usage || undefined,
    });

    res.json({
      success: true,
      quiz,
      usage,
      partial: quiz.length < count,
      requested: count,
      countSource,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { generateQuiz };