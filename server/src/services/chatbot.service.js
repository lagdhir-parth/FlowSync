import { openrouter } from "../config/openrouter.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

const SYSTEM_PROMPT = `You are FlowSync AI — a friendly productivity coach integrated into a project management app.

Your role:
- Help users plan tasks, organize projects, and boost productivity.
- Answer project-related and productivity questions clearly and concisely.
- When asked to suggest tasks, provide structured, actionable steps.
- If the user provides context about their tasks/projects, reference it naturally.
- Keep responses brief but helpful. Use markdown formatting (bullets, bold) for clarity.
- Do NOT execute actions — only suggest and advise. The voice assistant handles actions.
- Remove any AI disclaimers and focus on being a helpful assistant.
- Always maintain a friendly and encouraging tone, even when providing constructive feedback.
- If you don't know the answer, say "I'm not sure, but I'm here to help you figure it out!" instead of making something up.
- Remove extra spaces and newlines from your responses. Be concise and to the point.

Be conversational, professional, and encouraging.`;

/**
 * Build context string from user's data.
 */
const buildContextString = async (userId) => {
  try {
    const [tasks, projects] = await Promise.all([
      Task.find({ createdBy: userId })
        .select("name status priority")
        .lean()
        .limit(30),
      Project.find({ members: userId }).select("name status").lean().limit(10),
    ]);

    const parts = [];
    if (projects.length) {
      parts.push(
        `Projects: ${projects.map((p) => `${p.name} (${p.status})`).join(", ")}`,
      );
    }
    if (tasks.length) {
      const grouped = {
        todo: tasks.filter((t) => t.status === "todo").map((t) => t.name),
        "in progress": tasks
          .filter((t) => t.status === "in progress")
          .map((t) => t.name),
        done: tasks.filter((t) => t.status === "done").map((t) => t.name),
      };
      parts.push(
        `Tasks — To Do: ${grouped.todo.join(", ") || "none"}, In Progress: ${grouped["in progress"].join(", ") || "none"}, Done: ${grouped.done.length} completed`,
      );
    }
    return parts.length ? `\n\nUser's current data:\n${parts.join("\n")}` : "";
  } catch {
    return "";
  }
};

/**
 * Chat with the AI assistant.
 * @param {string} message - User message
 * @param {Array} history - Previous messages [{ role, content }]
 * @param {string} userId - Current user ID for context
 * @returns {Promise<string>} AI response text
 */
export const chatWithAI = async (message, history = [], userId = null) => {
  let contextStr = "";
  if (userId) {
    contextStr = await buildContextString(userId);
  }

  const systemContent = SYSTEM_PROMPT + contextStr;

  const messages = [
    { role: "system", content: systemContent },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  const response = await openrouter.post("/chat/completions", {
    model: "deepseek/deepseek-chat",
    temperature: 0.7,
    max_tokens: 500,
    messages,
  });

  const content = response?.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");

  return content.trim();
};
