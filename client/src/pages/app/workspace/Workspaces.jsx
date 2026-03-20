import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiGrid, FiUsers, FiFolder, FiCalendar, FiPlus } from "react-icons/fi";
import { deleteWorkspace, fetchAllWorkspaces } from "../../../api/dataApi";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../../ai/voiceAssistant";
import { useAuth } from "../../../context/AuthContext";
import { TbTrash } from "react-icons/tb";
import AddWorkspaceForm from "../../../components/app/AddWorkspaceForm";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

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

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorkspaceForm, setShowAddWorkspaceForm] = useState(false);

  const { user } = useAuth();

  const loadWorkspaces = async () => {
    try {
      const data = await fetchAllWorkspaces();
      setWorkspaces(data || []);
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();

    const onVoiceCommand = (e) => {
      const action = e?.detail?.action?.intent;
      if (action === "create_workspace") loadWorkspaces();
    };

    window.addEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
    return () =>
      window.removeEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
  }, []);

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      await deleteWorkspace(workspaceId);
      setWorkspaces((prev) => prev.filter((ws) => ws._id !== workspaceId));
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  const handleOptimisticWorkspace = (newWorkspace, tempId = null) => {
    setWorkspaces((prev) => {
      // Replace temp with real
      if (tempId && newWorkspace) {
        return prev.map((ws) => (ws._id === tempId ? newWorkspace : ws));
      }

      // Rollback
      if (tempId && !newWorkspace) {
        return prev.filter((ws) => ws._id !== tempId);
      }

      // Add new
      if (newWorkspace) {
        return [newWorkspace, ...prev];
      }

      return prev;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading workspaces...
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FiGrid className="text-4xl text-gray-600" />
        <p className="text-gray-400 text-lg">No workspaces yet</p>
        <p className="text-gray-500 text-sm">
          Create your first workspace using the voice assistant.
        </p>
        <div className="text-sm my-1">
          <AddWorkspaceButton
            showAddWorkspaceForm={showAddWorkspaceForm}
            setShowAddWorkspaceForm={setShowAddWorkspaceForm}
            handleOptimisticWorkspace={handleOptimisticWorkspace}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-semibold text-gray-100">Workspaces</h1>
          <span className="text-sm text-gray-400">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
          </span>
        </div>
        <AddWorkspaceButton
          showAddWorkspaceForm={showAddWorkspaceForm}
          setShowAddWorkspaceForm={setShowAddWorkspaceForm}
          handleOptimisticWorkspace={handleOptimisticWorkspace}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {workspaces.map((ws) => (
          <motion.div key={ws._id} variants={item}>
            <Link to={`/app/workspaces/${ws._id}`} className="block group">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 shrink-0 bg-linear-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {ws.name?.[0]?.toUpperCase() || "W"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-100 truncate group-hover:text-indigo-300 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      Owned by {ws.owner?.name || ws.owner?.email || "You"}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="relative grid grid-cols-2 md:grid-cols-3 items-center gap-4 text-xs text-gray-500 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-1.5">
                    <FiUsers className="text-gray-500" />
                    <span>{ws.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiFolder className="text-gray-500" />
                    <span>{ws.projects?.length || 0} projects</span>
                  </div>
                  {ws.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-gray-500" />
                      <span>{formatDate(ws.createdAt)}</span>
                    </div>
                  )}
                  {ws.owner?._id === user._id && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteWorkspace(ws._id);
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
        ))}
      </motion.div>
    </div>
  );
};

const AddWorkspaceButton = ({
  showAddWorkspaceForm,
  setShowAddWorkspaceForm,
  handleOptimisticWorkspace,
}) => (
  <div>
    <button
      onClick={() => setShowAddWorkspaceForm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-gray-100 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer"
    >
      <FiPlus className="inline-block mr-1" />
      New Workspace
    </button>
    {showAddWorkspaceForm && (
      <AddWorkspaceForm
        setShowAddWorkspaceForm={setShowAddWorkspaceForm}
        onWorkspaceCreate={handleOptimisticWorkspace}
      />
    )}
  </div>
);

export default Workspaces;
