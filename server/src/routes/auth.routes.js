import { Router } from "express";
import verifyJWT from "../middlewares/verifyToken.middleware.js";
import {
  registerUser,
  loginUser,
  googleLogin,
  refreshAccessToken,
  logoutUser,
  currentUser,
} from "../controllers/auth.controllers.js";
import {
  validateRegistrationRequest,
  validateLoginRequest,
  validateRefreshAccessTokenRequest,
} from "../middlewares/validateAuthRequest.js";

const router = Router();

router.post("/register", validateRegistrationRequest, registerUser);
router.post("/login", validateLoginRequest, loginUser);
router.post("/google", googleLogin);
router.post(
  "/refreshAccessToken",
  validateRefreshAccessTokenRequest,
  refreshAccessToken,
);
router.post("/logout", verifyJWT, logoutUser);
router.get("/current", verifyJWT, currentUser);

export default router;
