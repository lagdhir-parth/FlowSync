import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  const owner = req.user._id;

  const workspace = await Workspace.create({
    name,
    owner,
    members: [owner],
  });

  await User.findByIdAndUpdate(owner, {
    $addToSet: { workspaces: workspace._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Workspace created successfully", workspace));
});

const getAllWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const workspaces = await Workspace.find({ members: userId })
    .populate("owner", "name email")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Workspaces retrieved successfully", workspaces),
    );
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const workspace = await Workspace.findOne({
    _id: id,
    members: userId,
  })
    .populate("owner", "name email")
    .lean();

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Workspace retrieved successfully", workspace));
});

const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const workspace = await Workspace.findOne({
    _id: id,
    members: userId,
  })
    .populate("members", "name email")
    .lean();

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Workspace members retrieved successfully",
        workspace.members,
      ),
    );
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  const userId = req.user._id;

  const workspace = await Workspace.findOne({
    _id: id,
    members: userId,
  });

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  if (!workspace.owner.equals(userId)) {
    res.status(403);
    throw new ApiError(
      403,
      "Only the workspace owner can update the workspace",
    );
  }

  workspace.name = name;
  await workspace.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Workspace updated successfully", workspace));
});

const inviteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body || {};
  const userId = req.user._id;

  const user = await User.findOneAndUpdate(
    { email },
    { $addToSet: { workspaces: id } },
    { new: true, validateBeforeSave: false },
  );

  if (!user) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  const workspace = await Workspace.findOne({
    _id: id,
    members: userId,
  });

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }
  if (!workspace.owner.equals(userId)) {
    res.status(403);
    throw new ApiError(
      403,
      "Only the workspace owner can invite members to the workspace",
    );
  }

  const newWorkspace = await Workspace.findByIdAndUpdate(
    workspace._id,
    { $addToSet: { members: user._id } },
    { new: true, validateBeforeSave: false },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Member invited successfully", newWorkspace));
});

const removeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body || {};
  const userId = req.user._id;

  const userToRemove = await User.findOneAndUpdate(
    { email },
    { $pull: { workspaces: id } },
    { new: true, validateBeforeSave: false },
  );

  if (!userToRemove) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  const workspace = await Workspace.findOne({
    _id: id,
    members: userId,
  });

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  if (!workspace.owner.equals(userId)) {
    res.status(403);
    throw new ApiError(
      403,
      "Only the workspace owner can remove members from the workspace",
    );
  }

  if (!workspace.members.some((member) => member.equals(userToRemove._id))) {
    res.status(400);
    throw new ApiError(400, "User is not a member of the workspace");
  }

  await Project.updateMany(
    {
      workspace: workspace._id,
      members: userToRemove._id,
    },
    {
      $pull: { members: userToRemove._id },
    },
  );

  const newWorkspace = await Workspace.findByIdAndUpdate(
    workspace._id,
    { $pull: { members: userToRemove._id } },
    { new: true, validateBeforeSave: false },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Member removed successfully", newWorkspace));
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const workspace = await Workspace.findById(id);

  if (!workspace) {
    res.status(404);
    throw new ApiError(404, "Workspace not found");
  }

  if (!workspace.owner.equals(userId)) {
    res.status(403);
    throw new ApiError(
      403,
      "Only the workspace owner can delete the workspace",
    );
  }

  await User.updateMany({ workspaces: id }, { $pull: { workspaces: id } });
  await Project.deleteMany({ workspace: id });
  await Workspace.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Workspace deleted successfully", null));
});

export {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  updateWorkspace,
  inviteMember,
  removeMember,
  deleteWorkspace,
};
