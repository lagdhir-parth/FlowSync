import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  sendVoiceCommand,
  VOICE_COMMAND_EXECUTED_EVENT,
} from "../ai/voiceAssistant";

const VoiceAssistant = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | recording | processing
  const [transcript, setTranscript] = useState("");
  const [ttsText, setTtsText] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const getCurrentContext = () => {
    const path = location.pathname || "";
    const segments = path.split("/").filter(Boolean);
    const context = {};

    const projectIndex = segments.indexOf("projects");
    if (projectIndex >= 0 && segments[projectIndex + 1]) {
      context.projectId = segments[projectIndex + 1];
    }

    const workspaceIndex = segments.indexOf("workspaces");
    if (workspaceIndex >= 0 && segments[workspaceIndex + 1]) {
      context.workspaceId = segments[workspaceIndex + 1];
    }

    try {
      const saved = JSON.parse(
        sessionStorage.getItem("flowsync.voiceContext") || "{}",
      );

      if (!context.projectId && saved?.projectId) {
        context.projectId = saved.projectId;
      }

      if (!context.workspaceId && saved?.workspaceId) {
        context.workspaceId = saved.workspaceId;
      }
    } catch {
      // Ignore malformed session context and continue with route-only context.
    }

    return context;
  };

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setTtsText("");

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("Microphone not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data?.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setStatus("processing");
        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          const context = getCurrentContext();
          const result = await sendVoiceCommand(blob, context);

          window.dispatchEvent(
            new CustomEvent(VOICE_COMMAND_EXECUTED_EVENT, {
              detail: {
                transcript: result?.transcript || "",
                action: result?.action || null,
                ttsText: result?.ttsText || "",
                context,
              },
            }),
          );

          setTranscript(result.transcript || "Command executed");
          setTtsText(result?.ttsText || "");
        } catch (err) {
          setError(err.message || "Voice assistant failed");
        } finally {
          setStatus("idle");
          stopStream();
        }
      };

      recorder.start();
      setStatus("recording");
    } catch (err) {
      setError(err.message || "Cannot access microphone");
      stopStream();
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    }
    setOpen((prev) => !prev);
  };

  const isRecording = status === "recording";
  const isProcessing = status === "processing";
  const statusLabel = isProcessing
    ? "Processing"
    : isRecording
      ? "Listening"
      : "Ready";

  return (
    <div className="relative flex items-end justify-end">
      {open && (
        <div
          id="voice-assistant-panel"
          className="mb-3 w-[min(92vw,26rem)] rounded-2xl border border-[#263149] bg-[#0F172A]/95 p-4 shadow-2xl backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">
              Voice Assistant
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isProcessing
                  ? "bg-amber-500/20 text-amber-300"
                  : isRecording
                    ? "bg-red-500/20 text-red-300"
                    : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
              isRecording
                ? "bg-red-600 hover:bg-red-500"
                : "bg-indigo-600 hover:bg-indigo-500"
            } ${isProcessing ? "bg-slate-500 hover:bg-slate-500" : ""}`}
          >
            {isRecording
              ? "⏹ Stop Recording"
              : isProcessing
                ? "⏳ Processing..."
                : "🎤 Start Recording"}
          </button>

          {transcript && (
            <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <p className="text-xs font-medium text-emerald-300">Recognized</p>
              <p className="mt-1 text-sm text-emerald-200">"{transcript}"</p>
            </div>
          )}

          {ttsText && (
            <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2">
              <p className="text-xs font-medium text-sky-300">Assistant Said</p>
              <p className="mt-1 text-sm text-sky-200">{ttsText}</p>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-sm text-red-300">❌ {error}</p>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className={`h-14 w-14 rounded-full border border-[#2D3A56] text-white shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          open
            ? "bg-[#1F2A44] hover:bg-[#24314F]"
            : "bg-indigo-600 hover:bg-indigo-500"
        }`}
        aria-label={open ? "Close Voice Assistant" : "Open Voice Assistant"}
        aria-expanded={open}
        aria-controls="voice-assistant-panel"
      >
        {open ? "✕" : "🎤"}
      </button>
    </div>
  );
};

export default VoiceAssistant;
