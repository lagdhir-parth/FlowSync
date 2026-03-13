import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import {
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  removeComment,
  reorderTasks,
} from "../controllers/task.controllers.js";
import {
  validateCreateTask,
  validateGetTasks,
  validateGetTaskById,
  validateUpdateTask,
  validateAddComment,
  validateRemoveComment,
  validateReorderTasks,
  validateDeleteTask,
} from "../middlewares/validateTaskRequest.js";

const router = Router();

router.post("/", verifyToken, validateCreateTask, createTask);
router.get("/:taskId", verifyToken, validateGetTaskById, getTaskById);
router.get("/project/:projectId", verifyToken, validateGetTasks, getTasks);
router.patch("/:taskId", verifyToken, validateUpdateTask, updateTask);
router.patch(
  "/:projectId/reorder",
  verifyToken,
  validateReorderTasks,
  reorderTasks,
);
router.patch("/:taskId/comments", verifyToken, validateAddComment, addComment);
router.delete(
  "/:taskId/comments/:commentId",
  verifyToken,
  validateRemoveComment,
  removeComment,
);
router.delete(
  "/:projectId/tasks/:taskId",
  verifyToken,
  validateDeleteTask,
  deleteTask,
);

export default router;
