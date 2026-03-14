import { motion } from "framer-motion";
import {
  TbLayoutKanban,
  TbBrain,
  TbUsers,
  TbActivity,
  TbChartBar,
} from "react-icons/tb";
import { FiZap } from "react-icons/fi";

const FEATURES = [
  {
    icon: FiZap,
    title: "Workflow Automation",
    description:
      "Define rules, triggers, and actions to automate repetitive tasks. Let FlowSync handle the busywork while your team focuses on what matters.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "hover:border-amber-500/30",
    glow: "hover:shadow-amber-500/10",
  },
  {
    icon: TbLayoutKanban,
    title: "Kanban Boards",
    description:
      "Visualize your entire pipeline with fluid, customizable boards. Drag, drop, and ship with confidence across every sprint.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "hover:border-indigo-500/30",
    glow: "hover:shadow-indigo-500/10",
  },
  {
    icon: TbBrain,
    title: "Smart Prioritization",
    description:
      "AI-powered suggestions surface the highest-impact tasks automatically. Always know what to work on next.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/30",
    glow: "hover:shadow-violet-500/10",
  },
  {
    icon: TbUsers,
    title: "Team Collaboration",
    description:
      "Comments, mentions, file attachments, and live cursors. Your team stays in sync without the noise of endless meetings.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "hover:border-sky-500/30",
    glow: "hover:shadow-sky-500/10",
  },
  {
    icon: TbActivity,
    title: "Real-time Updates",
    description:
      "See every change as it happens. Instant notifications and live activity feeds keep the whole team aligned.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    icon: TbChartBar,
    title: "Project Insights",
    description:
      "Velocity charts, burndown graphs, and team health metrics give you the data you need to continuously improve.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "hover:border-pink-500/30",
    glow: "hover:shadow-pink-500/10",
  },
];

const wrap = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const card = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-indigo-600/6 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-5">
            <FiZap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
              Core Features
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
            Everything your team{" "}
            <span className="text-gradient">needs to ship</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#6B7280] leading-relaxed">
            From solo projects to enterprise teams — FlowSync scales with you.
            Every feature is designed to reduce friction and increase velocity.
          </p>
        </motion.div>

        <motion.div
          variants={wrap}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {FEATURES.map(
            ({ icon: Icon, title, description, color, bg, border, glow }) => (
              <motion.div
                key={title}
                variants={card}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={`group relative glass rounded-2xl p-6 sm:p-7 border border-[#1E2535] ${border} transition-all duration-300 ${glow} hover:shadow-xl cursor-default`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl ${bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                />
                <div
                  className={`relative w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="relative text-base font-semibold text-white mb-2.5">
                  {title}
                </h3>
                <p className="relative text-sm text-[#6B7280] leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}
