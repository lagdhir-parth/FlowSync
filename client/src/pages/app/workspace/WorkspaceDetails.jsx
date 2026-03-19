import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiUser,
  FiArrowLeft,
  FiPlus,
} from "react-icons/fi";
import {
  fetchWorkspaceById,
  fetchProjectsByWorkspace,
  fetchWorkspaceMembers,
  fetchAllUsers,
} from "../../../api/dataApi";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../../ai/voiceAssistant";
import { useAuth } from "../../../context/AuthContext";
import EditMember from "../../../components/app/EditMember";

const statusColors = {
  active: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  completed: {
    bg: "bg-emerald-500/15",
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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditMembers, setShowEditMembers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const { user } = useAuth();

  const loadData = async () => {
    try {
      const [wsData, projData, memberData, allUsersData] = await Promise.all([
        fetchWorkspaceById(workspaceId),
        fetchProjectsByWorkspace(workspaceId),
        fetchWorkspaceMembers(workspaceId),
        fetchAllUsers(), // To get current user details for permission checks in EditMember
      ]);
      setWorkspace(wsData);
      setProjects(projData || []);
      setMembers(memberData || []);
      setAllUsers(allUsersData || []);
    } catch (err) {
      console.error("Failed to load workspace details:", err);
    } finally {
      setLoading(false);
    }
  };

  const isWorkspaceOwner =
    workspace?.owner?._id === user?._id || workspace?.owner === user?._id;

  useEffect(() => {
    loadData();

    sessionStorage.setItem(
      "flowsync.voiceContext",
      JSON.stringify({ workspaceId }),
    );

    const onVoiceCommand = (e) => {
      const action = e?.detail?.action?.action;
      if (["create_project", "create_workspace"].includes(action)) loadData();
    };

    window.addEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
    return () =>
      window.removeEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading workspace...
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Workspace not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/app/workspaces"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
      >
        <FiArrowLeft />
        All Workspaces
      </Link>

      {/* Workspace Header */}
      <div className="flex items-center gap-4">
        <div className="size-12 shrink-0 bg-linear-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          {workspace.name?.[0]?.toUpperCase() || "W"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">
            {workspace.name}
          </h1>
          <p className="text-sm text-gray-400">
            Owned by {workspace.owner?.name || workspace.owner?.email || "You"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div
          variants={item}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4"
        >
          <div className="text-indigo-400 text-2xl">
            <FiFolder />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Projects</p>
            <p className="text-white text-lg font-semibold">
              {projects.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="text-indigo-400 text-2xl">
              <FiUsers />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Members</p>
              <p className="text-white text-lg font-semibold">
                {members.length}
              </p>
            </div>
          </div>
          <div className="text-gray-400 text-sm cursor-pointer">
            {isWorkspaceOwner ? (
              <div
                className="flex justify-center items-center p-3 rounded-lg  hover:bg-gray-700 hover:text-gray-200 transition-colors duration-200"
                onClick={() => setShowEditMembers(true)}
              >
                <FiPlus className="size-6 text-gray-400 text-sm" />
              </div>
            ) : (
              ""
            )}
          </div>
          {showEditMembers && (
            <EditMember
              type="workspace"
              workspaceId={workspace._id}
              setMembers={setMembers}
              onClose={() => {
                setShowEditMembers(false);
              }}
            />
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4"
        >
          <div className="text-indigo-400 text-2xl">
            <FiUser />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Owner</p>
            <p className="text-white text-lg font-semibold truncate">
              {workspace.owner?.name || "You"}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Projects Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Projects</h2>

        {projects.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8 text-center">
            <FiFolder className="mx-auto text-3xl text-gray-600 mb-2" />
            <p className="text-gray-400">No projects in this workspace yet.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects.map((project) => {
              const colors =
                statusColors[project.status] || statusColors.archived;

              return (
                <motion.div key={project._id} variants={item}>
                  <Link
                    to={
                      project.members.some((member) => member._id === user._id)
                        ? `/app/projects/${project._id}`
                        : "#"
                    }
                    className="block group"
                  >
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 shrink-0 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {project.name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-indigo-300 transition-colors">
                            {project.name}
                          </h3>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${colors.bg}`}
                        >
                          <div
                            className={`size-1.5 rounded-full ${colors.dot}`}
                          />
                          <span className={colors.text}>{project.status}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {project.description || "No description"}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-gray-500" />
                          <span>{project.members?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiCheckSquare className="text-gray-500" />
                          <span>{project.tasks?.length || 0} tasks</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Members Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Members</h2>

        {members.length === 0 ? (
          <p className="text-gray-400 text-sm">No members.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member, idx) => (
              <div
                key={member._id || idx}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm"
              >
                <div className="size-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {member.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-gray-200">
                  {member.name || member.email}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetails;
