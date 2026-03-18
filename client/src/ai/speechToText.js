import { env, pipeline } from "@xenova/transformers";

// In Vite dev/prod SPA hosting, local model path resolution can return index.html.
// Force remote model loading from Hugging Face to avoid JSON parse errors.
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = false;
env.remoteHost = "https://huggingface.co";
env.remotePathTemplate = "{model}/resolve/{revision}/";

// Ensure ONNX runtime wasm assets are loaded from CDN instead of local app paths.
env.backends.onnx.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/";

let transcriber;
let transcriberLoader;

const TARGET_SAMPLE_RATE = 16_000;
const STT_MODEL = import.meta.env.VITE_STT_MODEL || "Xenova/whisper-tiny.en";
const STT_INFERENCE_TIMEOUT_MS = Number(
  import.meta.env.VITE_STT_TIMEOUT_MS || 25_000,
);

const MIN_RECORDING_SECONDS = 0.35;
const MIN_RMS_THRESHOLD = 0.0025;

const analyzeSignal = (audioData) => {
  let peakAbs = 0;
  let sumSquares = 0;

  for (let i = 0; i < audioData.length; i += 1) {
    const sample = audioData[i];
    const abs = Math.abs(sample);

    if (abs > peakAbs) {
      peakAbs = abs;
    }

    sumSquares += sample * sample;
  }

  const rms = audioData.length ? Math.sqrt(sumSquares / audioData.length) : 0;

  return {
    samples: audioData.length,
    durationSec: Number((audioData.length / TARGET_SAMPLE_RATE).toFixed(2)),
    peakAbs: Number(peakAbs.toFixed(4)),
    rms: Number(rms.toFixed(4)),
  };
};

const extractTranscript = (result) => {
  const fromText = result?.text?.trim();
  if (fromText) {
    return fromText;
  }

  if (Array.isArray(result?.chunks)) {
    const merged = result.chunks
      .map((chunk) => chunk?.text?.trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    if (merged) {
      return merged;
    }
  }

  return "";
};

const isUnclearTranscript = (value) => {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  // Some ASR models emit placeholder tags when speech cannot be resolved.
  const unclearPatterns = [
    "[inaudible]",
    "(inaudible)",
    "inaudible",
    "[unintelligible]",
    "(unintelligible)",
    "unintelligible",
    "[noise]",
    "(noise)",
    "[silence]",
    "(silence)",
  ];

  return unclearPatterns.includes(normalized);
};

const withTimeout = async (promise, timeoutMs, timeoutMessage) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const decodeBlobToFloat32Mono = async (audioBlob) => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new window.AudioContext();

  try {
    const decodedBuffer = await audioContext.decodeAudioData(
      arrayBuffer.slice(0),
    );

    // Whisper expects raw PCM-like float audio; resample to 16k mono.
    const offlineContext = new window.OfflineAudioContext(
      1,
      Math.ceil(decodedBuffer.duration * TARGET_SAMPLE_RATE),
      TARGET_SAMPLE_RATE,
    );

    const source = offlineContext.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const rendered = await offlineContext.startRendering();
    const channelData = rendered.getChannelData(0);

    return new Float32Array(channelData);
  } finally {
    await audioContext.close();
  }
};

const getAudioDebugInfo = async (audioBlob) => {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new window.AudioContext();
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    await audioContext.close();

    return {
      durationSec: Number(decoded.duration.toFixed(2)),
      sampleRate: decoded.sampleRate,
      channels: decoded.numberOfChannels,
      byteLength: arrayBuffer.byteLength,
    };
  } catch (error) {
    return {
      decodeFailed: true,
      message: error?.message,
      byteLength: audioBlob.size,
    };
  }
};

