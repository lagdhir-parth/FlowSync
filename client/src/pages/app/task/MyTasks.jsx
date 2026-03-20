import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiFlag,
  FiList,
  FiGrid,
  FiCheckSquare,
} from "react-icons/fi";
import { fetchAllTasks } from "../../../api/dataApi";
import { useAuth } from "../../../context/AuthContext";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../../ai/voiceAssistant";

const STATUS_ORDER = ["todo", "in progress", "review", "done"];

const statusColors = {
  todo: "text-rose-400 bg-rose-500/10 border-rose-400/30",
  "in progress": "text-amber-400 bg-amber-500/10 border-amber-400/30",
  review: "text-sky-400 bg-sky-500/10 border-sky-400/30",
  done: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30",
};

const priorityColors = {
  low: "text-emerald-300",
  medium: "text-amber-300",
  high: "text-rose-300",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const formatDate = (d) => {
  if (!d) return "—";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "kanban"

  const loadTasks = async () => {
    try {
      const data = await fetchAllTasks();
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const onVoiceCommand = (e) => {
      const action = e?.detail?.action?.intent;
      if (
        ["create_task", "update_task", "delete_task", "move_task"].includes(
          action,
        )
      ) {
        loadTasks();
      }
    };

    window.addEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
    return () =>
      window.removeEventListener(VOICE_COMMAND_EXECUTED_EVENT, onVoiceCommand);
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    STATUS_ORDER.forEach((s) => (groups[s] = []));
    tasks.forEach((t) => {
      if (groups[t.status]) groups[t.status].push(t);
    });
    return groups;
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading your tasks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to or
            created by you
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === "list"
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FiList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === "kanban"
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Board
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 gap-3">
          <FiCheckSquare className="text-4xl text-gray-600" />
          <p className="text-gray-400 text-lg">No tasks yet</p>
          <p className="text-gray-500 text-sm">
            Tasks assigned to you or created by you will appear here.
          </p>
        </div>
      ) : view === "list" ? (
        <ListView groups={grouped} />
      ) : (
        <KanbanView groups={grouped} />
      )}
    </div>
  );
};

/* ── List View ─────────────────────────────────────── */
const ListView = ({ groups }) => (
  <div className="space-y-6">
    {STATUS_ORDER.map((status) => {
      const tasks = groups[status];
      if (tasks.length === 0) return null;

      const colors = statusColors[status] || "";

      return (
        <div key={status}>
          {/* Status header */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize ${colors}`}
            >
              {status}
            </span>
            <span className="text-xs text-gray-500">{tasks.length}</span>
          </div>

          {/* Task rows */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                variants={item}
                className="flex items-center gap-4 px-4 py-3 bg-slate-800/40 border border-slate-700/40 rounded-lg hover:border-slate-600/60 transition-colors group"
              >
                {/* Task Name */}
                <span className="flex-1 text-sm font-medium text-gray-200 truncate">
                  {task.name}
                </span>

                {/* Project */}
                <span className="hidden sm:block text-xs text-gray-500 truncate max-w-[120px]">
                  {task.project?.name || "—"}
                </span>

                {/* Priority */}
                <span
                  className={`text-xs capitalize ${priorityColors[task.priority] || "text-gray-400"}`}
                >
                  <FiFlag className="inline mr-1" />
                  {task.priority || "—"}
                </span>

                {/* Deadline */}
                <span className="text-xs text-gray-500 hidden md:flex items-center gap-1">
                  <FiCalendar />
                  {formatDate(task.deadline)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      );
    })}
  </div>
);

/* ── Kanban View ───────────────────────────────────── */
const KanbanView = ({ groups }) => {
  const columnColors = {
    todo: "border-rose-400/50",
    "in progress": "border-amber-400/50",
    review: "border-sky-400/50",
    done: "border-emerald-400/50",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATUS_ORDER.map((status) => {
        const tasks = groups[status];
        const accent = columnColors[status] || "border-slate-700";

        return (
          <div
            key={status}
            className={`rounded-2xl border ${accent} bg-slate-900/70 shadow-[0_10px_30px_rgba(2,6,23,0.35)] p-4 min-h-[280px]`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-100 capitalize">
                {status}
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {tasks.length}
              </span>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  variants={item}
                  className="rounded-xl border border-slate-700/70 bg-slate-800/70 p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-100 leading-5 line-clamp-2">
                      {task.name}
                    </h3>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md border capitalize ${
                        {
                          low: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
                          medium:
                            "text-amber-300 border-amber-400/30 bg-amber-500/10",
                          high: "text-rose-300 border-rose-400/30 bg-rose-500/10",
                        }[task.priority] ||
                        "text-slate-300 border-slate-600 bg-slate-700/60"
                      }`}
                    >
                      {task.priority || "normal"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                    {task.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                    <span className="truncate max-w-[100px]">
                      {task.project?.name || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar />
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 italic">
                  No tasks
                </p>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default MyTasks;
