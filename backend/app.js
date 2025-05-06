require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const OpenApiValidator = require("express-openapi-validator");

// Load environment configs
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8081";

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notification");

const app = express();

// Middleware: Body Parser & CORS
app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json());

// Serve OpenAPI spec
const specPath = path.join(__dirname, "api", "openapi.yaml");
app.use("/spec", express.static(specPath));

// OpenAPI Validator Middleware
app.use(
  OpenApiValidator.middleware({
    apiSpec: specPath,
    validateRequests: true,
    validateResponses: true,
  })
);

// Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(notificationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Validation error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

module.exports = { app };
