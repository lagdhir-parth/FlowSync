import axios from "axios";
import env from "../config/env.js";

const SARVAM_TTS_URL =
  process.env.SARVAM_TTS_URL || "https://api.sarvam.ai/text-to-speech";

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
    data?.detail ||
    data?.error?.message ||
    data?.error ||
    data ||
    error?.message ||
    "Unknown provider error"
  );
};

const extractSuggestedSpeaker = (errorText) => {
  if (!errorText || typeof errorText !== "string") {
    return "";
  }

  const match = errorText.match(/Available speakers are:\s*(.+)$/i);
  if (!match?.[1]) {
    return "";
  }

  const first = match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0];

  return first || "";
};

/**
 * Convert text to speech using Sarvam TTS API.
 * @param {string} text - Text to convert to speech
 * @returns {Promise<{audio: Buffer, contentType: string}>}
 */
export const generateSpeech = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required for TTS");
  }

  const runTts = (speaker) =>
    axios.post(
      SARVAM_TTS_URL,
      {
        text,
        target_language_code: "en-IN",
        speaker,
        model: process.env.SARVAM_TTS_MODEL || "bulbul:v2",
      },
      {
        timeout: 30_000,
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": env.SARVAM_API_KEY,
          Authorization: `Bearer ${env.SARVAM_API_KEY}`,
          Accept: "application/json, audio/wav, audio/mpeg, audio/*",
        },
      },
    );

  const primarySpeaker = process.env.SARVAM_TTS_SPEAKER || "anushka";

  let response;
  let lastError;
  try {
    response = await runTts(primarySpeaker);
  } catch (error) {
    lastError = error;
  }

  if (!response) {
    const firstErrorText = toReadableText(extractProviderError(lastError));
    const suggestedSpeaker = extractSuggestedSpeaker(firstErrorText);

    if (suggestedSpeaker && suggestedSpeaker !== primarySpeaker) {
      try {
        response = await runTts(suggestedSpeaker);
      } catch (retryError) {
        lastError = retryError;
      }
    }
  }

  if (!response) {
    const providerMessage = toReadableText(extractProviderError(lastError));

    const ttsError = new Error(
      `TTS failed${providerMessage ? `: ${providerMessage}` : ""}`,
    );

    // Preserve upstream metadata for controller logging.
    ttsError.status = lastError?.response?.status;
    ttsError.response = lastError?.response;

    throw ttsError;
  }

  // Sarvam TTS returns JSON with base64 audio
  const audioBase64 =
    response.data?.audios?.[0] ||
    response.data?.audio ||
    response.data?.audioBase64 ||
    response.data?.audio_base64 ||
    response.data?.data?.audio ||
    "";

  if (!audioBase64) {
    throw new Error("Sarvam TTS did not return audio data");
  }

  const audioBuffer = Buffer.from(audioBase64, "base64");

  console.log("[TTS] Generated audio:", audioBuffer.length, "bytes");
  return {
    audio: audioBuffer,
    contentType: "audio/wav",
  };
};
