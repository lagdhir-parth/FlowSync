import { openrouter } from "../config/openrouter.js";
/**
 * Try to extract a JSON object from the AI response text.
 * Handles raw JSON, markdown code fences, or embedded JSON.
 */
const extractJson = (raw) => {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI returned empty response");
  }

  const cleaned = raw.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // fallback below
  }

  // Try extracting from markdown code fence
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }

  // Try extracting first JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }

  throw new Error("Could not extract JSON from AI response");
};

const SYSTEM_PROMPT = `You are an AI assistant for a task management app called FlowSync.

Your job is to convert natural language commands into structured JSON actions.

Allowed actions and their JSON formats:

1. create_task — Create a new task
   { "action": "create_task", "title": "<task name>", "description": "<optional>", "status": "<optional: todo|in progress|review|done>", "priority": "<optional: low|medium|high>" }

2. update_task — Update an existing task (rename, change description, priority, etc.)
   { "action": "update_task", "name": "<current task name to find>", "updates": { "name": "<new name>", "description": "<new desc>", "priority": "<low|medium|high>" } }

3. delete_task — Delete a task by name
   { "action": "delete_task", "name": "<task name to delete>" }

4. move_task — Move a task to a different status column
   { "action": "move_task", "name": "<task name>", "status": "<todo|in progress|review|done>" }

5. create_project — Create a new project
   { "action": "create_project", "name": "<project name>", "description": "<optional>" }

6. create_workspace — Create a new workspace
   { "action": "create_workspace", "name": "<workspace name>" }

Examples:
- "Create task named Build auth system" → { "action": "create_task", "title": "Build auth system" }
- "Move login task to done" → { "action": "move_task", "name": "login", "status": "done" }
- "Rename task old name to new name" → { "action": "update_task", "name": "old name", "updates": { "name": "new name" } }
- "Delete the signup task" → { "action": "delete_task", "name": "signup" }
- "Create project Mobile App" → { "action": "create_project", "name": "Mobile App" }
- "Create workspace Startup" → { "action": "create_workspace", "name": "Startup" }

Return ONLY valid JSON. No explanation. No extra text.`;

/**
 * Send user command to OpenRouter and get structured action JSON.
 * @param {string} command - User's natural language command
 * @param {object} context - Current workspace/project context
 * @returns {Promise<object>} - Parsed action object
 */
export const parseCommand = async (command, context = {}) => {
  const userPrompt = `Context: ${JSON.stringify(context)}\nUser command: "${command}"`;

  let response;
  try {
    response = await openrouter.post("/chat/completions", {
      model: "deepseek/deepseek-chat",
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;
    throw new Error(
      `AI parsing failed${providerMessage ? `: ${providerMessage}` : ""}`,
    );
  }

  const content = response?.data?.choices?.[0]?.message?.content;
  const action = extractJson(content);

  if (!action?.action || typeof action.action !== "string") {
    throw new Error("AI response missing required 'action' field");
  }

  console.log("[AI Parser] Parsed action:", JSON.stringify(action));
  return action;
};
