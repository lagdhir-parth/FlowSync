import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [tasks, projects, workspaces] = await Promise.all([
    Task.find({ createdBy: userId }).lean(),
    Project.find({ members: userId }).lean(),
    Workspace.find({ members: userId }).lean(),
  ]);

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in progress").length;
  const inReview = tasks.filter((t) => t.status === "review").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  const byPriority = {
    low: tasks.filter((t) => t.priority === "low").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    high: tasks.filter((t) => t.priority === "high").length,
  };

  // Tasks completed over last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentCompleted = tasks.filter(
    (t) => t.status === "done" && new Date(t.updatedAt) >= sevenDaysAgo,
  );

  const dailyCompleted = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = day.toISOString().split("T")[0];
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const count = recentCompleted.filter(
      (t) => new Date(t.updatedAt).toISOString().split("T")[0] === dayStr,
    ).length;
    dailyCompleted.push({ day: label, date: dayStr, count });
  }

  return res.status(200).json(
    new ApiResponse(200, "Dashboard stats fetched successfully", {
      totalTasks,
      statusBreakdown: { todo, inProgress, inReview, completed },
      byPriority,
      dailyCompleted,
      projectCount: projects.length,
      workspaceCount: workspaces.length,
    }),
  );
});

export { getDashboardStats };
