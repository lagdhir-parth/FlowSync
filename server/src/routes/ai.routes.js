import express from "express";
import { processVoiceCommand } from "../controllers/ai.controller.js";
import verifyToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post("/voice-command", verifyToken, processVoiceCommand);

export default router;
