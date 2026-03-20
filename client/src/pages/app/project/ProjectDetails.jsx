import React, { Suspense, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchProjectById, fetchTasksByProjectId } from "../../../api/dataApi";
import { FiArrowLeft, FiEdit } from "react-icons/fi";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../../ai/voiceAssistant";

import KanbanBoard from "../../../components/kanban/KanbanBoard.jsx";
import UpdateProjectForm from "../../../components/app/UpdateProjectForm.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

const ProjectOverview = React.lazy(() => import("./ProjectOverview.jsx"));
const ProjectList = React.lazy(() => import("../project/ProjectList.jsx"));

const getEntityId = (entity) =>
  typeof entity === "object" ? entity?._id || entity?.id : entity;

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showUpdateProjectForm, setShowUpdateProjectForm] = useState(false);

  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "overview";

  const { user } = useAuth();
  const isProjectManager =
    getEntityId(project?.projectManager) === getEntityId(user);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const [projectData, taskData] = await Promise.all([
          fetchProjectById(projectId),
          fetchTasksByProjectId(projectId),
        ]);

        setProject(projectData);
        setTasks(taskData || []);

        const workspaceId =
          typeof projectData?.workspace === "object"
            ? projectData.workspace?._id
            : projectData?.workspace;

        sessionStorage.setItem(
          "flowsync.voiceContext",
          JSON.stringify({
            projectId,
            workspaceId: workspaceId || "",
          }),
        );
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  useEffect(() => {
    const refreshProjectData = async () => {
      try {
        const [projectData, taskData] = await Promise.all([
          fetchProjectById(projectId),
          fetchTasksByProjectId(projectId),
        ]);

        setProject(projectData);
        setTasks(taskData || []);
      } catch (error) {
        console.error("Error refreshing project details:", error);
      }
    };

    const onVoiceCommandExecuted = (event) => {
      const detail = event?.detail || {};
      const action = detail?.action || {};
      const context = detail?.context || {};

      if (context?.projectId !== projectId) {
        return;
      }

      const shouldRefreshProjectTasks = [
        "create_task",
        "update_task",
        "delete_task",
        "move_task",
      ].includes(action?.intent);

      if (!shouldRefreshProjectTasks) {
        return;
      }

      refreshProjectData();
    };

    window.addEventListener(
      VOICE_COMMAND_EXECUTED_EVENT,
      onVoiceCommandExecuted,
    );
    return () => {
      window.removeEventListener(
        VOICE_COMMAND_EXECUTED_EVENT,
        onVoiceCommandExecuted,
      );
    };
  }, [projectId]);

  const statusStyles = {
    active: {
      bg: "bg-green-500/15",
      dot: "bg-green-400",
      text: "text-green-400",
    },
    completed: {
      bg: "bg-emerald-500/15",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    },
    archived: {
      bg: "bg-gray-500/15",
      dot: "bg-gray-400",
      text: "text-gray-400",
    },
    "on hold": {
      bg: "bg-yellow-500/15",
      dot: "bg-yellow-400",
      text: "text-yellow-400",
    },
    dropped: {
      bg: "bg-red-500/15",
      dot: "bg-red-400",
      text: "text-red-400",
    },
  };

  const navLinks = [
    { name: "Overview", path: `/app/projects/${projectId}?view=overview` },
    { name: "List", path: `/app/projects/${projectId}?view=list` },
    { name: "Board", path: `/app/projects/${projectId}?view=board` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
        >
          <FiArrowLeft />
          All Projects
        </Link>
      </div>

      {/* Workspace breadcrumb */}
      <div className="text-xs text-gray-500 tracking-wide">
        {project?.workspace?.name || "Loading workspace..."}
      </div>

      {/* Project Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Project Avatar */}
          <div className="size-9 shrink-0 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
            {project?.name?.[0] || "P"}
          </div>

          <div>
            {/* Project Name */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">
                {project?.name || "Loading project..."}
              </h1>

              {/* Status Badge */}
              <div
                className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
                  statusStyles[project?.status]?.bg || statusStyles.archived.bg
                }`}
              >
                <div
                  className={`size-2 rounded-full ${
                    statusStyles[project?.status]?.dot ||
                    statusStyles.archived.dot
                  }`}
                />

                <span
                  className={
                    statusStyles[project?.status]?.text ||
                    statusStyles.archived.text
                  }
                >
                  {project?.status || "unknown"}
                </span>
              </div>
            </div>

            {/* Description */}
            {project?.description && (
              <p className="mt-1 text-sm text-gray-400 max-w-lg line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {isProjectManager && (
          <button
            onClick={() => setShowUpdateProjectForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 transition rounded-md text-white"
          >
            <FiEdit size={14} />
            Edit Project
          </button>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateProjectForm && (
        <UpdateProjectForm
          project={project}
          setShowUpdateProjectForm={setShowUpdateProjectForm}
          onUpdated={(updatedProject) => setProject(updatedProject)}
        />
      )}

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-6 border-b border-slate-700">
        {navLinks.map(({ name, path }) => {
          const isActive = view === name.toLowerCase();

          return (
            <Link
              key={name}
              to={path}
              className={`relative text-sm pb-3 transition-colors duration-200 ${
                isActive
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {name}

              {isActive && (
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* View Container */}
      <div className="min-h-[70vh]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40 text-gray-400">
              Loading view...
            </div>
          }
        >
          {view === "overview" && (
            <ProjectOverview project={project} tasks={tasks} />
          )}

          {view === "list" && (
            <ProjectList
              project={project}
              setProject={setProject}
              tasks={tasks}
              onTasksChange={setTasks}
            />
          )}

          {view === "board" && (
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default ProjectDetails;
