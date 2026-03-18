import { TbMenu2 } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar({ toggleSidebar }) {
  const { user, logoutUser } = useAuth();

  const [openUserDetails, setOpenUserDetails] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1E2535] bg-[#0F172A]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#1E2535]"
        >
          <TbMenu2 className="w-5 h-5" />
        </button>

        <Link to="/" className="text-lg font-semibold">
          Flow<span className="text-indigo-400">Sync</span>
        </Link>
      </div>

      {/* TODO: create search query input / searchbar */}

      <div
        onClick={() => setOpenUserDetails(!openUserDetails)}
        className="flex items-center gap-4"
      >
        <UserAvatar user={user} />
      </div>

      <AnimatePresence>
        {openUserDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-6 w-48 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg z-50"
          >
            <p className="px-4 py-2 text-sm text-white font-semibold">
              {user.name || user.username}
            </p>
            <p className="px-4 py-2 text-sm text-gray-400">{user.email}</p>
            <hr className="my-2 border-gray-700" />
            <button
              onClick={() => {
                logoutUser();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-500 transition-colors duration-200 cursor-pointer rounded-md hover:bg-red-500/10"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
