import { useState } from "react";
import { motion } from "framer-motion";
import {
  TbLayoutKanban,
  TbList,
  TbChartLine,
  TbDotsVertical,
  TbPlus,
  TbSearch,
} from "react-icons/tb";
import { HiOutlineChip } from "react-icons/hi";

const COLUMNS = [
  {
    id: "backlog",
    label: "Backlog",
    color: "#6B7280",
    dot: "bg-[#6B7280]",
    count: 3,
    tasks: [
      {
        title: "API rate limiting strategy",
        tag: "Backend",
        tagColor: "text-sky-400 bg-sky-500/10",
        priority: "medium",
        avatar: "#8B5CF6",
      },
      {
        title: "Redesign onboarding flow",
        tag: "Design",
        tagColor: "text-pink-400 bg-pink-500/10",
        priority: "low",
        avatar: "#EC4899",
      },
      {
        title: "Write API documentation",
        tag: "Docs",
        tagColor: "text-amber-400 bg-amber-500/10",
        priority: "low",
        avatar: "#F59E0B",
      },
    ],
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "#6366F1",
    dot: "bg-indigo-400",
    count: 3,
    tasks: [
      {
        title: "Build kanban drag & drop",
        tag: "Frontend",
        tagColor: "text-indigo-400 bg-indigo-500/10",
        priority: "high",
        avatar: "#6366F1",
        progress: 70,
      },
      {
        title: "Auth middleware refactor",
        tag: "Backend",
        tagColor: "text-sky-400 bg-sky-500/10",
        priority: "high",
        avatar: "#0EA5E9",
        progress: 45,
      },
      {
        title: "Dashboard analytics v2",
        tag: "Design",
        tagColor: "text-pink-400 bg-pink-500/10",
        priority: "medium",
        avatar: "#EC4899",
        progress: 90,
      },
    ],
  },
  {
    id: "review",
    label: "In Review",
    color: "#F59E0B",
    dot: "bg-amber-400",
    count: 2,
    tasks: [
      {
        title: "User notification system",
        tag: "Frontend",
        tagColor: "text-indigo-400 bg-indigo-500/10",
        priority: "medium",
        avatar: "#8B5CF6",
      },
      {
        title: "Performance audit fixes",
        tag: "DevOps",
        tagColor: "text-emerald-400 bg-emerald-500/10",
        priority: "high",
        avatar: "#10B981",
      },
    ],
  },
  {
    id: "done",
    label: "Done",
    color: "#10B981",
    dot: "bg-emerald-400",
    count: 4,
    tasks: [
      {
        title: "Setup CI/CD pipeline",
        tag: "DevOps",
        tagColor: "text-emerald-400 bg-emerald-500/10",
        priority: "done",
        avatar: "#10B981",
      },
      {
        title: "User auth & JWT tokens",
        tag: "Backend",
        tagColor: "text-sky-400 bg-sky-500/10",
        priority: "done",
        avatar: "#0EA5E9",
      },
    ],
  },
];

const PRIORITY_BADGE = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-[#6B7280] bg-[#1E2535]",
  done: "text-emerald-400 bg-emerald-500/10",
};

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("board");
  return (
    <section id="preview" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-indigo-600/6 blur-[150px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-5">
            <HiOutlineChip className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
              Product Preview
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
            See it in <span className="text-gradient">action</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-[#6B7280]">
            A real look at what your team's workspace will feel like. Clean,
            fast, and built for focus.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
          <div className="relative glass rounded-2xl border border-indigo-500/20 overflow-hidden shadow-2xl">
            {/* Browser bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0E1117] border-b border-[#1E2535]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                    <TbLayoutKanban className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    FlowSync
                  </span>
                  <span className="text-xs text-[#4B5563]">
                    / Engineering / Sprint 14
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#131720] border border-[#1E2535] rounded-lg">
                  <TbSearch className="w-3.5 h-3.5 text-[#4B5563]" />
                  <span className="text-xs text-[#4B5563]">Search...</span>
                  <span className="text-[10px] font-mono text-[#374151] ml-1">
                    ⌘K
                  </span>
                </div>
                <div className="flex -space-x-1.5">
                  {["#6366F1", "#8B5CF6", "#EC4899"].map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-[#0E1117]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* View tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 py-3 border-b border-[#1E2535] bg-[#0E1117]">
              {[
                { id: "board", icon: TbLayoutKanban, label: "Board" },
                { id: "list", icon: TbList, label: "List" },
                { id: "analytics", icon: TbChartLine, label: "Analytics" },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25" : "text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/5"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="ml-auto">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors duration-200">
                  <TbPlus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>
            </div>
            {/* Board */}
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="flex gap-4 min-w-175">
                {COLUMNS.map((col) => (
                  <div key={col.id} className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                          {col.label}
                        </span>
                        <span className="text-xs text-[#4B5563] font-mono">
                          {col.count}
                        </span>
                      </div>
                      <TbDotsVertical className="w-4 h-4 text-[#374151]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.tasks.map((task, ti) => (
                        <motion.div
                          key={task.title}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: ti * 0.07 }}
                          whileHover={{ y: -2, scale: 1.01 }}
                          className="glass-light rounded-xl p-3 cursor-pointer group"
                        >
                          <p className="text-xs font-medium text-[#D1D5DB] mb-2 leading-relaxed group-hover:text-white transition-colors">
                            {task.title}
                          </p>
                          {task.progress !== undefined && (
                            <div className="mb-2">
                              <div className="h-1 bg-[#1E2535] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${task.tagColor}`}
                            >
                              {task.tag}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${PRIORITY_BADGE[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                              <div
                                className="w-5 h-5 rounded-full shrink-0"
                                style={{ backgroundColor: task.avatar }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <button className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs text-[#4B5563] hover:text-[#6B7280] hover:bg-white/3 transition-all duration-200 border border-dashed border-[#1E2535] hover:border-[#2D3748]">
                        <TbPlus className="w-3.5 h-3.5" />
                        Add task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
