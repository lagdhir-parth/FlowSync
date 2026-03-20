import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TbChecklist, TbCircleCheck, TbProgress, TbClipboardList,
  TbFolder, TbLayoutBoard, TbTrendingUp, TbCalendarStats,
} from "react-icons/tb";
import { fetchDashboardStats } from "../../api/dataApi";
import { useAuth } from "../../context/AuthContext";

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const PIE_COLORS = ["#818cf8", "#6366f1", "#a78bfa", "#34d399"];
const PIE_LABELS = ["To Do", "In Progress", "Review", "Done"];

const PRIORITY_COLORS = { low: "#34d399", medium: "#fbbf24", high: "#f87171" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[#1E2535] border border-[#2D3748] px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-6 animate-pulse">
    <div className="h-4 w-24 bg-[#1E2535] rounded mb-3" />
    <div className="h-8 w-16 bg-[#1E2535] rounded" />
  </div>
);

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = stats
    ? [
        { label: "Total Tasks", value: stats.totalTasks, icon: TbChecklist, color: "text-indigo-400", bg: "bg-indigo-500/10" },
        { label: "Completed", value: stats.statusBreakdown.completed, icon: TbCircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "In Progress", value: stats.statusBreakdown.inProgress, icon: TbProgress, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Pending", value: stats.statusBreakdown.todo + stats.statusBreakdown.inReview, icon: TbClipboardList, color: "text-rose-400", bg: "bg-rose-500/10" },
        { label: "Projects", value: stats.projectCount, icon: TbFolder, color: "text-violet-400", bg: "bg-violet-500/10" },
        { label: "Workspaces", value: stats.workspaceCount, icon: TbLayoutBoard, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      ]
    : [];

  const pieData = stats
    ? [
        { name: "To Do", value: stats.statusBreakdown.todo },
        { name: "In Progress", value: stats.statusBreakdown.inProgress },
        { name: "Review", value: stats.statusBreakdown.inReview },
        { name: "Done", value: stats.statusBreakdown.completed },
      ].filter((d) => d.value > 0)
    : [];

  const barData = stats
    ? [
        { priority: "Low", count: stats.byPriority.low, fill: PRIORITY_COLORS.low },
        { priority: "Medium", count: stats.byPriority.medium, fill: PRIORITY_COLORS.medium },
        { priority: "High", count: stats.byPriority.high, fill: PRIORITY_COLORS.high },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-[#1E2535] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={ITEM}
        className="rounded-2xl bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent border border-indigo-500/20 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20">
            <TbTrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {greeting()}, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Here's your productivity overview
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={ITEM}
            className="group rounded-2xl bg-[#0F172A] border border-[#1E2535] p-5 hover:border-indigo-500/30 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart — Tasks completed over last 7 days */}
        <motion.div
          variants={ITEM}
          className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TbCalendarStats className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Completion Trend</h2>
          </div>
          {stats?.dailyCompleted?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.dailyCompleted}>
                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="day" stroke="#4B5563" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4B5563" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Completed"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#gradArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-500">
              No data for the last 7 days
            </div>
          )}
        </motion.div>

        {/* Pie Chart — Task Distribution */}
        <motion.div
          variants={ITEM}
          className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-5"
        >
          <h2 className="text-base font-semibold text-white mb-4">Task Distribution</h2>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(val) => <span className="text-gray-400">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-500">
              No tasks yet
            </div>
          )}
        </motion.div>

        {/* Bar Chart — Priority Breakdown */}
        <motion.div
          variants={ITEM}
          className="rounded-2xl bg-[#0F172A] border border-[#1E2535] p-5 lg:col-span-2"
        >
          <h2 className="text-base font-semibold text-white mb-4">Tasks by Priority</h2>
          {barData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="priority" stroke="#4B5563" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4B5563" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
              No tasks yet
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
