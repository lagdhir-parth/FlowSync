import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import {
  validateGetUserByIdRequest,
  validateUpdateProfileRequest,
  validateUpdatePasswordRequest,
} from "../middlewares/validateUserRequest.js";
import {
  getUserById,
  getAllUsers,
  updateProfile,
  updatePassword,
  deleteProfile,
} from "../controllers/user.controllers.js";

const router = Router();

router.get("/:id", validateGetUserByIdRequest, getUserById);
router.get("/", getAllUsers);
router.patch(
  "/updateProfile",
  verifyToken,
  validateUpdateProfileRequest,
  updateProfile,
);
router.patch(
  "/updatePassword",
  verifyToken,
  validateUpdatePasswordRequest,
  updatePassword,
);
router.delete("/deleteProfile", verifyToken, deleteProfile);

export default router;
