import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";

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
    .json(new ApiResponse(201, workspace, "Workspace created successfully"));
});

const getAllWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const workspaces = await Workspace.find({ members: userId })
    .populate("owner", "name email")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, workspaces, "Workspaces retrieved successfully"),
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
    .json(new ApiResponse(200, workspace, "Workspace retrieved successfully"));
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
    .json(new ApiResponse(200, workspace, "Workspace updated successfully"));
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
    .json(new ApiResponse(200, newWorkspace, "Member invited successfully"));
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
  await Workspace.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Workspace deleted successfully"));
});

export {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  inviteMember,
  deleteWorkspace,
};
