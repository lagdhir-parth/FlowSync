import { openrouter } from "../config/openrouter.js";
import env from "../config/env.js";

const DEFAULT_MAX_OUTPUT_TOKENS = 700;
const MIN_MAX_OUTPUT_TOKENS = 100;

const getRequestedMaxTokens = () => {
  const parsed = Number(env.OPENROUTER_MAX_TOKENS);
  if (Number.isFinite(parsed) && parsed >= MIN_MAX_OUTPUT_TOKENS) {
    return Math.floor(parsed);
  }
  return DEFAULT_MAX_OUTPUT_TOKENS;
};

const getAffordableMaxTokensFromMessage = (message = "") => {
  const match = message.match(/can only afford\s+(\d+)/i);
  if (!match?.[1]) return null;

  const affordable = Number(match[1]);
  if (!Number.isFinite(affordable) || affordable < MIN_MAX_OUTPUT_TOKENS) {
    return null;
  }

  return Math.floor(affordable);
};

const requestCompletion = (payload) =>
  openrouter.post("/chat/completions", payload);
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

2. update_task — Update an existing task (rename, change description, priority, status, deadline)
   { "action": "update_task", "name": "<current task name to find>", "updates": { "name": "<new name>", "description": "<new desc>", "priority": "<low|medium|high>", "status": "<todo|in progress|review|done>", "deadline": "<ISO date>" } }

3. delete_task — Delete a task by name
   { "action": "delete_task", "name": "<task name to delete>" }

4. move_task — Move a task to a different status column
   { "action": "move_task", "name": "<task name>", "status": "<todo|in progress|review|done>" }

5. create_project — Create a new project
   { "action": "create_project", "name": "<project name>", "description": "<optional>" }

6. update_project — Update a project (rename, change description, status)
   { "action": "update_project", "name": "<current project name>", "updates": { "name": "<new name>", "description": "<new desc>", "status": "<active|completed|archived|on hold|dropped>" } }

7. create_workspace — Create a new workspace
   { "action": "create_workspace", "name": "<workspace name>" }

8. update_workspace — Rename a workspace
   { "action": "update_workspace", "name": "<current workspace name>", "updates": { "name": "<new name>" } }

9. list_tasks — List all tasks in the current project
   { "action": "list_tasks" }

10. list_projects — List all projects in the current workspace
    { "action": "list_projects" }

11. add_member — Add a member to project or workspace by email or username
  { "action": "add_member", "email": "<user email>", "username": "<optional username>", "target": "<optional: project|workspace>" }

12. remove_member — Remove a member from project or workspace by email or username
  { "action": "remove_member", "email": "<user email>", "username": "<optional username>", "target": "<optional: project|workspace>" }

13. show_summary — Show summary of current project or workspace
    { "action": "show_summary" }

Examples:
- "Create task named Build auth system" → { "action": "create_task", "title": "Build auth system" }
- "Move login task to done" → { "action": "move_task", "name": "login", "status": "done" }
- "Rename task old name to new name" → { "action": "update_task", "name": "old name", "updates": { "name": "new name" } }
- "Change priority of auth task to high" → { "action": "update_task", "name": "auth", "updates": { "priority": "high" } }
- "Set deadline of payment task to 2025-04-01" → { "action": "update_task", "name": "payment", "updates": { "deadline": "2025-04-01" } }
- "Delete the signup task" → { "action": "delete_task", "name": "signup" }
- "Create project Mobile App" → { "action": "create_project", "name": "Mobile App" }
- "Rename project Mobile App to Super App" → { "action": "update_project", "name": "Mobile App", "updates": { "name": "Super App" } }
- "Mark project as completed" → { "action": "update_project", "name": "", "updates": { "status": "completed" } }
- "Archive project Dashboard Redesign" → { "action": "update_project", "name": "Dashboard Redesign", "updates": { "status": "archived" } }
- "Create workspace Startup" → { "action": "create_workspace", "name": "Startup" }
- "Rename workspace Startup to My Startup" → { "action": "update_workspace", "name": "Startup", "updates": { "name": "My Startup" } }
- "Show my tasks" → { "action": "list_tasks" }
- "What tasks do I have?" → { "action": "list_tasks" }
- "List my projects" → { "action": "list_projects" }
- "Show all projects" → { "action": "list_projects" }
- "Add john@example.com to the project" → { "action": "add_member", "email": "john@example.com", "target": "project" }
- "Invite user alex_99 to workspace" → { "action": "add_member", "username": "alex_99", "target": "workspace" }
- "Remove test@mail.com from this project" → { "action": "remove_member", "email": "test@mail.com", "target": "project" }
- "Remove user alex_99 from workspace" → { "action": "remove_member", "username": "alex_99", "target": "workspace" }
- "Give me a summary" → { "action": "show_summary" }
- "What's the status?" → { "action": "show_summary" }

Return ONLY valid JSON. No explanation. No extra text.`;

/**
 * Send user command to OpenRouter and get structured action JSON.
 * @param {string} command - User's natural language command
 * @param {object} context - Current workspace/project context
 * @returns {Promise<object>} - Parsed action object
 */
export const parseCommand = async (command, context = {}) => {
  const userPrompt = `Context: ${JSON.stringify(context)}\nUser command: "${command}"`;
  const requestedMaxTokens = getRequestedMaxTokens();

  const basePayload = {
    model: "deepseek/deepseek-chat",
    temperature: 0,
    max_tokens: requestedMaxTokens,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  };

  let response;
  try {
    response = await requestCompletion(basePayload);
  } catch (error) {
    const providerMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;

    const affordableMaxTokens =
      getAffordableMaxTokensFromMessage(providerMessage);

    if (affordableMaxTokens && affordableMaxTokens < requestedMaxTokens) {
      try {
        response = await requestCompletion({
          ...basePayload,
          max_tokens: affordableMaxTokens,
        });
      } catch (retryError) {
        const retryProviderMessage =
          retryError?.response?.data?.error?.message ||
          retryError?.response?.data?.message ||
          retryError?.message;
        throw new Error(
          `AI parsing failed${retryProviderMessage ? `: ${retryProviderMessage}` : ""}`,
        );
      }
    }

    if (!response) {
      throw new Error(
        `AI parsing failed${providerMessage ? `: ${providerMessage}` : ""}`,
      );
    }
  }

  const content = response?.data?.choices?.[0]?.message?.content;
  const action = extractJson(content);

  if (!action?.action || typeof action.action !== "string") {
    throw new Error("AI response missing required 'action' field");
  }

  console.log("[AI Parser] Parsed action:", JSON.stringify(action));
  return action;
};
