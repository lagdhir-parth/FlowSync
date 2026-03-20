import axios from "axios";
import env from "../config/env.js";

const SARVAM_STT_URL =
  env.SARVAM_STT_URL || "https://api.sarvam.ai/speech-to-text";

const createHeaders = () => ({
  "api-subscription-key": env.SARVAM_API_KEY,
  Authorization: `Bearer ${env.SARVAM_API_KEY}`,
});

const toReadableText = (value) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const extractProviderError = (error) => {
  const data = error?.response?.data;

  return (
    data?.message ||
    data?.error?.message ||
    data?.error ||
    data ||
    error?.message ||
    "Unknown provider error"
  );
};

const pickTranscript = (payload) => {
  const candidates = [
    payload?.transcript,
    payload?.text,
    payload?.data?.transcript,
    payload?.data?.text,
    payload?.results?.[0]?.transcript,
    payload?.result?.transcript,
  ];

  const transcript = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return transcript ? transcript.trim() : "";
};

const normalizeMimeType = (value) => {
  if (!value || typeof value !== "string") {
    return "audio/webm";
  }

  const baseType = value.split(";")[0]?.trim().toLowerCase();
  return baseType || "audio/webm";
};

const inferExtension = (mimeType) => {
  if (mimeType.includes("wav")) {
    return "wav";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) {
    return "mp3";
  }

  if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
    return "m4a";
  }

  return "webm";
};

const extractSuggestedModel = (errorText) => {
  if (!errorText || typeof errorText !== "string") {
    return "";
  }

  const match = errorText.match(/Please use '([^']+)' instead\.?/i);
  return match?.[1] || "";
};

/**
 * Convert audio to text using Sarvam STT API.
 * @param {string} audioBase64 - Base64 encoded audio
 * @param {string} mimeType - Audio MIME type (e.g. "audio/webm")
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudio = async (audioBase64, mimeType = "audio/webm") => {
  if (!audioBase64) {
    throw new Error("Audio data is required for transcription");
  }

  const normalizedMimeType = normalizeMimeType(mimeType);
  const audioBuffer = Buffer.from(audioBase64, "base64");
  const extension = inferExtension(normalizedMimeType);
  const fileName = `voice-input.${extension}`;

  const runStt = async (modelName) => {
    const form = new FormData();
    form.append(
      "file",
      new Blob([audioBuffer], { type: normalizedMimeType }),
      fileName,
    );
    form.append("model", modelName);
    form.append("language_code", env.SARVAM_STT_LANG || "en-IN");

    return axios.post(SARVAM_STT_URL, form, {
      timeout: 30_000,
      headers: {
        ...createHeaders(),
      },
    });
  };

  const primaryModel = env.SARVAM_STT_MODEL || "saarika:v2.5";

  let lastError;
  try {
    const response = await runStt(primaryModel);

    const transcript = pickTranscript(response?.data);
    if (!transcript) {
      throw new Error("Sarvam STT returned empty transcription");
    }

    console.log("[STT] Transcript:", transcript);
    return transcript;
  } catch (error) {
    lastError = error;
  }

  const firstErrorText = toReadableText(extractProviderError(lastError));
  const suggestedModel = extractSuggestedModel(firstErrorText);
  if (suggestedModel && suggestedModel !== primaryModel) {
    try {
      const retryResponse = await runStt(suggestedModel);
      const retryTranscript = pickTranscript(retryResponse?.data);
      if (!retryTranscript) {
        throw new Error("Sarvam STT returned empty transcription");
      }

      console.log("[STT] Transcript:", retryTranscript);
      return retryTranscript;
    } catch (retryError) {
      lastError = retryError;
    }
  }

  const providerMessage = toReadableText(extractProviderError(lastError));

  const sttError = new Error(
    `STT failed${providerMessage ? `: ${providerMessage}` : ""}`,
  );

  // Keep upstream metadata for centralized controller logging.
  sttError.status = lastError?.response?.status;
  sttError.response = lastError?.response;

  throw sttError;
};
