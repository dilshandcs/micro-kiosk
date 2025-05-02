const express = require("express");
const router = express.Router();

router.post("/send-notification", (req, res) => {
  const { message } = req.body;
  console.log("Sending notification:", message);
  res.json({ message: "Notification sent successfully (mocked)" });
});

module.exports = router;
