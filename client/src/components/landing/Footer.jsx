import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TbBolt,
  TbBrandGithub,
  TbBrandTwitter,
  TbBrandLinkedin,
} from "react-icons/tb";

const FOOTER_LINKS = {
  Product: ["Features", "Roadmap", "Changelog", "Pricing", "Status"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Resources: [
    "Documentation",
    "API Reference",
    "Guides",
    "Community",
    "Support",
  ],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-[#1E2535] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <TbBolt className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Flow<span className="text-indigo-400">Sync</span>
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mb-6">
              The workflow-based task management platform built for modern
              engineering teams.
            </p>
            <div className="flex items-center gap-3">
              {[TbBrandGithub, TbBrandTwitter, TbBrandLinkedin].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[#6B7280] hover:text-white hover:border-indigo-500/30 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#6B7280] hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#1E2535] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4B5563]">
            © {new Date().getFullYear()} FlowSync, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
