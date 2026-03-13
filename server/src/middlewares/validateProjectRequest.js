import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";

const validateCreateProject = (req, res, next) => {
  const { name } = req.body || {};
  const { workspaceId } = req.params || {};

  if (!name) {
    res.status(400);
    throw new ApiError(400, "Project name is required");
  }

  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    res.status(400);
    throw new ApiError(400, "Valid workspaceId is required");
  }
  next();
};

const validateGetAllProjects = (req, res, next) => {
  const { workspaceId } = req.params || {};

  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    res.status(400);
    throw new ApiError(400, "Valid workspaceId is required");
  }

  next();
};

const validateGetProjectById = (req, res, next) => {
  const { projectId } = req.params || {};

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Valid projectId is required");
  }

  next();
};

const validateUpdateProject = (req, res, next) => {
  const updateData = req.body;
  const allowedUpdates = ["name", "description", "status"];
  const { projectId } = req.params || {};

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Valid projectId is required");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    res.status(400);
    throw new ApiError(400, "Please provide data to update");
  }

  // Validate update fields
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(
    (update) => allowedUpdates.includes(update) && updateData[update] !== "",
  );

  if (
    updateData.status &&
    !["active", "completed", "archived", "on hold", "dropped"].includes(
      updateData.status,
    )
  ) {
    res.status(400);
    throw new ApiError(400, "Invalid status value");
  }

  if (!isValidOperation) {
    res.status(400);
    throw new ApiError(400, "Invalid updates!");
  }
  next();
};

const validateUpdateMembers = (req, res, next) => {
  const { projectId } = req.params || {};
  const { email } = req.body || {};

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Valid projectId is required");
  }

  if (!email) {
    res.status(400);
    throw new ApiError(400, "Email is required to update members");
  }
  next();
};

const validateDeleteProject = (req, res, next) => {
  const { projectId } = req.params || {};

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new ApiError(400, "Valid projectId is required");
  }

  next();
};

export {
  validateCreateProject,
  validateGetAllProjects,
  validateGetProjectById,
  validateUpdateProject,
  validateUpdateMembers,
  validateDeleteProject,
};
