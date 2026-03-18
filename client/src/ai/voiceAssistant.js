const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const VOICE_COMMAND_EXECUTED_EVENT = "flowsync:voice-command-executed";

/**
 * Convert a Blob to base64 string (without the data URL prefix).
 */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Failed to encode audio"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read audio file"));
    reader.readAsDataURL(blob);
  });

/**
 * Play an audio buffer in the browser.
 * @param {ArrayBuffer} arrayBuffer - Raw audio data
 * @param {string} contentType - MIME type of the audio
 */
export const playAudioResponse = (arrayBuffer, contentType) => {
  const blob = new Blob([arrayBuffer], { type: contentType || "audio/wav" });
  const url = URL.createObjectURL(blob);
  const player = new Audio(url);
  player.play();
  player.onended = () => URL.revokeObjectURL(url);
};

/**
 * Send recorded audio to the backend voice assistant endpoint.
 * @param {Blob} audioBlob - Recorded audio blob
 * @param {object} context - { workspaceId, projectId }
 * @returns {Promise<{ transcript: string }>}
 */
export const sendVoiceCommand = async (audioBlob, context = {}) => {
  if (!audioBlob) {
    throw new Error("No audio captured");
  }

  const audioBase64 = await blobToBase64(audioBlob);

  const response = await fetch(`${API_BASE_URL}/api/ai/voice-command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      audioBase64,
      mimeType: audioBlob.type || "audio/webm",
      context,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Voice assistant request failed");
  }

  const transcript = response.headers.get("x-voice-command") || "";
  const encodedAction = response.headers.get("x-voice-action") || "";
  const contentType = response.headers.get("content-type") || "";

  let action = null;
  if (encodedAction) {
    try {
      action = JSON.parse(decodeURIComponent(encodedAction));
    } catch {
      action = null;
    }
  }

  // If backend returned audio, play it
  if (contentType.includes("audio")) {
    const audioBuffer = await response.arrayBuffer();
    playAudioResponse(audioBuffer, contentType);
  }

  return { transcript, action, context };
};
