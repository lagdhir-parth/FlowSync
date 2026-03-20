import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import generateTokens from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: true, // REQUIRED for mobile
  sameSite: "None", // REQUIRED for mobile
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, gender, avatarUrl } = req.body || {};

  // check if patient already exists
  const userExists = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (userExists) {
    throw new ApiError(
      400,
      `User with this ${
        userExists.username === username.toLowerCase() ? "username" : "email"
      } already exists`,
    );
  }

  // create new patient
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email,
    password,
    gender,
    avatarUrl: avatarUrl || null,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401);
    throw new ApiError(401, "User not found");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401);
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        accessToken,
        refreshToken,
        loggedInUser,
      }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const loggedOutUser = await User.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    {
      new: true,
      runValidators: false,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully", loggedOutUser));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const decodedtoken = jwt.verify(
    incomingRefreshToken,
    env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedtoken?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    res.status(401);
    throw new ApiError(401, "Access Denied: Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken,
      }),
    );
});

const currentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    res.status(404);
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", user));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  if (!email) {
    throw new ApiError(400, "Google account does not have an email");
  }

  let user = await User.findOne({ email });

  if (!user) {
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");

    let uniqueUsername = username;
    let counter = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${username}_${counter}`;
      counter++;
    }

    user = await User.create({
      name: name || email.split("@")[0],
      username: uniqueUsername,
      email,
      avatarUrl: picture || null,
      authProvider: "google",
    });
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Google login successful", {
        accessToken,
        refreshToken,
        loggedInUser,
      }),
    );
});

export { registerUser, loginUser, googleLogin, logoutUser, refreshAccessToken, currentUser };
