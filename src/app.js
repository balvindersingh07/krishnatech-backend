// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const nodemailer = require("nodemailer");

// ✅ FIXED IMPORT (IMPORTANT)
const { Resend } = require("resend");

// ✅ correct route imports
const healthRoutes = require("./routes/health.routes");
const contactRoutes = require("./routes/contact.routes");
const leadsRoutes = require("./routes/leads.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

// ✅ IMPORTANT: trust Render proxy
app.set("trust proxy", 1);

// --------------------- security ---------------------
app.use(helmet());

// --------------------- parsers ----------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------- CORS ---------------------
const normalizeOrigins = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const allowedOrigins = normalizeOrigins(env.CORS_ORIGINS);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (!allowedOrigins.length) {
        console.warn("⚠️ CORS_ORIGINS not configured");
        return cb(null, false);
      }

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      console.warn("❌ CORS blocked:", origin);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.options("*", cors());

// --------------------- base -------------------------
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "KrishnaTech Innovations API",
  });
});

// --------------------- routes -----------------------
app.use("/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/ai", aiRoutes);

// --------------------- 404 --------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --------------------- error handler ----------------
app.use((err, _req, res, _next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({
    success: false,
    message: err?.message || "Server error",
  });
});

// --------------------------------------
// Email Sending Function Using Resend API
// --------------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await resend.emails.send({
      from: process.env.SMTP_USER,
      to: to || process.env.EMAIL_TO,
      subject: subject || "Subject here",
      html: htmlContent,
    });

    console.log("Email sent:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = app;