import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";

const validateCreateTask = asyncHandler(async (req, res, next) => {
  const { name, title, projectId, assigneeId, priority, status, deadline } =
    req.body || {};
  const userId = req.user._id;

  // Validate required fields
  if (!(name || title) || !projectId || !priority || !status) {
    throw new ApiError(400, "Please fill all required fields");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Invalid project id");
  }

  // Validate project existence
  const project = await Project.findById(projectId).select("members");
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Validate user access to the project
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this project");
  }

  // Validate assignee existence if provided
  if (assigneeId) {
    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      res.status(400);
      throw new ApiError(400, "Invalid assignee id");
    }
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      throw new ApiError(404, "Assignee not found");
    }
  }

  // Validate deadline if provided
  if (deadline && new Date(deadline) <= new Date()) {
    res.status(400);
    throw new ApiError(400, "Deadline must be a future date");
  }

  if (!["low", "medium", "high"].includes(priority)) {
    res.status(400);
    throw new ApiError(400, "Invalid priority value");
  }

  if (!["todo", "in progress", "review", "done"].includes(status)) {
    res.status(400);
    throw new ApiError(400, "Invalid status value");
  }

  next();
});

const validateGetTasksByProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Invalid task id");
  }

  // Validate project existence
  const project = await Project.findById(projectId).select("members");
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Validate user access to the project
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this project");
  }

  next();
});

const validateGetTaskById = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400);
    throw new ApiError(400, "Invalid Task ID");
  }

  next();
});

const validateUpdateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const updates = req.body;
  const allowedUpdates = [
    "name",
    "title",
    "description",
    "assignee",
    "priority",
    "status",
    "deadline",
  ];

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400);
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project).select("members");
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  // Validate updates
  if (!updates || Object.keys(updates).length === 0) {
    res.status(400);
    throw new ApiError(400, "Please provide data to update");
  }

  const isValidOperation = Object.keys(updates).every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperation) {
    res.status(400);
    throw new ApiError(400, "Invalid updates");
  }

  // Validate assignee existence if being updated
  if (updates.assignee) {
    if (!mongoose.Types.ObjectId.isValid(updates.assignee)) {
      res.status(400);
      throw new ApiError(400, "Invalid assignee id");
    }
    const assignee = await User.findById(updates.assignee);
    if (!assignee) {
      res.status(404);
      throw new ApiError(404, "Assignee not found");
    }
    if (!project.members.some((member) => member.equals(updates.assignee))) {
      res.status(400);
      throw new ApiError(400, "Assignee must be a member of the project");
    }
  }

  if (updates.deadline && new Date(updates.deadline) <= new Date()) {
    res.status(400);
    throw new ApiError(400, "Deadline must be a future date");
  }

  if (
    updates.priority &&
    !["low", "medium", "high"].includes(updates.priority)
  ) {
    res.status(400);
    throw new ApiError(400, "Invalid priority value");
  }

  if (
    updates.status &&
    !["todo", "in progress", "review", "done"].includes(updates.status)
  ) {
    res.status(400);
    throw new ApiError(400, "Invalid status value");
  }

  next();
});

const validateAddComment = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400);
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project).select("members");
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  if (!text) {
    res.status(400);
    throw new ApiError(400, "Text is required");
  }

  next();
});

const validateRemoveComment = asyncHandler(async (req, res, next) => {
  const { taskId, commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400);
    throw new ApiError(400, "Invalid task id");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(400);
    throw new ApiError(400, "Invalid comment id");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project).select(
    "members projectManager workspace",
  );
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new ApiError(404, "Comment not found");
  }

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  // Only comment author or project manager or workspace owner can delete the comment
  if (
    !comment.author.equals(userId) &&
    !project.projectManager.equals(userId) &&
    !workspace.owner.equals(userId)
  ) {
    res.status(403);
    throw new ApiError(
      403,
      "You do not have permission to delete this comment",
    );
  }
  next();
});

const validateReorderTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { orderedTaskIds } = req.body; // ['id_C', 'id_A', 'id_B']

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Invalid project id");
  }

  if (
    !orderedTaskIds ||
    !Array.isArray(orderedTaskIds) ||
    orderedTaskIds.length === 0
  ) {
    res.status(400);
    throw new ApiError(400, "orderedTaskIds must be a non-empty array");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  // Validate user access to the project
  if (!project.members.some((member) => member.equals(req.user._id))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this project");
  }

  // Validate that all task IDs belong to the project
  const tasks = await Task.find({ project: projectId }).select("_id");
  const taskIds = tasks.map((task) => task._id.toString());
  const invalidTaskIds = orderedTaskIds.filter((id) => !taskIds.includes(id));
  if (invalidTaskIds.length > 0) {
    res.status(400);
    throw new ApiError(400, "Invalid task IDs provided");
  }

  next();
});

const validateDeleteTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400);
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project).select(
    "members projectManager workspace",
  );
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  if (
    !task.createdBy.equals(userId) &&
    !project.projectManager.equals(userId) &&
    !workspace.owner.equals(userId)
  ) {
    res.status(403);
    throw new ApiError(
      403,
      "Only project manager or workspace owner can delete this task",
    );
  }

  next();
});

export {
  validateCreateTask,
  validateGetTasksByProject,
  validateGetTaskById,
  validateUpdateTask,
  validateAddComment,
  validateRemoveComment,
  validateReorderTasks,
  validateDeleteTask,
};
