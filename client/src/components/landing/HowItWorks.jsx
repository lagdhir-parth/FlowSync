import { motion } from "framer-motion";
import {
  TbBuildingSkyscraper,
  TbFolder,
  TbListCheck,
  TbArrowRight,
} from "react-icons/tb";

const STEPS = [
  {
    number: "01",
    icon: TbBuildingSkyscraper,
    title: "Create Your Workspace",
    description:
      "Set up a dedicated space for your organization. Invite teammates, set roles and permissions, and configure your workflow stages in minutes.",
    tag: "Setup",
    tagColor: "text-indigo-400 bg-indigo-500/10",
    accent: "#6366F1",
    details: [
      "Custom workflow stages",
      "Role-based permissions",
      "Organization settings",
    ],
  },
  {
    number: "02",
    icon: TbFolder,
    title: "Organize Your Projects",
    description:
      "Create projects for every initiative. Break down work into milestones, assign owners, set deadlines, and define what success looks like.",
    tag: "Organize",
    tagColor: "text-violet-400 bg-violet-500/10",
    accent: "#8B5CF6",
    details: ["Milestone tracking", "Project templates", "Deadline management"],
  },
  {
    number: "03",
    icon: TbListCheck,
    title: "Track with Smart Workflows",
    description:
      "Add tasks, set priorities, and move work through your custom pipeline. Automation handles the updates — your team stays focused on execution.",
    tag: "Execute",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    accent: "#10B981",
    details: [
      "Automated status updates",
      "Smart task prioritization",
      "Real-time progress",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 sm:py-36 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/2 right-0 size-125 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-5">
            <TbListCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
              How It Works
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
            Up and running <span className="text-gradient">in 3 steps</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg text-[#6B7280]">
            No complex onboarding. No week-long setup. FlowSync gets your team
            productive from day one.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 lg:gap-8">
          {STEPS.map(
            (
              {
                number,
                icon: Icon,
                title,
                description,
                tag,
                tagColor,
                accent,
                details,
              },
              index,
            ) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex flex-col ${index % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-6 lg:gap-12`}
              >
                <div className="flex-1 w-full">
                  <div className="glass rounded-2xl p-7 sm:p-8 border border-[#1E2535] hover:border-[#2D3748] transition-colors duration-300">
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accent}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: accent }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColor}`}
                          >
                            {tag}
                          </span>
                          <span className="text-xs font-mono text-[#4B5563]">
                            Step {number}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[#6B7280] leading-relaxed mb-5">
                      {description}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {details.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2.5 text-sm text-[#9CA3AF]"
                        >
                          <TbArrowRight
                            className="w-4 h-4 shrink-0"
                            style={{ color: accent }}
                          />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <div className="relative">
                    <div
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${accent}0D`,
                        border: `1px solid ${accent}25`,
                      }}
                    >
                      <span
                        className="text-5xl sm:text-6xl font-bold tracking-tighter"
                        style={{ color: `${accent}40` }}
                      >
                        {number}
                      </span>
                    </div>
                    <div
                      className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
