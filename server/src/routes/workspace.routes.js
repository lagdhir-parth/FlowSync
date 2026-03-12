import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  inviteMember,
  deleteWorkspace,
} from "../controllers/workspace.controllers.js";
import {
  validateCreateWorkspace,
  validateGetWorkspaceById,
  validateUpdateWorkspace,
  validateInviteMember,
  validateDeleteWorkspace,
} from "../middlewares/validateWorkspaceRequest.js";

const router = Router();

router.post("/", verifyToken, validateCreateWorkspace, createWorkspace);
router.get("/", verifyToken, getAllWorkspaces);
router.get("/:id", verifyToken, validateGetWorkspaceById, getWorkspaceById);
router.patch("/:id", verifyToken, validateUpdateWorkspace, updateWorkspace);
router.patch("/:id/members", verifyToken, validateInviteMember, inviteMember);
router.delete("/:id", verifyToken, validateDeleteWorkspace, deleteWorkspace);

export default router;
