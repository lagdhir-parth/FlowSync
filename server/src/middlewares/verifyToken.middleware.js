import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import env from "../config/env.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401);
    throw new ApiError(
      401,
      "Access Denied: Unauthorized access, No Token Provided"
    );
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const { _id } = decoded || {};

    const user = await User.findById(_id).select("-password -refreshToken");

    if (!user) {
      res.status(401);
      throw new ApiError(401, "Access Denied: Invalid Token");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new ApiError(401, "Access Denied: Invalid Token");
  }
});

export default verifyToken;
