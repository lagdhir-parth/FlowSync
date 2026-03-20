import cookieParser from "cookie-parser";
import express from "express";
import env from "./src/config/env.js";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Trust proxy stringly recommended and sometimes required for rate limiting behind reverse proxies (like Render)
app.set("trust proxy", 1);

app.use(compression()); // to compress response bodies for all request that traverse through the middleware

app.get("/health", (_, res) => {
  res.send("Health check passed!");
});

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
    exposedHeaders: ["X-Voice-Command", "X-Voice-Action", "X-Voice-Reply"],
  }),
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(express.static("public"));

// Routes
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import taskRouter from "./src/routes/task.routes.js";
import projectRouter from "./src/routes/project.routes.js";
import workspaceRouter from "./src/routes/workspace.routes.js";
import aiRouter from "./src/routes/ai.routes.js";
import statsRouter from "./src/routes/stats.routes.js";
import chatBotRouter from "./src/routes/chatbot.routes.js";

app.use("/api/ai", aiRouter); // Make sure this is before other routes to avoid conflicts
app.use("/api/chat", chatBotRouter); // Make sure this is before other routes to avoid conflicts

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/projects", projectRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api/stats", statsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.stack || err.message);

  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Voice payload is too large. Please record a shorter command.",
    });
  }

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
