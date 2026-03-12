import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";

const validateGetUserByIdRequest = (req, res, next) => {
  const { id } = req.params;

  // validate ObjectId to avoid CastError when a non-objectId string is passed
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new ApiError(400, "Invalid user id");
  }
  next();
};

const validateUpdateProfileRequest = (req, res, next) => {
  const updateData = req.body;
  const allowedUpdates = ["name", "username", "email", "gender", "avatarUrl"];

  if (!updateData || Object.keys(updateData).length === 0) {
    res.status(400);
    throw new ApiError(400, "Please provide data to update");
  }

  // Validate update fields
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(
    (update) => allowedUpdates.includes(update) && updateData[update] !== "",
  );

  if (!isValidOperation) {
    res.status(400);
    throw new ApiError(400, "Invalid updates!");
  }
  next();
};

const validateUpdatePasswordRequest = (req, res, next) => {
  const { oldPassword, newPassword } = req.body || {};

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new ApiError(400, "Please provide old and new passwords");
  }

  if (oldPassword === newPassword) {
    res.status(400);
    throw new ApiError(400, "New password must be different from old password");
  }
  next();
};

export {
  validateGetUserByIdRequest,
  validateUpdateProfileRequest,
  validateUpdatePasswordRequest,
};
