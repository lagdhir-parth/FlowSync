import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";
import generateAccessTokenAndRefreshToken from "../utils/generateTokens.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    res.status(401);
    throw new ApiError(401, "Access Denied: No refresh token provided");
  }

  const decodedtoken = jwt.verify(
    incomingRefreshToken,
    env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedtoken?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    res.status(401);
    throw new ApiError(401, "Access Denied: Invalid refresh token");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken,
      })
    );
});

export default refreshAccessToken;
