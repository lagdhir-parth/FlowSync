import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  inviteMember,
  removeMember,
  deleteWorkspace,
} from "../controllers/workspace.controllers.js";
import {
  validateCreateWorkspace,
  validateGetWorkspaceById,
  validateUpdateWorkspace,
  validateUpdateMember,
  validateDeleteWorkspace,
} from "../middlewares/validateWorkspaceRequest.js";

const router = Router();

router.post("/", verifyToken, validateCreateWorkspace, createWorkspace);
router.get("/", verifyToken, getAllWorkspaces);
router.get("/:id", verifyToken, validateGetWorkspaceById, getWorkspaceById);
router.patch("/:id", verifyToken, validateUpdateWorkspace, updateWorkspace);
router.patch("/:id/invite", verifyToken, validateUpdateMember, inviteMember);
router.patch(
  "/:id/remove-member",
  verifyToken,
  validateUpdateMember,
  removeMember,
);
router.delete("/:id", verifyToken, validateDeleteWorkspace, deleteWorkspace);

export default router;
