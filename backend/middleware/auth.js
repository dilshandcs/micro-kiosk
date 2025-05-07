const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../routes/utils");
const { ApiErrorCode } = require("../routes/error-codes");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendErrorResponse(res, 401, ApiErrorCode.MISSING_AUTH_HEADER, "Authorization header missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return sendErrorResponse(res, 401, ApiErrorCode.INVALID_TOKEN, "Invalid or expired token");
  }
};
