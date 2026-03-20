import { Router } from "express";
import verifyJWT from "../middlewares/verifyToken.middleware.js";
import { getDashboardStats } from "../controllers/stats.controllers.js";

const router = Router();

router.get("/dashboard", verifyJWT, getDashboardStats);

export default router;
