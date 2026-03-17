import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import {
  FiUsers,
  FiCheckSquare,
  FiUser,
  FiActivity,
  FiPlus,
} from "react-icons/fi";
import EditMember from "../../../components/app/EditMember";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const StatCard = ({ icon, label, value, editable, onAdd }) => {
  return (
    <motion.div
      variants={item}
      className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4"
    >
      <div className="text-indigo-400 text-2xl">{icon}</div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-lg font-semibold">{value}</p>
        </div>
        <div className="text-gray-400 text-sm cursor-pointer">
          {editable ? (
            <div
              className="flex justify-center items-center p-3 rounded-lg  hover:bg-gray-700 hover:text-gray-200 transition-colors duration-200"
              onClick={onAdd}
            >
              <FiPlus className="size-6 text-gray-400 text-sm" />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectOverview = ({ project }) => {
  if (!project) {
    return (
      <div className="text-gray-400 text-sm">Loading project overview...</div>
    );
  }

  const [showEditMember, setShowEditMember] = useState(false);
  const [members, setMembers] = useState(project.members || []);
  const [tasks, setTasks] = useState(project.tasks || []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUsers />}
          label="Members"
          value={members.length}
          editable
          onAdd={() => {
            setShowEditMember(true);
          }}
        />

        <StatCard icon={<FiCheckSquare />} label="Tasks" value={tasks.length} />

        <StatCard
          icon={<FiUser />}
          label="Project Manager"
          value={project.projectManager?.name || "Not assigned"}
        />

        <StatCard icon={<FiActivity />} label="Status" value={project.status} />
      </div>

      {/* Description */}
      <motion.div
        variants={item}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-3">Description</h2>

        <p className="text-gray-400 text-sm leading-relaxed">
          {project.description || "No description provided for this project."}
        </p>
      </motion.div>

      {/* Members */}
      <motion.div
        variants={item}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4">Team Members</h2>

        {members.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No members assigned to this project.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member, index) => (
              <div
                key={member._id || index}
                className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-200"
              >
                {member.name || "User"}
              </div>
            ))}
          </div>
        )}
      </motion.div>
      {showEditMember && (
        <EditMember
          type="project"
          workspaceId={project.workspace._id}
          projectId={project._id}
          onClose={() => {
            setShowEditMember(false);
          }}
          setMembers={setMembers}
        />
      )}
    </motion.div>
  );
};

export default ProjectOverview;
