import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiFolder,
  FiUsers,
  FiCheckSquare,
  FiCalendar,
  FiPlus,
} from "react-icons/fi";
import { deleteProject, fetchAllProjects } from "../../../api/dataApi";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../../ai/voiceAssistant";
import { TbTrash } from "react-icons/tb";
import { useAuth } from "../../../context/AuthContext";
import AddProjectForm from "../../../components/app/AddProjectForm";

const getEntityId = (entity) =>
  typeof entity === "object" ? entity?._id || entity?.id : entity;

const statusColors = {
  active: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  completed: {
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  archived: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-400" },
  "on hold": {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  dropped: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);

  const { user } = useAuth();

  const loadProjects = async () => {
    try {
      const data = await fetchAllProjects();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const onVoiceCommand = (e) => {
      const action = e?.detail?.action?.intent;
      if (action === "create_project") loadProjects();
    };

    window.addEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
    return () =>
      window.removeEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      console.log("Project deleted succesfully");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleOptimisticProject = (newProject, tempId = null) => {
    setProjects((prev) => {
      // Replace temp with real
      if (tempId && newProject) {
        return prev.map((p) => (p._id === tempId ? newProject : p));
      }

      // Rollback
      if (tempId && !newProject) {
        return prev.filter((p) => p._id !== tempId);
      }

      // Add new
      if (newProject) {
        return [newProject, ...prev];
      }

      return prev;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FiFolder className="text-4xl text-gray-600" />
        <p className="text-gray-400 text-lg">No projects yet</p>
        <p className="text-gray-500 text-sm">
          Create your first project using the voice assistant or from a
          workspace.
        </p>
        <div className="text-sm my-1">
          <AddProjectButton
            showAddProjectForm={showAddProjectForm}
            setShowAddProjectForm={setShowAddProjectForm}
            handleOptimisticProject={handleOptimisticProject}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-semibold text-gray-100">Projects</h1>
          <span className="text-sm text-gray-400">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
        <AddProjectButton
          showAddProjectForm={showAddProjectForm}
          setShowAddProjectForm={setShowAddProjectForm}
          handleOptimisticProject={handleOptimisticProject}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {projects.map((project) => {
          const colors = statusColors[project.status] || statusColors.archived;

          return (
            <motion.div key={project._id} variants={item}>
              <Link to={`/app/projects/${project._id}`} className="block group">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/5 group">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 shrink-0 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {project.name?.[0]?.toUpperCase() || "P"}
                      </div>
                      <h3 className="text-base font-semibold text-gray-100 truncate group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${colors.bg}`}
                    >
                      <div className={`size-1.5 rounded-full ${colors.dot}`} />
                      <span className={colors.text}>{project.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-10">
                    {project.description || "No description"}
                  </p>

                  {/* Footer Stats */}
                  <div className="relative flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="text-gray-500" />
                      <span>{project.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCheckSquare className="text-gray-500" />
                      <span>{project.tasks?.length || 0} tasks</span>
                    </div>
                    <div>
                      {project.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-gray-500" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      )}
                    </div>
                    {getEntityId(project?.projectManager) ===
                      getEntityId(user) && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project._id);
                        }}
                        className="absolute bottom-0 right-0 text-slate-500 hover:text-rose-400  rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <TbTrash className="size-4" />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

const AddProjectButton = ({
  showAddProjectForm,
  setShowAddProjectForm,
  handleOptimisticProject,
}) => (
  <div>
    <button
      onClick={() => setShowAddProjectForm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-gray-100 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer"
    >
      <FiPlus />
      New Project
    </button>

    {showAddProjectForm && (
      <AddProjectForm
        setShowAddProjectForm={setShowAddProjectForm}
        onProjectCreate={handleOptimisticProject}
      />
    )}
  </div>
);

export default Projects;
