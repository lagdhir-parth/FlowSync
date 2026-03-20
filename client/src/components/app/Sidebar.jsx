import { Link, useLocation } from "react-router-dom";
import {
  TbLayoutDashboard,
  TbListCheck,
  TbFolder,
  TbFolderOpen,
  TbUser,
  TbCalendar,
  TbSettings,
} from "react-icons/tb";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllProjects, fetchAllWorkspaces } from "../../api/dataApi";
import { VOICE_COMMAND_EXECUTED_EVENT } from "../../ai/voiceAssistant";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ open }) {
  const location = useLocation();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const { logoutUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, workspacesData] = await Promise.all([
          fetchAllProjects(),
          fetchAllWorkspaces(),
        ]);

        setProjects(projectsData || []);
        setWorkspaces(workspacesData || []);
      } catch (err) {
        console.error("Sidebar data fetch error:", err);
      }
    };

    const onVoiceCommandExecuted = (event) => {
      const action = event?.detail?.action || {};
      const actionType = action?.intent;

      const shouldRefreshSidebarData = [
        "create_project",
        "create_workspace",
      ].includes(actionType);

      if (!shouldRefreshSidebarData) {
        return;
      }

      fetchData();
    };

    fetchData();

    window.addEventListener(
      VOICE_COMMAND_EXECUTED_EVENT,
      onVoiceCommandExecuted,
    );
    return () => {
      window.removeEventListener(
        VOICE_COMMAND_EXECUTED_EVENT,
        onVoiceCommandExecuted,
      );
    };
  }, []);

  const topLinks = [
    { name: "Dashboard", path: "/app", icon: TbLayoutDashboard },
    { name: "My Tasks", path: "/app/my-tasks", icon: TbListCheck },
  ];

  const middleLinks = [
    { name: "Teams", path: "/app/teams", icon: TbUser },
    { name: "Calendar", path: "/app/calendar", icon: TbCalendar },
  ];

  const seperatedLinks = [
    { name: "Projects", path: "/app/projects", icon: TbFolder },
    { name: "Workspaces", path: "/app/workspaces", icon: TbFolder },
  ];

  const bottomLinks = [
    { name: "Profile", path: "/app/profile", icon: TbUser },
    { name: "Settings", path: "/app/settings", icon: TbSettings },
  ];

  return (
    <aside
      className={`relative border-r border-[#1E2535] bg-[#0F172A] transition-all duration-300
      ${open ? "w-64" : "w-16 hidden sm:block"}`}
    >
      <nav className="p-3 flex flex-col gap-2">
        {topLinks.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={name}
              to={path}
              className={`flex ${!open ? "justify-center" : "justify-start"} items-center gap-3 px-3 py-2 rounded-lg transition
              ${active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-[#1E2535]"}`}
            >
              <Icon className="w-5 h-5 shrink-0" />

              {open && <span className="whitespace-nowrap">{name}</span>}
            </Link>
          );
        })}
        <hr className="border-[#1E2535]" />

        {middleLinks.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={name}
              to={path}
              className={`flex ${!open ? "justify-center" : "justify-start"} items-center gap-3 px-3 py-2 rounded-lg transition
              ${active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-[#1E2535]"}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {open && <span className="whitespace-nowrap">{name}</span>}
            </Link>
          );
        })}
        <hr className="border-[#1E2535]" />

        {seperatedLinks.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <div>
              <Link
                key={name}
                to={path}
                className={`flex ${!open ? "justify-center" : "justify-start"} items-center gap-3 px-3 py-2 rounded-lg transition
              ${active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-[#1E2535]"}`}
              >
                {Icon === TbFolder && active ? (
                  <TbFolderOpen className="w-5 h-5 shrink-0" />
                ) : (
                  <Icon className="w-5 h-5 shrink-0" />
                )}
                {open && (
                  <div className="flex justify-between items-center w-full">
                    <span className="whitespace-nowrap">{name}</span>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenAccordion((prev) =>
                          prev === name ? null : name,
                        );
                      }}
                      className={`flex items-center gap-1 rounded-lg ${active ? "bg-indigo-500/20" : "hover:bg-[#272e3f]"} hover:opacity-100 opacity-0 transition-opacity duration-200`}
                    >
                      <motion.div
                        animate={{
                          rotate: openAccordion === name ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <RiArrowDropDownLine className="size-8 text-[#9CA3AF]" />
                      </motion.div>
                    </div>
                  </div>
                )}
              </Link>
              <Accordion
                open={(openAccordion === name || active) && open}
                parentName={name}
                projects={projects}
                workspaces={workspaces}
              />
            </div>
          );
        })}
        <hr className="border-[#1E2535]" />

        {bottomLinks.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={name}
              to={path}
              className={`flex ${!open ? "justify-center" : "justify-start"} items-center gap-3 px-3 py-2 rounded-lg transition
              ${active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-[#1E2535]"}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {open && <span className="whitespace-nowrap">{name}</span>}
            </Link>
          );
        })}

        <button
          onClick={() => logoutUser()}
          className={
            "absolute bottom-5 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 justify-center hover:bg-red-500 cursor-pointer group"
          }
        >
          <FiLogOut className="w-5 h-5 shrink-0 text-red-400 group-hover:text-gray-100 transition-colors duration-200" />
          {open && (
            <span className="text-red-400 group-hover:text-gray-100 transition-colors duration-200">
              Logout
            </span>
          )}
        </button>
      </nav>
    </aside>
  );
}

const Accordion = ({ open, parentName, projects, workspaces }) => {
  const location = useLocation();

  let items = [];

  if (parentName === "Projects") items = projects;
  if (parentName === "Workspaces") items = workspaces;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden ml-6 mt-1 flex flex-col gap-1"
        >
          {items.map((item) => {
            const active = location.pathname.includes(item._id?.toLowerCase());

            return (
              <Link
                key={item._id}
                to={`/app/${parentName.toLowerCase()}/${item._id}`}
                className="block"
              >
                <motion.div
                  key={item._id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors duration-200
                  ${active ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-[#1E2535]"}`}
                >
                  <div className="size-2 bg-indigo-500 rounded-full" />
                  <span className="truncate">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
