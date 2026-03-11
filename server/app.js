import cookieParser from "cookie-parser";
import express from "express";
import env from "./src/config/env.js";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
app.use(compression()); // to compress response bodies for all request that traverse through the middleware

app.get("/health", (_, res) => {
  res.send("Health check passed!");
});

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.stack || err.message);

  // ✅ Handle your ApiError
  if (err.name === "ApiError") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      ...(err.data && { data: err.data }),
    });
  }

  // ✅ Handle validation errors (if using express-validator)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message:
        "Validation failed. Required fields might be missing or incorrect.",
      errors: err.errors,
    });
  }

  // ✅ Handle Mongoose errors
  if (err.name === "MongoError" || err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // Generic server errors
  res.status(500).json({
    success: false,
    message: "Something went wrong! Please try again later.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
