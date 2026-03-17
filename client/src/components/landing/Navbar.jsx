import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { TbBolt } from "react-icons/tb";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext.jsx";
import UserAvatar from "../UserAvatar.jsx";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Preview", href: "#preview" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { user, logoutUser } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass border-b border-[#1E2535]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                <TbBolt className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Flow<span className="text-indigo-400">Sync</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div>
                  <button
                    className="relative px-4 py-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 flex items-center rounded-lg hover:bg-white/5 group overflow-hidden"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserAvatar user={user} />
                    <button className="flex justify-center items-center group-hover:text-white transition-colors duration-200">
                      <RiArrowDropDownLine className="size-8 text-[#9CA3AF] group-hover:text-white transition-colors duration-200" />
                    </button>
                    <div className="absolute size-full inset-0 bg-linear-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  </button>
                  {isDropdownOpen && (
                    <div className="flex flex-col absolute right-10 mt-2 min-w-48 bg-[#1E2535] rounded-md shadow-lg py-1 group-hover:opacity-100 transition-opacity duration-200 ">
                      <div>
                        <p className="px-4 py-2 text-sm text-white font-semibold">
                          {user.name || user.username}
                        </p>
                        <p className="px-4 text-xs text-[#9CA3AF]">
                          {user.email}
                        </p>
                      </div>

                      <hr className="self-center w-95/100 border-t border-[#3a4151] my-2" />

                      <Link
                        to="/app"
                        className="block px-4 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        Settings
                      </Link>
                      <hr className="self-center w-95/100 border-t border-[#3a4151] my-2" />

                      <button
                        className="w-full px-4 py-2 text-sm text-[#dd7272] hover:text-[#e85555] hover:bg-white/5 transition-all duration-200 cursor-pointer text-left"
                        onClick={() => {
                          logoutUser();
                          setMobileOpen(false);
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="relative px-5 py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 group overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#9CA3AF] hover:text-white transition-colors"
            >
              {mobileOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenuAlt3 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-[#1E2535] md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  {label}
                </a>
              ))}

              {user ? (
                <>
                  <hr className="border-t border-[#1E2535] mt-2" />
                  <Link
                    to="/app"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <button
                    className="w-full px-4 py-3 text-sm text-[#dd7272] hover:text-[#e85555] hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer text-left"
                    onClick={() => {
                      logoutUser();
                      setMobileOpen(false);
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="border-t border-[#1E2535] mt-2 pt-4 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-3 text-sm text-center text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 text-sm font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
