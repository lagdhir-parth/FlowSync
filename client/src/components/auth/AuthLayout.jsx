import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TbBolt, TbCheckbox, TbUsers, TbActivity } from "react-icons/tb";

const BULLETS = [
  { icon: TbCheckbox, text: "Smart workflow automation" },
  { icon: TbUsers, text: "Real-time team collaboration" },
  { icon: TbActivity, text: "Live project insights & analytics" },
];

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#07090F]">
      {/* Backgrounds */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-[-10%] left-[-10%] size-125 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] size-50 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />

      {/* Orbiting rings decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-20">
        <div className="size-70 rounded-full border border-indigo-500/20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-70 rounded-full border border-violet-500/15" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400" />
          </motion.div>
        </div>
      </div>

      <div className="size-full px-[15%] flex flex-col justify-center">
        {/* Logo */}
        <div className="z-10 self-start">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TbBolt className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Flow<span className="text-indigo-400">Sync</span>
            </span>
          </Link>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
                Workflow Intelligence
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              <span className="text-white">Build. Ship.</span>
              <br />
              <span className="shimmer-text">Repeat.</span>
            </h1>
            <p className="text-base text-[#6B7280] leading-relaxed max-w-sm mb-10">
              The workflow platform that keeps your team aligned and your
              projects on track — from kickoff to launch.
            </p>

            <ul className="flex flex-col gap-3">
              {BULLETS.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-[#9CA3AF]">{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Mini sprint card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 glass rounded-2xl p-4 max-w-xs card-glow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                  <TbActivity className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-white">
                  Sprint 14 · Active
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono">
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Done", pct: 62, color: "bg-emerald-500" },
                { label: "In Progress", pct: 24, color: "bg-indigo-500" },
                { label: "Backlog", pct: 14, color: "bg-[#374151]" },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6B7280] w-20 shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1E2535] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        delay: 1.2,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#4B5563] w-7 text-right">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B"].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#07090F] flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: c }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280]">
              <span className="text-white font-semibold">2,400+</span> teams
              trust FlowSync
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#07090F] flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 lg:w-[48%] xl:w-[45%] flex flex-col items-center justify-center relative px-4 sm:px-8 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <TbBolt className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Flow<span className="text-indigo-400">Sync</span>
            </span>
          </Link>
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-violet-600/5 blur-[60px] rounded-full pointer-events-none" />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md mt-10 md:mt-0"
        >
          <div className="glass rounded-3xl p-7 sm:p-9 card-glow">
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-tr-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-indigo-600/10 to-transparent" />
            </div>

            {/* Header */}
            <div className="mb-7">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="text-sm text-[#6B7280]"
              >
                {subtitle}
              </motion.p>
            </div>

            {children}
          </div>

          {/* Glow beneath card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-indigo-600/15 blur-2xl rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}
