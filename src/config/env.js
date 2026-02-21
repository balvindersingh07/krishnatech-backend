// backend/src/config/env.js
const dotenv = require("dotenv");

dotenv.config();

const env = {
  PORT: Number(process.env.PORT || 8080),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Mongo
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || "",

  // CORS
  CORS_ORIGINS: (process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean),

  // ✅ Resend Email Config
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_TO: process.env.EMAIL_TO || "",
  AUTO_REPLY:
    String(process.env.AUTO_REPLY || "true").toLowerCase() === "true",

  // OpenAI (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
};

module.exports = env;