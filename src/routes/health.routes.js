// backend/src/routes/health.routes.js
const router = require("express").Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    service: "KrishnaTech Innovations API",
    time: new Date().toISOString(),
  });
});

module.exports = router;
