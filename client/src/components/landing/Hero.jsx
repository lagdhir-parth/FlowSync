import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { TbSparkles, TbUsers, TbCheckbox } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext.jsx";

const FLOATING_CARDS = [
  {
    icon: TbCheckbox,
    label: "Task completed",
    sub: "Design system v2.0",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    pos: "top-[12%] left-[3%] md:left-[8%]",
    delay: 0,
  },
  {
    icon: TbUsers,
    label: "12 members online",
    sub: "Engineering · Design",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-400",
    pos: "top-[55%] right-[3%] md:right-[6%]",
    delay: 1.2,
  },
  {
    icon: TbSparkles,
    label: "Sprint complete",
    sub: "24/24 tasks shipped",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    dot: "bg-violet-400",
    pos: "bottom-[12%] left-[5%] md:left-[10%]",
    delay: 0.6,
  },
];

export default function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-150 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 size-75 rounded-full bg-violet-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-75 rounded-full bg-emerald-500/6 blur-[80px] pointer-events-none" />

      {FLOATING_CARDS.map(
        ({ icon: Icon, label, sub, color, bg, dot, pos, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { delay: delay + 0.8, duration: 0.5 },
              scale: { delay: delay + 0.8, duration: 0.5 },
              y: {
                delay: delay + 0.8,
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={`absolute ${pos} hidden sm:flex glass items-center gap-3 px-4 py-3 rounded-2xl z-10 max-w-50`}
          >
            <div
              className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                <p className="text-xs font-semibold text-white truncate">
                  {label}
                </p>
              </div>
              <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
                {sub}
              </p>
            </div>
          </motion.div>
        ),
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-8"
        >
          <TbSparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
            Workflow Intelligence Platform
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          <span className="text-white">Organize</span>
          <br />
          <span className="text-gradient">Workflows.</span>
          <br />
          <span className="text-white">Ship </span>
          <span className="text-gradient-green">Faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-[#9CA3AF] leading-relaxed mb-10"
        >
          FlowSync gives your team a single source of truth — from idea to done.
          Smart workflows, kanban boards, and real-time collaboration built for
          teams that ship.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={user ? "/dashboard" : "/register"}
            className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            <span>{user ? "Go to Dashboard" : "Start for free"}</span>
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          </Link>
          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-[#9CA3AF] hover:text-white rounded-xl border border-[#1E2535] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300"
            >
              Log in to dashboard
            </Link>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <div className="flex -space-x-2">
            {["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"].map(
              (color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#07090F] flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ),
            )}
          </div>
          <p className="text-sm text-[#6B7280]">
            <span className="text-white font-semibold">2,400+</span> teams
            already using FlowSync
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="w-4 h-4 text-amber-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-[#6B7280] ml-1">4.9/5</span>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative"
        >
          <div className="absolute -inset-4 bg-indigo-600/10 rounded-3xl blur-2xl" />
          <div className="relative glass rounded-2xl border border-indigo-500/20 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0E1117] border-b border-[#1E2535]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto max-w-xs h-6 rounded-md bg-[#131720] border border-[#1E2535] flex items-center justify-center">
                  <span className="text-[10px] font-mono text-[#4B5563]">
                    app.flowcraft.io/workspace
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-3 gap-3 sm:gap-4 min-h-50 sm:min-h-65">
              {["Backlog", "In Progress", "Done"].map((col, ci) => (
                <div key={col} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${ci === 0 ? "bg-[#6B7280]" : ci === 1 ? "bg-indigo-400" : "bg-emerald-400"}`}
                    />
                    <span className="text-[10px] sm:text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      {col}
                    </span>
                  </div>
                  {[...Array(ci === 1 ? 3 : 2)].map((_, ti) => (
                    <div
                      key={ti}
                      className="glass-light rounded-lg p-2.5 sm:p-3"
                    >
                      <div
                        className={`h-1.5 sm:h-2 rounded-full mb-1.5 sm:mb-2 ${ci === 0 ? "bg-[#374151]" : ci === 1 ? "bg-indigo-500/50" : "bg-emerald-500/50"}`}
                        style={{ width: `${60 + ti * 15}%` }}
                      />
                      <div className="h-1 sm:h-1.5 rounded-full bg-[#1E2535] w-3/4" />
                      <div className="flex items-center gap-1 mt-2">
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${["bg-indigo-500", "bg-violet-500", "bg-emerald-500"][ti % 3]}`}
                        />
                        <div className="h-1 rounded-full bg-[#1E2535] flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#07090F] to-transparent rounded-b-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
