import { Router } from "express";
import verifyJWT from "../middlewares/verifyToken.middleware.js";
import { chat } from "../controllers/chatbot.controller.js";

const router = Router();

router.post("/", verifyJWT, chat);

export default router;
