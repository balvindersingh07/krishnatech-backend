// backend/src/routes/ai.js
const router = require("express").Router();
const { askAI } = require("../services/ai.service");

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || String(prompt).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "prompt required",
      });
    }

    const answer = await askAI(String(prompt).trim());

    return res.json({
      success: true,
      reply: answer,
    });
  } catch (e) {
    console.error("❌ AI route error:", e);
    return res.status(500).json({
      success: false,
      message: "AI request failed",
      error: e?.message || String(e),
    });
  }
});

module.exports = router;
