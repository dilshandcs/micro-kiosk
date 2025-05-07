const rateLimit = require("express-rate-limit");


function createRateLimiter(max) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
  });
}

module.exports = { createRateLimiter };