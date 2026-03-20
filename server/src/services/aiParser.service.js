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

Your job is to convert natural language commands into structured JSON matching this EXACT schema:
{
  "intent": "<intent_name>",
  "entities": {
    "name": "<optional name snippet>",
    "title": "<optional title snippet>",
    "taskId": "<optional>",
    "projectId": "<optional>",
    "workspaceId": "<optional>",
    "username": "<optional>",
    "email": "<optional>",
    "status": "<optional: todo|in progress|review|done>",
    "priority": "<optional: low|medium|high>",
    "deadline": "<optional ISO date>",
    "updates": { } // used for update_task, update_project, update_workspace
  }
}

Allowed intents:
1. "create_task" (entities: name/title, description, status, priority)
2. "update_task" (entities: name/title to find, updates: { name, description, priority, status, deadline, assignee })
3. "delete_task" (entities: name/title)
4. "move_task" (entities: name/title, status)
5. "create_project" (entities: name, description)
6. "update_project" (entities: name to find, updates: { name, description, status })
7. "create_workspace" (entities: name)
8. "update_workspace" (entities: name to find, updates: { name })
9. "list_tasks" (no entities needed)
10. "list_projects" (no entities needed)
11. "add_member" (entities: email, username, target (project|workspace))
12. "remove_member" (entities: email, username, target (project|workspace))
13. "assign_member" (entities: name/title of task, username, email - assigning a task to someone)
14. "show_summary" (no entities needed)

Return ONLY valid JSON. No explanation. No extra text.

Examples:
- "Create task named Build auth system" → { "intent": "create_task", "entities": { "name": "Build auth system" } }
- "Move login task to done" → { "intent": "move_task", "entities": { "name": "login", "status": "done" } }
- "Rename task old name to new name" → { "intent": "update_task", "entities": { "name": "old name", "updates": { "name": "new name" } } }
- "Assign login task to john" → { "intent": "assign_member", "entities": { "name": "login task", "username": "john" } }
- "Add john@example.com to the project" → { "intent": "add_member", "entities": { "email": "john@example.com", "target": "project" } }
- "What tasks do I have?" → { "intent": "list_tasks", "entities": {} }`;

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
  const parsed = extractJson(content);

  // Auto-correct older or malformed outputs to match { intent, entities }
  let finalData = parsed;
  if (!parsed?.intent || typeof parsed.intent !== "string") {
    if (parsed?.action) {
      finalData = {
        intent: parsed.action,
        entities: { ...parsed },
      };
      delete finalData.entities.action;
    } else {
      throw new Error("AI response missing required 'intent' field");
    }
  }

  if (!finalData.entities) {
    finalData.entities = {};
  }

  console.log("[AI Parser] Parsed intent module:", JSON.stringify(finalData));
  return finalData;
};
