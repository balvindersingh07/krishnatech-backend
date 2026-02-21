// backend/src/routes/leads.js
const router = require("express").Router();
const Lead = require("../models/Lead");

// POST /api/leads
router.post("/", async (req, res) => {
  try {
    const { name, email, company, requirement } = req.body || {};

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "name and email required" });
    }

    const saved = await Lead.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      company: company ? String(company).trim() : "",
      requirement: requirement ? String(requirement).trim() : "",
      source: "website-lead",
    });

    return res.json({
      success: true,
      message: "Lead saved successfully",
      id: String(saved._id),
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Lead submit failed",
      error: e?.message || String(e),
    });
  }
});

module.exports = router;
