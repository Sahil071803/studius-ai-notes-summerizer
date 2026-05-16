const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Load ENV
dotenv.config();

// DB Connect
const connectDB = require("./config/db");
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const summarizeRoute = require("./routes/summarize");
const quizRoute = require("./routes/quiz");
const scoresRoute = require("./routes/scores");
const historyRoute = require("./routes/history");
const authRoute = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const feedbackRoute = require("./routes/feedback");

app.use("/api/summarize", summarizeRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/scores", scoresRoute);
app.use("/api/history", historyRoute);
app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/feedback", feedbackRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🚀 API running successfully" });
});

// Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});