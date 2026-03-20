import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../../api/dataApi";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaRobot } from "react-icons/fa6";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setError("");
    const newMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    
    try {
      const res = await sendChatMessage(input.trim(), newMessages);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: res?.reply || "Sorry, I didn't get that.",
        },
      ]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="relative flex items-end justify-end">
      {/* Floating Chat Button */}
      <button
        className={`h-14 w-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${open ? "ring-2 ring-indigo-400" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close ChatBot" : "Open ChatBot"}
        aria-expanded={open}
        aria-controls="chatbot-panel"
      >
        <IoChatbubbleEllipsesOutline className="mx-auto h-6 w-6" />
      </button>

      {/* Chat Window */}
      {open && (
        <div
          id="chatbot-panel"
          className="absolute bottom-16 right-0 z-50 h-120 w-90 max-w-[90vw] rounded-2xl border border-[#263149] bg-[#10172A] shadow-2xl animate-fade-in flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2535] bg-[#24293d] rounded-t-2xl">
            <FaRobot className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-lg text-indigo-400">
              AI Assistant
            </span>
            <button
              className="text-gray-400 hover:text-indigo-400 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close ChatBot"
            >
              <IoMdClose className="size-5" />
            </button>
          </div>
          <div className="flex-1 bg-indigo-700/10 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-line shadow-md
                    ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-[#181F36] text-indigo-200 rounded-bl-sm border border-indigo-900"
                    }
                  `}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {error && (
            <div className="px-4 py-2 text-xs text-red-400 bg-[#1a1f2e] border-t border-[#1E2535]">
              {error}
            </div>
          )}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-4 py-3 border-t border-[#1E2535] bg-[#151A2B] rounded-b-2xl"
          >
            <input
              type="text"
              className="flex-1 glass-input rounded-lg px-3 py-2 bg-transparent text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-60"
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
