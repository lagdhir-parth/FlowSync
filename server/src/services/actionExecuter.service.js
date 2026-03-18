import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";

/**
 * Execute a parsed voice command action.
 * @param {object} action - Parsed action from AI (e.g. { action: "create_task", title: "..." })
 * @param {object} options - { actorId, context: { workspaceId, projectId } }
 * @returns {Promise<string>} - Human-readable result message
 */
export const executeAction = async (action, options = {}) => {
  const actorId = String(options.actorId || "");
  const context = options.context || {};

  console.log("[ActionExecutor]", { action, actorId, context });

  switch (action.action) {
    // ─── CREATE TASK ───
    case "create_task": {
      const taskName = action.title || action.name;
      const projectId = action.projectId || context.projectId;

      if (!taskName) return "Please provide a task name.";
      if (!projectId) return "Please open a project first so I can create a task in it.";

      const lastTask = await Task.findOne({ project: projectId })
        .sort("-order")
        .select("order");

      await Task.create({
        name: taskName,
        description: action.description || "",
        project: projectId,
        createdBy: actorId,
        status: action.status || "todo",
        priority: action.priority || "medium",
        order: lastTask ? lastTask.order + 1 : 0,
      });

      return `Task "${taskName}" created successfully.`;
    }

    // ─── UPDATE TASK ───
    case "update_task": {
      const name = action.name || action.title;
      const projectId = action.projectId || context.projectId;

      if (!name) return "Please provide the task name to update.";
      if (!projectId) return "Please open a project first.";

      const task = await Task.findOne({
        project: projectId,
        name: { $regex: new RegExp(name, "i") },
      });

      if (!task) return `Could not find a task named "${name}".`;

      const updates = action.updates || {};
      if (updates.name) task.name = updates.name;
      if (updates.description) task.description = updates.description;
      if (updates.priority) task.priority = updates.priority;
      if (updates.status) task.status = updates.status;

      await task.save();
      return `Task "${name}" updated successfully.`;
    }

    // ─── DELETE TASK ───
    case "delete_task": {
      const name = action.name || action.title;
      const projectId = action.projectId || context.projectId;

      if (!name) return "Please provide the task name to delete.";
      if (!projectId) return "Please open a project first.";

      const task = await Task.findOne({
        project: projectId,
        name: { $regex: new RegExp(name, "i") },
      });

      if (!task) return `Could not find a task named "${name}".`;

      await Task.findByIdAndDelete(task._id);
      return `Task "${name}" deleted successfully.`;
    }

    // ─── MOVE TASK (change status) ───
    case "move_task": {
      const name = action.name || action.title;
      const status = action.status;
      const projectId = action.projectId || context.projectId;

      if (!name) return "Please provide the task name to move.";
      if (!status) return "Please specify the status to move the task to.";
      if (!projectId) return "Please open a project first.";

      const validStatuses = ["todo", "in progress", "review", "done"];
      if (!validStatuses.includes(status)) {
        return `Invalid status "${status}". Use: ${validStatuses.join(", ")}.`;
      }

      const task = await Task.findOne({
        project: projectId,
        name: { $regex: new RegExp(name, "i") },
      });

      if (!task) return `Could not find a task named "${name}".`;

      task.status = status;
      await task.save();
      return `Task "${name}" moved to "${status}".`;
    }

    // ─── CREATE PROJECT ───
    case "create_project": {
      const projectName = action.name;
      const workspaceId = action.workspaceId || context.workspaceId;

      if (!projectName) return "Please provide a project name.";
      if (!workspaceId) return "Please open a workspace first so I can create a project in it.";

      await Project.create({
        name: projectName,
        description: action.description || "",
        projectManager: actorId,
        workspace: workspaceId,
        members: [actorId],
      });

      return `Project "${projectName}" created successfully.`;
    }

    // ─── CREATE WORKSPACE ───
    case "create_workspace": {
      const workspaceName = action.name;

      if (!workspaceName) return "Please provide a workspace name.";

      await Workspace.create({
        name: workspaceName,
        owner: actorId,
        members: [actorId],
      });

      return `Workspace "${workspaceName}" created successfully.`;
    }

    default:
      return `Sorry, I don't know how to handle the action "${action.action}".`;
  }
};
