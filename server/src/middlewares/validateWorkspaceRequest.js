import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";

const validateCreateWorkspace = (req, res, next) => {
  const { name } = req.body || {};
  if (!name || name.trim() === "") {
    res.status(400);
    throw new ApiError(400, "Workspace name is required");
  }
  next();
};

const validateGetWorkspaceById = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    res.status(400);
    throw new ApiError(400, "Workspace ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new ApiError(400, "Invalid workspace ID");
  }
  next();
};

const validateGetWorkspaceMembers = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new ApiError(400, "Workspace ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new ApiError(400, "Invalid workspace ID");
  }
  next();
};

const validateUpdateWorkspace = (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body || {};
  if (!name || name.trim() === "") {
    res.status(400);
    throw new ApiError(400, "Workspace name is required");
  }

  if (!id) {
    res.status(400);
    throw new ApiError(400, "Workspace ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new ApiError(400, "Invalid workspace ID");
  }
  next();
};

const validateUpdateMember = (req, res, next) => {
  const { id } = req.params;
  const { email, username } = req.body || {};

  if (!email && !username) {
    res.status(400);
    throw new ApiError(400, "User email or username is required");
  }

  if (!id) {
    res.status(400);
    throw new ApiError(400, "Workspace ID is required");
  }
  next();
};

const validateDeleteWorkspace = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    res.status(400);
    throw new ApiError(400, "Workspace ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new ApiError(400, "Invalid workspace ID");
  }
  next();
};

export {
  validateCreateWorkspace,
  validateGetWorkspaceById,
  validateGetWorkspaceMembers,
  validateUpdateWorkspace,
  validateUpdateMember,
  validateDeleteWorkspace,
};
