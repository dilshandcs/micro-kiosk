function sendErrorResponse(res, statusCode, errorCode, message) {
  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
  });
}

module.exports = { sendErrorResponse };