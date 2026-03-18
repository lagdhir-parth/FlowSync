import { transcribeAudio } from "../services/stt.service.js";
import { parseCommand } from "../services/aiParser.service.js";
import { executeAction } from "../services/actionExecuter.service.js";
import { generateSpeech } from "../services/tts.service.js";

/**
 * Process a voice command end-to-end:
 * Audio → STT → AI Parse → Execute → TTS → Audio Response
 */
export const processVoiceCommand = async (req, res) => {
  try {
    const actorId = req.user?._id;
    const { audioBase64, mimeType, context } = req.body || {};

    if (!actorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!audioBase64) {
      return res.status(400).json({ message: "Audio data is required" });
    }

    // Step 1: Speech to Text
    const transcript = await transcribeAudio(
      audioBase64,
      mimeType || "audio/webm",
    );

    // Step 2: Parse command with AI
    const action = await parseCommand(transcript, context);

    // Step 3: Execute the action
    const message = await executeAction(action, { actorId, context });

    // Step 4: Convert response to speech
    const { audio, contentType } = await generateSpeech(message);

    // Step 5: Send audio response
    res.set("Content-Type", contentType);
    res.set("X-Voice-Command", transcript);
    res.set("X-Voice-Action", encodeURIComponent(JSON.stringify(action)));
    return res.send(audio);
  } catch (error) {
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    console.error("[AI] processVoiceCommand failed:", {
      message: error?.message,
      status,
      responseData,
      stack: error?.stack,
    });

    if (status === 400) {
      return res.status(500).json({
        message:
          responseData?.message ||
          responseData?.error ||
          "Voice provider rejected request. Check audio format and provider configuration.",
      });
    }

    return res.status(500).json({
      message: error?.message || "Voice assistant failed",
    });
  }
};
