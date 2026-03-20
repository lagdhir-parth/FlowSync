import { openrouter } from "../config/openrouter.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

const SYSTEM_PROMPT = `You are a Senior Productivity Coach and AI Assistant for "FlowSync", a task management application.

🧠 CORE BEHAVIORS & RULES:
1. Help users plan tasks, organize projects, and boost productivity.
2. Provide step-by-step, actionable plans. If asked to break down a project, structure the response clearly with bullet points.
3. DOMAIN KNOWLEDGE: FlowSync handles Workspaces > Projects > Tasks. Tasks have status (\`todo\`, \`in progress\`, \`review\`, \`done\`), priorities (\`low\`, \`medium\`, \`high\`). Use this exact terminology.
4. FALLBACK & CLARIFICATION: If a request is vague or you don't know the answer, explicitly ask clarifying questions. NEVER hallucinate tasks or data you cannot see in the context string.
5. FORMATTING: Use markdown (lists, bold text) generously. When dealing with complex logic or multiple steps, use structured lists. Return JSON blocks if explicitly requested by the user. Do not include unnecessary conversational filler. Use concise formatting.
6. NO ACTIONS: You are a chatbot. You CANNOT execute actions (e.g., creating tasks, adding members). Inform the user they can use the Voice Assistant for performing actions.

Maintain a professional, highly intelligent, and encouraging tone. Always speak as an expert systems thinker.`;

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
    return parts.length ? `\n\n[CONTEXT: USER DATA]\n${parts.join("\n")}` : "";
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

  // Short term memory: retain last 15 interactions for context
  const messages = [
    { role: "system", content: systemContent },
    ...history.slice(-15),
    { role: "user", content: message },
  ];

  const response = await openrouter.post("/chat/completions", {
    model: "deepseek/deepseek-chat",
    temperature: 0.3, // Lower temp for more structured, factual outputs
    max_tokens: 800, // Token optimized but enough for step-by-step plans
    messages,
  });

  const content = response?.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");

  return content.trim();
};
