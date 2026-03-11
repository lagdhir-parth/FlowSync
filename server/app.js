import express from "express";

const app = express();

app.get("/health", (_, res) => {
  res.send("Health check passed!");
});

export default app;
