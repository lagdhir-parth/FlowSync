import { motion } from "framer-motion";
import { TbQuote } from "react-icons/tb";

const TESTIMONIALS = [
  {
    quote:
      "FlowSync replaced three tools for us. Our sprint velocity went up 40% in the first month. The workflow automation alone saves our team 6 hours a week.",
    name: "Sarah Chen",
    role: "VP Engineering, NovaTech",
    avatar: "#6366F1",
    initials: "SC",
    stars: 5,
  },
  {
    quote:
      "I've tried Jira, Asana, Linear — nothing compares to how FlowSync handles complex project dependencies. It actually thinks like an engineer.",
    name: "Marcus Williams",
    role: "CTO, Buildify",
    avatar: "#8B5CF6",
    initials: "MW",
    stars: 5,
  },
  {
    quote:
      "The real-time collaboration features are insane. Our remote team of 30 operates like we're all in the same room. Onboarding new devs is 2x faster.",
    name: "Priya Kapoor",
    role: "Product Lead, LaunchPad",
    avatar: "#10B981",
    initials: "PK",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-125 h-100 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 size-100 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-5">
            <TbQuote className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
            Loved by <span className="text-gradient">engineering teams</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-[#6B7280]">
            Join thousands of teams who've replaced their fragmented toolchains
            with FlowSync.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(
            ({ quote, name, role, avatar, initials, stars }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 sm:p-7 border border-[#1E2535] hover:border-[#2D3748] transition-all duration-300 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(stars)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <TbQuote className="w-8 h-8 text-indigo-500/30 mb-3 -scale-x-100" />
                <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1 italic">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#1E2535]">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: avatar }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-[#6B7280]">{role}</p>
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          {[
            "SOC 2 Type II",
            "GDPR Compliant",
            "ISO 27001",
            "99.9% Uptime",
            "Enterprise Ready",
          ].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-[#4B5563]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
