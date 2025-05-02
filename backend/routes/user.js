const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({ mobile: req.user.mobile, is_verified: req.user.is_verified });
});

module.exports = router;
