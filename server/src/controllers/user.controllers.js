import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken").lean();

  if (!user) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken").lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const updateData = req.body || {};
  const query = [];

  if (updateData.username) {
    query.push({ username: updateData.username.toLowerCase() });
  }

  if (updateData.email) {
    query.push({ email: updateData.email });
  }

  const existedUser = await User.findOne({
    $or: query,
    _id: { $ne: userId },
  });

  if (existedUser) {
    res.status(400);
    throw new ApiError(
      400,
      `User with this ${
        existedUser.username === updateData.username ? "username" : "email"
      } already exists`,
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", updatedUser));
});

const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { oldPassword, newPassword } = req.body || {};

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  const isOldPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isOldPasswordCorrect) {
    res.status(401);
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully", null));
});

const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully", deletedUser));
});

export {
  getUserById,
  getAllUsers,
  updateProfile,
  updatePassword,
  deleteProfile,
};
