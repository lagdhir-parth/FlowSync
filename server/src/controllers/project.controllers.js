import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params || {};
  const { name, description } = req.body || {};
  const userId = req.user._id;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  if (!workspace.members.some((member) => member.equals(userId))) {
    throw new ApiError(
      403,
      "You must be a member of the workspace to create a project",
    );
  }

  const project = await Project.create({
    name,
    description,
    projectManager: userId,
    workspace: workspaceId,
    members: [userId],
    status: "active",
  });

  await Workspace.findByIdAndUpdate(workspaceId, {
    $addToSet: { projects: project._id },
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Project created successfully", project));
});

const getAllProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const projects = await Project.find({ members: userId })
    .populate("members", "name email")
    .populate("tasks")
    .populate("workspace", "name")
    .populate("projectManager", "name email")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Projects retrieved successfully", projects));
});

const getProjectsByWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params || {};

  const projects = await Project.find({
    workspace: workspaceId,
  })
    .populate("members", "name email")
    .populate("tasks")
    .populate("workspace", "name")
    .lean();

  res
    .status(200)
    .json(new ApiResponse(200, "Projects retrieved successfully", projects));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const userId = req.user._id;

  const project = await Project.findOne({ _id: projectId, members: userId })
    .populate("members", "name email")
    .populate("tasks")
    .populate("workspace", "name")
    .populate("projectManager", "name email")
    .lean();

  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Project retrieved successfully", project));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const userId = req.user._id;

  const project = await Project.findOne({
    _id: projectId,
    members: userId,
  })
    .populate("members", "name email")
    .lean();

  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Project members retrieved successfully",
        project.members,
      ),
    );
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const updateData = req.body || {};
  const userId = req.user._id;

  const project = await Project.findOneAndUpdate(
    { _id: projectId, projectManager: userId },
    updateData,
    {
      new: true,
      validateBeforeSave: false,
    },
  )
    .populate("members", "name email")
    .populate("workspace", "name")
    .lean();

  if (!project) {
    res.status(404);
    throw new ApiError(
      404,
      "Project not found or you are not the project manager",
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Project updated successfully", project));
});

const inviteMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const { email } = req.body || {};
  const userId = req.user._id;

  const userToInvite = await User.findOne({ email });

  if (!userToInvite) {
    res.status(404);
    throw new ApiError(404, "User with the provided email not found");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  if (!project.projectManager.equals(userId)) {
    res.status(403);
    throw new ApiError(403, "Only the project manager can invite members");
  }

  if (project.members.includes(userToInvite._id)) {
    res.status(400);
    throw new ApiError(400, "User is already a member of the project");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (
    !workspace ||
    !workspace.members.some((member) => member.equals(userToInvite._id))
  ) {
    res.status(400);
    throw new ApiError(
      400,
      "User must be a member of the workspace to be invited to the project",
    );
  }

  await Project.findByIdAndUpdate(projectId, {
    $addToSet: { members: userToInvite._id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Members invited successfully", project));
});

const removeMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const { email } = req.body || {};
  const userId = req.user._id;

  const userToRemove = await User.findOne({ email });

  if (!userToRemove) {
    res.status(404);
    throw new ApiError(404, "User with the provided email not found");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  if (!project.projectManager.equals(userId)) {
    res.status(403);
    throw new ApiError(403, "Only the project manager can remove members");
  }

  if (!project.members.some((member) => member.equals(userToRemove._id))) {
    res.status(400);
    throw new ApiError(400, "User is not a member of the project");
  }

  await Project.findByIdAndUpdate(projectId, {
    $pull: { members: userToRemove._id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Member removed successfully", project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params || {};
  const userId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new ApiError(404, "Project not found");
  }

  const workspace = await Workspace.findByIdAndUpdate(
    project.workspace,
    {
      $pull: { projects: project._id },
    },
    { new: true },
  );

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  if (project.projectManager.equals(userId) || workspace.owner.equals(userId)) {
    await Project.findByIdAndDelete(projectId);
  } else {
    res.status(403);
    throw new ApiError(
      403,
      "Only the project manager or workspace owner can delete the project",
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Project deleted successfully", project));
});

export {
  createProject,
  getAllProjects,
  getProjectsByWorkspace,
  getProjectById,
  getProjectMembers,
  updateProject,
  inviteMembers,
  removeMember,
  deleteProject,
};
