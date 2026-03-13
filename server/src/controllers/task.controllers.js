import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    projectId,
    assigneeId,
    priority,
    status,
    deadline,
  } = req.body;

  const lastTask = await Task.findOne({ project: projectId })
    .sort("-order")
    .select("order");

  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignee: assigneeId,
    priority,
    status,
    deadline,
    order,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Task created successfully", task));
});

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId })
    .populate("assignee", "name email")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks retrieved successfully", tasks));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId)
    .populate("assignee", "name email")
    .lean();
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project._id);
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task retrieved successfully", task));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
    new: true,
  })
    .populate("assignee", "name email")
    .populate("project", "name")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully", updatedTask));
});

const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new ApiError(404, "Task not found");
  }

  // Validate user access to the project
  const project = await Project.findById(task.project);
  if (!project.members.some((member) => member.equals(userId))) {
    res.status(403);
    throw new ApiError(403, "You do not have access to this task");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      $addToSet: {
        comments: {
          text,
          author: userId,
        },
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment added successfully", updatedTask));
});

const removeComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;

  // Remove the comment
  await Task.findByIdAndUpdate(taskId, {
    $pull: { comments: { _id: commentId } },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment removed successfully"));
});

const reorderTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { orderedTaskIds } = req.body; // ['id_C', 'id_A', 'id_B']

  // Update order of tasks
  const bulkOps = orderedTaskIds.map((taskId, index) => ({
    updateOne: {
      filter: { _id: taskId, project: projectId },
      update: { order: index },
    },
  }));
  await Task.bulkWrite(bulkOps);

  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks reordered successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId, projectId } = req.params;

  await Task.findByIdAndDelete(taskId);

  // Reorder remaining tasks in the project
  const tasks = await Task.find({ project: projectId }).sort("order");
  const bulkOps = tasks.map((task, index) => ({
    updateOne: {
      filter: { _id: task._id, project: projectId },
      update: { order: index },
    },
  }));
  await Task.bulkWrite(bulkOps);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully"));
});

export {
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  removeComment,
  reorderTasks,
};
