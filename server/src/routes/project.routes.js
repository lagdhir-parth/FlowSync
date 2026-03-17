import { Router } from "express";
import verifyTokens from "../middlewares/verifyToken.middleware.js";
import {
  createProject,
  getAllProjects,
  getProjectsByWorkspace,
  getProjectById,
  getProjectMembers,
  updateProject,
  inviteMembers,
  removeMember,
  deleteProject,
} from "../controllers/project.controllers.js";
import {
  validateCreateProject,
  validateGetProjectsByWorkspace,
  validateGetProjectById,
  validateGetProjectMembers,
  validateUpdateProject,
  validateUpdateMembers,
  validateDeleteProject,
} from "../middlewares/validateProjectRequest.js";

const router = Router();

router.post(
  "/:workspaceId/create",
  verifyTokens,
  validateCreateProject,
  createProject,
);
router.get("/", verifyTokens, getAllProjects);
router.get(
  "/:workspaceId/all",
  validateGetProjectsByWorkspace,
  getProjectsByWorkspace,
);
router.get(
  "/:projectId/members",
  verifyTokens,
  validateGetProjectMembers,
  getProjectMembers,
);
router.get("/:projectId", verifyTokens, validateGetProjectById, getProjectById);
router.patch("/:projectId", verifyTokens, validateUpdateProject, updateProject);
router.patch(
  "/:projectId/invite",
  verifyTokens,
  validateUpdateMembers,
  inviteMembers,
);
router.patch(
  "/:projectId/remove-member",
  verifyTokens,
  validateUpdateMembers,
  removeMember,
);
router.delete(
  "/:projectId",
  verifyTokens,
  validateDeleteProject,
  deleteProject,
);

export default router;
