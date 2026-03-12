import ApiError from "../utils/apiError.js";

const validateRegistrationRequest = (req, res, next) => {
  const { name, username, email, password, gender } = req.body || {};

  const requiredFields = [name, username, email, password, gender];

  if (requiredFields.some((field) => !field || field.trim() === "")) {
    res.status(400);
    throw new ApiError(400, "Please provide all required fields");
  }

  if (!["Male", "Female", "Other"].includes(gender)) {
    res.status(400);
    throw new ApiError(400, "Invalid gender value");
  }
  next();
};

const validateLoginRequest = (req, res, next) => {
  const { username, password } = req.body || {};

  // validate data
  if (!username || !password) {
    res.status(400);
    throw new ApiError(400, "Username and password are required");
  }
  next();
};

const validateRefreshAccessTokenRequest = (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    res.status(401);
    throw new ApiError(401, "Access Denied: No refresh token provided");
  }
  next();
};

export {
  validateRegistrationRequest,
  validateLoginRequest,
  validateRefreshAccessTokenRequest,
};
