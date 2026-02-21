const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const Contact = require("../models/Contact");
const { sendContactEmail } = require("../services/email.service");

/* -----------------------------
   RATE LIMIT (anti spam)
--------------------------------*/
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

router.use(contactLimiter);

/**
 * POST /api/contact
 * body: { name, email, phone?, message, company? (honeypot) }
 */
router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const message = String(req.body?.message || "").trim();
    const company = String(req.body?.company || "").trim(); // honeypot

    /* -----------------------------
       Honeypot (bots fill hidden field)
    --------------------------------*/
    if (company) {
      return res.status(400).json({
        success: false,
        message: "Spam detected.",
      });
    }

    /* -----------------------------
       Required fields
    --------------------------------*/
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Message are required.",
      });
    }

    /* -----------------------------
       Message length check
    --------------------------------*/
    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 10 and 2000 characters.",
      });
    }

    /* -----------------------------
       Email validation
    --------------------------------*/
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
    if (!emailOk) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    /* -----------------------------
       Save Contact
    --------------------------------*/
    const doc = await Contact.create({
      name,
      email,
      phone: phone || undefined,
      message,
      source: "website",
      status: "new",
      ip: req.ip,
    });

    /* -----------------------------
       Send Email (Fully Background Safe)
    --------------------------------*/
    setImmediate(() => {
      sendContactEmail({
        id: String(doc._id),
        name,
        email,
        phone,
        message,
      }).catch((mailErr) => {
        console.error("⚠️ Email send failed:", mailErr?.message || mailErr);
      });
    });

    /* -----------------------------
       Immediate Response
    --------------------------------*/
    return res.json({
      success: true,
      message: "Message received. We will contact you within 24 hours.",
      id: doc._id,
    });

  } catch (err) {
    console.error("❌ /api/contact error:", err?.message || err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

module.exports = router;