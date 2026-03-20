import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { chatWithAI } from "../services/chatbot.service.js";

const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body || {};
  const userId = req.user?._id;

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400);
    throw new ApiError(
      400,
      "Message is required and must be a non-empty string",
    );
  }

  const reply = await chatWithAI(message.trim(), history || [], userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Chat response generated", { reply }));
});

export { chat };
