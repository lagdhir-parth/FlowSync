import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { TbBolt, TbShieldCheck, TbCreditCardOff } from "react-icons/tb";

export default function CTA() {
  return (
    <section id="pricing" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-indigo-900/60 via-[#0E1117] to-violet-900/40" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute top-0 left-1/4 w-100 h-75 bg-indigo-600/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 size-75 bg-violet-600/15 blur-[80px] rounded-full" />
          <div className="absolute inset-0 rounded-3xl border border-indigo-500/20" />

          <div className="relative z-10 py-16 sm:py-20 px-6 sm:px-12 lg:px-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-7"
            >
              <TbBolt className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-[#9CA3AF] tracking-wider uppercase">
                Get Started Today
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
            >
              Start managing your <br className="hidden sm:block" />
              <span className="text-gradient">workflow today</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto text-lg text-[#9CA3AF] mb-10 leading-relaxed"
            >
              Free for up to 5 members. No credit card required. Set up your
              workspace in under 2 minutes and start shipping faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <span>Create free account</span>
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-[#9CA3AF] hover:text-white rounded-xl border border-[#2D3748] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300"
              >
                Log in to existing account
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-10"
            >
              {[
                { icon: TbCreditCardOff, text: "No credit card required" },
                { icon: TbShieldCheck, text: "SOC 2 Type II certified" },
                { icon: TbBolt, text: "Setup in 2 minutes" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-sm text-[#6B7280]"
                >
                  <Icon className="w-4 h-4 text-emerald-500" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
