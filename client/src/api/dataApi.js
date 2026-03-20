import api from "./axios";

const buildMemberIdentifierPayload = (memberIdentifier) => {
  if (typeof memberIdentifier === "string") {
    return memberIdentifier.includes("@")
      ? { email: memberIdentifier }
      : { username: memberIdentifier };
  }

  if (memberIdentifier && typeof memberIdentifier === "object") {
    const payload = {};
    if (memberIdentifier.email) payload.email = memberIdentifier.email;
    if (memberIdentifier.username) payload.username = memberIdentifier.username;
    return payload;
  }

  return {};
};

// User APIs

const fetchAllUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data?.data; // Return the users data
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Project APIs

const createProject = async (workspaceId, projectData) => {
  try {
    const response = await api.post(
      `/projects/${workspaceId}/create`,
      projectData,
    );
    return response.data?.data; // Return the created project data
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

const fetchAllProjects = async () => {
  try {
    const response = await api.get("/projects/");
    return response.data?.data; // Return the projects data
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const fetchProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data?.data; // Return the project data
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw error;
  }
};

const fetchProjectMembers = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data?.data; // Return the project members data
  } catch (error) {
    console.error(
      `Error fetching members for project with ID ${projectId}:`,
      error,
    );
    throw error;
  }
};

const updateProject = async (projectId, updates) => {
  try {
    const response = await api.patch(`/projects/${projectId}`, updates);
    return response.data?.data; // Return the updated project data
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    throw error;
  }
};

const addMemberToProject = async (projectId, memberIdentifier) => {
  try {
    const response = await api.patch(
      `/projects/${projectId}/invite`,
      buildMemberIdentifierPayload(memberIdentifier),
    );
    return response.data?.data; // Return the updated project data
  } catch (error) {
    console.error(
      `Error adding member to project with ID ${projectId}:`,
      error,
    );
    throw error;
  }
};

const removeMemberFromProject = async (projectId, memberIdentifier) => {
  try {
    const response = await api.patch(
      `/projects/${projectId}/remove-member`,
      buildMemberIdentifierPayload(memberIdentifier),
    );
    return response.data?.data; // Return the updated project data
  } catch (error) {
    console.error(
      `Error removing member from project with ID ${projectId}:`,
      error,
    );
    throw error;
  }
};

const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data; // Return the response from the server
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw error;
  }
};

// Workspace APIs

const createWorkspace = async (workspaceData) => {
  try {
    const response = await api.post("/workspaces/", workspaceData);
    return response.data?.data; // Return the created workspace data
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }
};

const fetchAllWorkspaces = async () => {
  try {
    const response = await api.get("/workspaces/");
    return response.data?.data; // Return the workspaces data
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    throw error;
  }
};

const fetchWorkspaceById = async (workspaceId) => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data?.data; // Return the workspace data
  } catch (error) {
    console.error(`Error fetching workspace with ID ${workspaceId}:`, error);
    throw error;
  }
};

const fetchWorkspaceMembers = async (workspaceId) => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data?.data; // Return the workspace members data
  } catch (error) {
    console.error(
      `Error fetching members for workspace with ID ${workspaceId}:`,
      error,
    );
    throw error;
  }
};

const addMemberToWorkspace = async (workspaceId, memberIdentifier) => {
  try {
    const response = await api.patch(
      `/workspaces/${workspaceId}/invite`,
      buildMemberIdentifierPayload(memberIdentifier),
    );
    return response.data?.data; // Return the updated workspace data
  } catch (error) {
    console.error(
      `Error adding member to workspace with ID ${workspaceId}:`,
      error,
    );
    throw error;
  }
};

const removeMemberFromWorkspace = async (workspaceId, memberIdentifier) => {
  try {
    const response = await api.patch(
      `/workspaces/${workspaceId}/remove-member`,
      buildMemberIdentifierPayload(memberIdentifier),
    );
    return response.data?.data; // Return the updated workspace data
  } catch (error) {
    console.error(
      `Error removing member from workspace with ID ${workspaceId}:`,
      error,
    );
    throw error;
  }
};

const fetchProjectsByWorkspace = async (workspaceId) => {
  try {
    const response = await api.get(`/projects/${workspaceId}/all`);
    return response.data?.data;
  } catch (error) {
    console.error(
      `Error fetching projects for workspace ${workspaceId}:`,
      error,
    );
    throw error;
  }
};

const deleteWorkspace = async (workspaceId) => {
  try {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data; // Return the response from the server
  } catch (error) {
    console.error(`Error deleting workspace with ID ${workspaceId}:`, error);
    throw error;
  }
};

// Task APIs
const fetchAllTasks = async () => {
  try {
    const response = await api.get("/tasks/");
    return response.data?.data; // Return the tasks data
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

const fetchTasksByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data?.data; // Return the tasks data
  } catch (error) {
    console.error(
      `Error fetching tasks for project with ID ${projectId}:`,
      error,
    );
    throw error;
  }
};

const reorderTasks = async (projectId, tasks) => {
  try {
    const orderedTaskIds = tasks.map((task) =>
      typeof task === "string" ? task : task.id || task._id,
    );
    const response = await api.patch(`/tasks/${projectId}/reorder`, {
      orderedTaskIds,
    });
    console.log("Tasks reordered successfully");
    return response.data; // Return the response from the server
  } catch (error) {
    console.error("Error reordering tasks:", error);
    throw error;
  }
};

const updateTask = async (taskId, updates) => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, updates);
    return response.data?.data;
  } catch (error) {
    console.error(`Error updating task with ID ${taskId}:`, error);
    throw error;
  }
};

const deleteTask = async (projectId, taskId) => {
  try {
    const response = await api.delete(
      `/tasks/${projectId}/delete-task/${taskId}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}:`, error);
    throw error;
  }
};

// Dashboard Stats API
const fetchDashboardStats = async () => {
  try {
    const response = await api.get("/stats/dashboard");
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// User Profile APIs
const updateProfile = async (data) => {
  try {
    const response = await api.patch("/users/updateProfile", data);
    return response.data?.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const updatePassword = async (data) => {
  try {
    const response = await api.patch("/users/updatePassword", data);
    return response.data?.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

// Chatbot API
const sendChatMessage = async (message, history = [], context = {}) => {
  try {
    const response = await api.post("/chat", { message, history, context });
    return response.data?.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export {
  fetchAllUsers,
  fetchAllProjects,
  fetchProjectById,
  fetchProjectMembers,
  updateProject,
  addMemberToProject,
  removeMemberFromProject,
  deleteProject,
  fetchAllWorkspaces,
  fetchWorkspaceById,
  fetchWorkspaceMembers,
  fetchProjectsByWorkspace,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
  fetchAllTasks,
  fetchTasksByProjectId,
  reorderTasks,
  updateTask,
  deleteTask,
  deleteWorkspace,
  createProject,
  createWorkspace,
  fetchDashboardStats,
  updateProfile,
  updatePassword,
  sendChatMessage,
};