export const loadSTT = async () => {
  if (transcriber) {
    console.log("[STT] using cached transcriber");
    return transcriber;
  }

  if (!transcriberLoader) {
    console.log("[STT] loading whisper model", { model: STT_MODEL });
    transcriberLoader = pipeline("automatic-speech-recognition", STT_MODEL)
      .then((instance) => {
        transcriber = instance;
        console.log("[STT] transcriber loaded successfully");
        return transcriber;
      })
      .catch((error) => {
        transcriberLoader = null;
        console.error("[STT] failed to load transcriber:", {
          message: error?.message,
          stack: error?.stack,
          hint: "Model asset request may be returning HTML instead of JSON.",
        });
        throw error;
      });
  }

  return transcriberLoader;
};

export const speechToText = async (audioBlob) => {
  if (!audioBlob) {
    throw new Error("No audio received for transcription");
  }

  const audioInfo = await getAudioDebugInfo(audioBlob);

  console.log("[STT] transcribing audio", {
    size: audioBlob.size,
    type: audioBlob.type,
    audioInfo,
  });

  let stt;
  try {
    stt = await loadSTT();
  } catch (error) {
    throw new Error(
      `[STT_LOAD_FAILED] ${error?.message || "Failed to load STT model"}`,
    );
  }

  let audioInput;
  try {
    audioInput = await decodeBlobToFloat32Mono(audioBlob);
  } catch (error) {
    throw new Error(
      `[STT_AUDIO_PREP_FAILED] ${error?.message || "Failed to decode microphone audio"}`,
    );
  }

  const signal = analyzeSignal(audioInput);
  console.log("[STT] prepared audio signal", signal);

  if (signal.durationSec < MIN_RECORDING_SECONDS) {
    throw new Error(
      "[STT_AUDIO_TOO_SHORT] Recording was too short. Hold the button longer before releasing.",
    );
  }

  if (signal.rms < MIN_RMS_THRESHOLD) {
    throw new Error(
      "[STT_AUDIO_TOO_QUIET] Audio level is too low. Please speak louder or move closer to the mic.",
    );
  }

  let result;
  const inferenceStart = performance.now();
  console.log("[STT] inference start", {
    timeoutMs: STT_INFERENCE_TIMEOUT_MS,
    model: STT_MODEL,
  });

  try {
    result = await withTimeout(
      stt(audioInput, {
        task: "transcribe",
        return_timestamps: false,
        chunk_length_s: 12,
        stride_length_s: 2,
      }),
      STT_INFERENCE_TIMEOUT_MS,
      `[STT_TIMEOUT] Transcription exceeded ${STT_INFERENCE_TIMEOUT_MS}ms`,
    );
  } catch (error) {
    throw new Error(
      `[STT_INFERENCE_FAILED] ${error?.message || "Failed to transcribe audio"}`,
    );
  }

  console.log("[STT] inference completed", {
    elapsedMs: Number((performance.now() - inferenceStart).toFixed(0)),
  });

  let transcript = extractTranscript(result);

  if (!transcript) {
    try {
      const retryResult = await withTimeout(
        stt(audioInput, {
          task: "transcribe",
          return_timestamps: false,
          chunk_length_s: 8,
          stride_length_s: 1,
        }),
        STT_INFERENCE_TIMEOUT_MS,
        `[STT_TIMEOUT] Retry transcription exceeded ${STT_INFERENCE_TIMEOUT_MS}ms`,
      );
      transcript = extractTranscript(retryResult);
      result = retryResult;
    } catch {
      // Keep original empty transcript behavior below.
    }
  }

  if (!transcript) {
    console.warn("[STT] empty transcription result", {
      signal,
      rawResult: result,
    });
    throw new Error(
      "Could not transcribe audio. Please try speaking clearly in a quieter room.",
    );
  }

  if (isUnclearTranscript(transcript)) {
    console.warn("[STT] unclear transcription placeholder detected", {
      transcript,
      signal,
      rawResult: result,
    });
    throw new Error(
      "Could not clearly understand the command. Please speak slower and closer to the microphone.",
    );
  }

  console.log("[STT] transcription result:", transcript);

  return transcript;
};
