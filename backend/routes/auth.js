const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const authMiddleware = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/limiter");
const { ApiErrorCode } = require("./error-codes");
const { sendErrorResponse } = require("./utils");

const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;
const registerLimiter = createRateLimiter(rateLimitMax); // max 3 for register
const loginLimiter = createRateLimiter(rateLimitMax);
const sendCodeLimiter = createRateLimiter(rateLimitMax);
const verifyUserCodeLimiter = createRateLimiter(rateLimitMax);
const resetPasswordLimiter = createRateLimiter(rateLimitMax);

const User = require("../models/user");
const { getRandomVerifyCode, getVerifyCodeExpireTimeout, isValidPassword } = require("../utils/utils");

const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

// Register
router.post("/register", registerLimiter, async (req, res) => {
  const { mobile, password } = req.body;
  const trimmedPassword = password.trim();

  if (!/^0/.test(mobile) || !validator.isMobilePhone(mobile, "si-LK")) {
    return sendErrorResponse(res, 400, ApiErrorCode.INVALID_MOBILE, "Invalid mobile number format");
  }

  if (!isValidPassword(password)) {
    return sendErrorResponse(res, 400, ApiErrorCode.INVALID_PASSWORD, "Password must be at least 8 characters with uppercase, lowercase, and number");
  }

  const existingUser = await User.findByMobile(mobile);
  if (existingUser) {
    return sendErrorResponse(res, 400, ApiErrorCode.MOBILE_ALREADY_REGISTERED, "Mobile number already registered");
  }

  try {
    const hashed = await bcrypt.hash(trimmedPassword, saltRounds);
    const user = await User.create(mobile, hashed);
    const token = jwt.sign(
      { mobile, is_verified: user.is_verified },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
    res.json({
      message: "User registered successfully",
      mobile: user.mobile,
      is_verified: user.is_verified,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return sendErrorResponse(res, 500, ApiErrorCode.INTERNAL_SERVER_ERROR, "Server error during registration");
  }
});

// Login
router.post("/login", loginLimiter, async (req, res) => {
  const { mobile, password } = req.body;
  const trimmedPassword = password.trim();

  try {
    const user = await User.findByMobile(mobile);
    if (user && (await bcrypt.compare(trimmedPassword, user.password))) {
      const token = jwt.sign(
        { mobile, is_verified: user.is_verified },
        process.env.JWT_SECRET,
        { expiresIn: user.is_verified ? "1h" : "5m" }
      );
      res.json({
        message: "Login successful",
        token,
        is_verified: user.is_verified,
      });
    } else {
      return sendErrorResponse(res, 401, ApiErrorCode.INCORRECT_MOBILE_PWD, "Invalid mobile or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    return sendErrorResponse(res, 500, ApiErrorCode.INTERNAL_SERVER_ERROR, "Server error during login");
  }
});

// Send Verification Code
router.post("/send-code", sendCodeLimiter, async (req, res) => {
  const { mobile, type } = req.body;
  const code = getRandomVerifyCode();
  const expiresAt = new Date(Date.now() + getVerifyCodeExpireTimeout());

  try {
    const u = await User.findByMobile(mobile);
    if (!u) return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_MOBILE_PWD, "User does not exist");

    await User.newCode(u.id, code, type, expiresAt);
    console.log(`Verification code for ${mobile} (${type}): ${code}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, 500, ApiErrorCode.INTERNAL_SERVER_ERROR, "Server error during send code");
  }
});

// Verify User
router.post("/verify-user-code", authMiddleware, verifyUserCodeLimiter, async (req, res) => {
  const { mobile, code } = req.body;
  const type = "mobile_verification";

  if (!code || code.length !== 6 || !validator.isNumeric(code)) {
    return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_VERIFY_CODE, "Invalid verification code");

  }

  try {
    const u = await User.findByMobile(mobile);
    if (!u) return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_MOBILE_PWD, "User does not exist");

    const isVerified = await User.verifyUser(u.id, code, type);
    if (isVerified) {
      const token = jwt.sign(
        { mobile, is_verified: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ success: true, token });
    } else {
      return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_VERIFY_CODE, "Invalid or expired verification code");
    }
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, 500, ApiErrorCode.INTERNAL_SERVER_ERROR, "Server error during verify user code");
  }
});

// Verify User
router.post("/reset-password", resetPasswordLimiter, async (req, res) => {
  const { mobile, code, newPassword } = req.body;
  const trimmedPassword = newPassword.trim();

  const type = "password_reset";

  if (!code || code.length !== 6 || !validator.isNumeric(code)) {
    return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_VERIFY_CODE, "Invalid verification code");

  }

  if (!isValidPassword(trimmedPassword)) {
    return sendErrorResponse(res, 400, ApiErrorCode.INVALID_PASSWORD, "Password must be at least 8 characters with uppercase, lowercase, and number");
  }

  try {
    const u = await User.findByMobile(mobile);
    if (!u) return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_MOBILE_PWD, "User does not exist");

    const hashed = await bcrypt.hash(trimmedPassword, saltRounds);
    const isValidCode = await User.updatePassword(u.id, code, hashed, type);
    if (isValidCode) {
      res.json({ success: true });
    } else {
      return sendErrorResponse(res, 400, ApiErrorCode.INCORRECT_VERIFY_CODE, "Invalid or expired verification code");

    }
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, 500, ApiErrorCode.INTERNAL_SERVER_ERROR, "Server error during reset password");
  }
});

module.exports = router;
