import {
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
} from "../controllers/task.controllers.js";
import {
  createProject,
  updateProject,
  getProjectsByWorkspace,
  getAllProjects,
  inviteMembers,
  removeMember,
} from "../controllers/project.controllers.js";
import {
  createWorkspace,
  updateWorkspace,
} from "../controllers/workspace.controllers.js";

import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";

/**
 * Execute a parsed voice command action by routing it through
 * the actual Express controllers seamlessly.
 * @param {object} parsedData - Parsed action from AI { intent: "...", entities: {...} }
 * @param {object} options - { actorId, context: { workspaceId, projectId } }
 * @returns {Promise<string>} - Human-readable result message for TTS
 */
export const executeAction = async (parsedData, options = {}) => {
  const { intent, entities = {} } = parsedData;
  const actorId = String(options.actorId || "");
  const context = options.context || {};

  console.log("[ActionExecutor]", { intent, entities, actorId, context });

  // ─── Controller Wrapper Setup ───
  const callController = (controller, req) => {
    return new Promise((resolve, reject) => {
      const res = {
        statusCode: 200,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          if (this.statusCode >= 400) {
             return reject(data);
          }
          resolve(data);
          return this;
        },
      };
      
      const next = (err) => {
        if (err) reject(err);
      };
      
      try {
        controller(req, res, next);
      } catch (err) {
        reject(err);
      }
    });
  };

  // ─── Helpers ───
  const resolveTaskDbId = async (nameSnippet, projectId) => {
    if (!nameSnippet) return null;
    const task = await Task.findOne({
      project: projectId,
      name: { $regex: new RegExp(`\\b${nameSnippet.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "i") },
    });
    return task?._id;
  };

  const resolveProjectDbId = async (nameSnippet, workspaceId, userId) => {
    if (!nameSnippet) return null;
    const project = await Project.findOne({
      members: userId,
      ...(workspaceId ? { workspace: workspaceId } : {}),
      name: { $regex: new RegExp(`\\b${nameSnippet.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "i") },
    });
    return project?._id;
  };

  const resolveWorkspaceDbId = async (nameSnippet, userId) => {
    if (!nameSnippet) return null;
    const workspace = await Workspace.findOne({
      members: userId,
      name: { $regex: new RegExp(`\\b${nameSnippet.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "i") },
    });
    return workspace?._id;
  };

  const resolveUserByIdentifier = async (email, username) => {
    if (!email && !username) return null;
    return User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : []),
      ],
    });
  };

  // ─── Execution Routine ───
  try {
    const req = {
      user: { _id: actorId },
      body: {},
      params: {},
      query: {},
    };

    switch (intent) {
      // ─── TASKS ───
      case "create_task": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first to create a task.");
        req.body = {
          title: entities.name || entities.title,
          description: entities.description,
          status: entities.status || "todo",
          priority: entities.priority || "medium",
          projectId,
        };
        const response = await callController(createTask, req);
        return response.message || `Task created.`;
      }
      
      case "update_task": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first.");
        const taskId = entities.taskId || await resolveTaskDbId(entities.name || entities.title, projectId);
        if (!taskId) throw new Error(`Could not find task "${entities.name || entities.title}".`);
        req.params.taskId = taskId;
        req.body = entities.updates || {};
        const response = await callController(updateTask, req);
        return response.message || `Task updated.`;
      }
      
      case "delete_task": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first.");
        const taskId = entities.taskId || await resolveTaskDbId(entities.name || entities.title, projectId);
        if (!taskId) throw new Error(`Could not find task "${entities.name || entities.title}".`);
        req.params.taskId = taskId;
        req.params.projectId = projectId;
        const response = await callController(deleteTask, req);
        return response.message || `Task deleted.`;
      }
      
      case "move_task": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first.");
        const taskId = entities.taskId || await resolveTaskDbId(entities.name || entities.title, projectId);
        if (!taskId) throw new Error(`Could not find task "${entities.name || entities.title}".`);
        req.params.taskId = taskId;
        req.body = { status: entities.status };
        const response = await callController(updateTask, req);
        return `Task moved to ${entities.status}.`;
      }

      // ─── PROJECTS ───
      case "create_project": {
        const workspaceId = entities.workspaceId || context.workspaceId;
        if (!workspaceId) throw new Error("Please open a workspace first.");
        req.params.workspaceId = workspaceId;
        req.body = {
          name: entities.name,
          description: entities.description,
        };
        const response = await callController(createProject, req);
        return response.message || `Project created.`;
      }
      
      case "update_project": {
        const workspaceId = entities.workspaceId || context.workspaceId;
        const projectId = entities.projectId || context.projectId || await resolveProjectDbId(entities.name, workspaceId, actorId);
        if (!projectId) throw new Error(`Could not find project "${entities.name}".`);
        req.params.projectId = projectId;
        req.body = entities.updates || {};
        const response = await callController(updateProject, req);
        return response.message || `Project updated.`;
      }

      // ─── WORKSPACES ───
      case "create_workspace": {
        req.body = { name: entities.name };
        const response = await callController(createWorkspace, req);
        return response.message || `Workspace created.`;
      }
      
      case "update_workspace": {
        const workspaceId = entities.workspaceId || context.workspaceId || await resolveWorkspaceDbId(entities.name, actorId);
        if (!workspaceId) throw new Error(`Could not find workspace "${entities.name}".`);
        req.params.workspaceId = workspaceId;
        req.body = entities.updates || {};
        const response = await callController(updateWorkspace, req);
        return response.message || `Workspace updated.`;
      }

      // ─── LISTING ───
      case "list_tasks": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first.");
        req.params.projectId = projectId;
        const response = await callController(getTasksByProject, req);
        const tasks = response.data || [];
        if (!tasks.length) return "No tasks found.";
        return `You have ${tasks.length} tasks: ` + tasks.map(t => t.name).join(", ");
      }
      
      case "list_projects": {
        const workspaceId = entities.workspaceId || context.workspaceId;
        if (workspaceId) {
          req.params.workspaceId = workspaceId;
          const response = await callController(getProjectsByWorkspace, req);
          const projects = response.data || [];
          if (!projects.length) return "No projects found in this workspace.";
          return `You have ${projects.length} projects in this workspace: ` + projects.map(p => p.name).join(", ");
        } else {
          const response = await callController(getAllProjects, req);
          const projects = response.data || [];
          if (!projects.length) return "No projects found.";
          return `You have ${projects.length} projects total.`;
        }
      }

      // ─── MEMBER MANAGEMENT ───
      case "assign_member": {
        const projectId = entities.projectId || context.projectId;
        if (!projectId) throw new Error("Please open a project first.");
        const taskId = entities.taskId || await resolveTaskDbId(entities.name || entities.title, projectId);
        if (!taskId) throw new Error(`Could not find task "${entities.name || entities.title}".`);
        
        const targetUser = await resolveUserByIdentifier(entities.email, entities.username);
        if (!targetUser) throw new Error("Could not find user to assign.");

        req.params.taskId = taskId;
        req.body = { assignee: targetUser._id };
        const response = await callController(updateTask, req);
        return `Assigned to ${targetUser.name || entities.username}.`;
      }
      
      case "add_member": {
        const target = entities.target;
        const projectContext = entities.projectId || context.projectId;
        const workspaceContext = entities.workspaceId || context.workspaceId;

        if (target === "workspace" || (!projectContext && workspaceContext)) {
          throw new Error("I cannot add members to the workspace via voice yet. Please use the UI.");
        }

        if (!projectContext) throw new Error("Please open a project first.");
        req.params.projectId = projectContext;
        req.body = { email: entities.email, username: entities.username };
        const response = await callController(inviteMembers, req);
        return response.message || "Member invited.";
      }
      
      case "remove_member": {
        const target = entities.target;
        const projectContext = entities.projectId || context.projectId;
        const workspaceContext = entities.workspaceId || context.workspaceId;

        if (target === "workspace" || (!projectContext && workspaceContext)) {
          throw new Error("I cannot remove members from the workspace via voice yet. Please use the UI.");
        }

        if (!projectContext) throw new Error("Please open a project first.");
        req.params.projectId = projectContext;
        req.body = { email: entities.email, username: entities.username };
        const response = await callController(removeMember, req);
        return response.message || "Member removed.";
      }

      // ─── SUMMARY ───
      case "show_summary": {
        const projectId = entities.projectId || context.projectId;
        if (projectId) {
          req.params.projectId = projectId;
          const tasksResponse = await callController(getTasksByProject, req);
          const tasks = tasksResponse.data || [];
          const done = tasks.filter((t) => t.status === "done").length;
          const todo = tasks.filter((t) => t.status === "todo").length;
          return `Project has ${tasks.length} tasks. ${done} done, ${todo} to do.`;
        }
        return "Open a project to see a summary.";
      }

      default:
        return `Sorry, I don't know how to handle the intent "${intent}".`;
    }
  } catch (error) {
    const errorMsg = error?.message || error?.data?.message || error?.error || JSON.stringify(error);
    return `Error: ${errorMsg}`;
  }
};
