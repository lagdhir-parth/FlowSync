import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";

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

  const findTask = (name, projectId) =>
    Task.findOne({
      project: projectId,
      name: {
        $regex: new RegExp(
          `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i",
        ),
      },
    });

  const resolveUserByIdentifier = async (email, username) => {
    const hasEmail = Boolean(email && String(email).trim());
    const hasUsername = Boolean(username && String(username).trim());

    if (!hasEmail && !hasUsername) {
      return null;
    }

    return User.findOne({
      $or: [
        ...(hasEmail ? [{ email: String(email).trim() }] : []),
        ...(hasUsername ? [{ username: String(username).trim() }] : []),
      ],
    });
  };

  switch (action.action) {
    // ─── CREATE TASK ───
    case "create_task": {
      const taskName = action.title || action.name;
      const projectId = action.projectId || context.projectId;

      if (!taskName) return "Please provide a task name.";
      if (!projectId)
        return "Please open a project first so I can create a task in it.";

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

      const task = await findTask(name, projectId);

      if (!task) return `Could not find a task named "${name}".`;

      const updates = action.updates || {};
      if (updates.name) task.name = updates.name;
      if (updates.description) task.description = updates.description;
      if (updates.priority) task.priority = updates.priority;
      if (updates.status) task.status = updates.status;
      if (updates.deadline) task.deadline = new Date(updates.deadline);
      if (updates.assignee) task.assignee = updates.assignee;

      await task.save();
      return `Task "${name}" updated successfully.`;
    }

    // ─── DELETE TASK ───
    case "delete_task": {
      const name = action.name || action.title;
      const projectId = action.projectId || context.projectId;

      if (!name) return "Please provide the task name to delete.";
      if (!projectId) return "Please open a project first.";

      const task = await findTask(name, projectId);

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

      const task = await findTask(name, projectId);

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
      if (!workspaceId)
        return "Please open a workspace first so I can create a project in it.";

      const project = await Project.create({
        name: projectName,
        description: action.description || "",
        projectManager: actorId,
        workspace: workspaceId,
        members: [actorId],
      });

      await Workspace.findByIdAndUpdate(workspaceId, {
        $addToSet: { projects: project._id },
      });

      return `Project "${projectName}" created successfully.`;
    }

    // ─── UPDATE PROJECT ───
    case "update_project": {
      const name = action.name;
      const projectId = action.projectId || context.projectId;
      const updates = action.updates || {};

      let project;
      if (name) {
        project = await Project.findOne({
          members: actorId,
          name: {
            $regex: new RegExp(
              `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
              "i",
            ),
          },
        });
      } else if (projectId) {
        project = await Project.findById(projectId);
      }

      if (!project)
        return `Could not find a project${name ? ` named "${name}"` : ""}.`;

      if (updates.name) project.name = updates.name;
      if (updates.description) project.description = updates.description;
      if (updates.status) project.status = updates.status;

      await project.save();
      return `Project "${project.name}" updated successfully.`;
    }

    // ─── CREATE WORKSPACE ───
    case "create_workspace": {
      const workspaceName = action.name;

      if (!workspaceName) return "Please provide a workspace name.";

      const workspace = await Workspace.create({
        name: workspaceName,
        owner: actorId,
        members: [actorId],
      });

      await User.findByIdAndUpdate(actorId, {
        $addToSet: { workspaces: workspace._id },
      });

      return `Workspace "${workspaceName}" created successfully.`;
    }

    // ─── UPDATE WORKSPACE ───
    case "update_workspace": {
      const name = action.name;
      const workspaceId = action.workspaceId || context.workspaceId;
      const updates = action.updates || {};

      let workspace;
      if (name) {
        workspace = await Workspace.findOne({
          members: actorId,
          name: {
            $regex: new RegExp(
              `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
              "i",
            ),
          },
        });
      } else if (workspaceId) {
        workspace = await Workspace.findById(workspaceId);
      }

      if (!workspace)
        return `Could not find a workspace${name ? ` named "${name}"` : ""}.`;

      if (!workspace.owner.equals(actorId)) {
        return "Only the workspace owner can update the workspace.";
      }

      if (updates.name) workspace.name = updates.name;
      await workspace.save();
      return `Workspace "${workspace.name}" updated successfully.`;
    }

    // ─── LIST TASKS ───
    case "list_tasks": {
      const projectId = action.projectId || context.projectId;

      if (!projectId) return "Please open a project first to see its tasks.";

      const tasks = await Task.find({ project: projectId })
        .sort("order")
        .select("name status priority")
        .lean();

      if (!tasks.length) return "No tasks found in this project.";

      const list = tasks
        .map((t, i) => `${i + 1}. ${t.name} (${t.status}, ${t.priority})`)
        .join("\n");
      return `Here are your tasks:\n${list}`;
    }

    // ─── LIST PROJECTS ───
    case "list_projects": {
      const workspaceId = action.workspaceId || context.workspaceId;

      let projects;
      if (workspaceId) {
        projects = await Project.find({ workspace: workspaceId })
          .select("name status")
          .lean();
      } else {
        projects = await Project.find({ members: actorId })
          .select("name status")
          .lean();
      }

      if (!projects.length) return "No projects found.";

      const list = projects
        .map((p, i) => `${i + 1}. ${p.name} (${p.status})`)
        .join("\n");
      return `Here are your projects:\n${list}`;
    }

    // ─── ADD MEMBER ───
    case "add_member": {
      const email = action.email;
      const username = action.username;
      const target = action.target;

      const projectId = action.projectId || context.projectId;
      const workspaceId = action.workspaceId || context.workspaceId;

      const userToAdd = await resolveUserByIdentifier(email, username);
      if (!userToAdd) {
        return "Please provide a valid username or email for the user to add.";
      }

      if (target === "workspace" || (!projectId && workspaceId)) {
        if (!workspaceId) return "Please open a workspace first.";

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return "Workspace not found.";

        if (!workspace.owner.equals(actorId)) {
          return "Only the workspace owner can add members to the workspace.";
        }

        await User.findByIdAndUpdate(userToAdd._id, {
          $addToSet: { workspaces: workspaceId },
        });

        if (workspace.members.some((m) => m.equals(userToAdd._id))) {
          return `${userToAdd.name} is already a member of this workspace.`;
        }

        await Workspace.findByIdAndUpdate(workspaceId, {
          $addToSet: { members: userToAdd._id },
        });

        return `${userToAdd.name} added to the workspace successfully.`;
      }

      if (!projectId) return "Please open a project first.";

      const project = await Project.findById(projectId);
      if (!project) return "Project not found.";

      if (!project.projectManager.equals(actorId)) {
        return "Only the project manager can add members to the project.";
      }

      if (project.members.some((m) => m.equals(userToAdd._id))) {
        return `${userToAdd.name} is already a member of this project.`;
      }

      const workspace = await Workspace.findById(project.workspace);
      if (
        !workspace ||
        !workspace.members.some((m) => m.equals(userToAdd._id))
      ) {
        return `${userToAdd.name} must be a member of the workspace first.`;
      }

      await Project.findByIdAndUpdate(projectId, {
        $addToSet: { members: userToAdd._id },
      });

      return `${userToAdd.name} added to the project successfully.`;
    }

    // ─── REMOVE MEMBER ───
    case "remove_member": {
      const email = action.email;
      const username = action.username;
      const target = action.target;

      const projectId = action.projectId || context.projectId;
      const workspaceId = action.workspaceId || context.workspaceId;

      const userToRemove = await resolveUserByIdentifier(email, username);
      if (!userToRemove) {
        return "Please provide a valid username or email for the user to remove.";
      }

      if (target === "workspace" || (!projectId && workspaceId)) {
        if (!workspaceId) return "Please open a workspace first.";

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return "Workspace not found.";

        if (!workspace.owner.equals(actorId)) {
          return "Only the workspace owner can remove members from the workspace.";
        }

        if (!workspace.members.some((m) => m.equals(userToRemove._id))) {
          return `${userToRemove.name} is not a member of this workspace.`;
        }

        await Project.updateMany(
          {
            workspace: workspace._id,
            members: userToRemove._id,
          },
          {
            $pull: { members: userToRemove._id },
          },
        );

        await Workspace.findByIdAndUpdate(workspaceId, {
          $pull: { members: userToRemove._id },
        });

        await User.findByIdAndUpdate(userToRemove._id, {
          $pull: { workspaces: workspaceId },
        });

        return `${userToRemove.name} removed from the workspace successfully.`;
      }

      if (!projectId) return "Please open a project first.";

      const project = await Project.findById(projectId);
      if (!project) return "Project not found.";

      if (!project.projectManager.equals(actorId)) {
        return "Only the project manager can remove members from the project.";
      }

      if (!project.members.some((m) => m.equals(userToRemove._id))) {
        return `${userToRemove.name} is not a member of this project.`;
      }

      await Project.findByIdAndUpdate(projectId, {
        $pull: { members: userToRemove._id },
      });

      return `${userToRemove.name} removed from the project successfully.`;
    }

    // ─── SHOW SUMMARY ───
    case "show_summary": {
      const projectId = action.projectId || context.projectId;
      const workspaceId = action.workspaceId || context.workspaceId;

      const parts = [];

      if (projectId) {
        const project = await Project.findById(projectId)
          .select("name status")
          .lean();
        const tasks = await Task.find({ project: projectId })
          .select("status")
          .lean();
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === "done").length;
        const inProg = tasks.filter((t) => t.status === "in progress").length;
        const todo = tasks.filter((t) => t.status === "todo").length;

        parts.push(
          `Project: ${project?.name || "Unknown"} (${project?.status || "unknown"})`,
          `Tasks: ${total} total — ${done} done, ${inProg} in progress, ${todo} to do`,
        );
      }

      if (workspaceId) {
        const workspace = await Workspace.findById(workspaceId)
          .select("name")
          .lean();
        const projCount = await Project.countDocuments({
          workspace: workspaceId,
        });
        parts.push(
          `Workspace: ${workspace?.name || "Unknown"}, ${projCount} project(s)`,
        );
      }

      if (!parts.length) {
        return "Open a project or workspace first to see a summary.";
      }

      return parts.join("\n");
    }

    default:
      return `Sorry, I don't know how to handle the action "${action.action}".`;
  }
};
