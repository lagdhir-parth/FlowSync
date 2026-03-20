import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiUserPlus, FiUserMinus, FiX } from "react-icons/fi";

import {
  fetchWorkspaceMembers,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
  fetchProjectMembers,
  addMemberToProject,
  removeMemberFromProject,
  fetchAllUsers,
} from "../../api/dataApi";

const tabs = ["add", "remove"];

const getMemberIdentifier = (member) => ({
  email: member?.email,
  username: member?.username,
});

const EditMember = ({ type, workspaceId, projectId, onClose, setMembers }) => {
  const [activeTab, setActiveTab] = useState("add");

  const [allUsers, setAllUsers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setDataLoaded(false);

        if (type === "workspace") {
          const users = await fetchAllUsers();
          setAllUsers(users || []);
        }

        if (workspaceId) {
          const wsMembers = await fetchWorkspaceMembers(workspaceId);
          setWorkspaceMembers(wsMembers || []);
        }

        if (projectId) {
          const projMembers = await fetchProjectMembers(projectId);
          setProjectMembers(projMembers || []);
        }

        setDataLoaded(true);
      } catch (err) {
        console.error("Error loading members", err);
      }
    };

    loadMembers();
  }, [type, workspaceId, projectId]);

  const addCandidates = useMemo(() => {
    if (!dataLoaded) return [];

    if (type === "workspace") {
      return allUsers.filter(
        (user) =>
          !workspaceMembers.some((wm) => wm._id === user._id) &&
          !projectMembers.some((pm) => pm._id === user._id),
      );
    }

    if (type === "project") {
      return workspaceMembers.filter(
        (ws) => !projectMembers.some((pm) => pm._id === ws._id),
      );
    }

    return [];
  }, [type, allUsers, workspaceMembers, projectMembers, dataLoaded]);

  const removeCandidates = useMemo(() => {
    if (!dataLoaded) return [];

    if (type === "project") {
      return projectMembers;
    }

    if (type === "workspace") {
      return workspaceMembers;
    }
  }, [type, workspaceMembers, projectMembers, dataLoaded]);

  const handleAdd = async (member) => {
    try {
      setLoading(true);

      const memberIdentifier = getMemberIdentifier(member);

      let updated;
      if (type === "workspace") {
        await addMemberToWorkspace(workspaceId, memberIdentifier);
        updated = await fetchWorkspaceMembers(workspaceId);
        setWorkspaceMembers(updated);
      }

      if (type === "project") {
        await addMemberToProject(projectId, memberIdentifier);
        updated = await fetchProjectMembers(projectId);
        setProjectMembers(updated);
      }

      setMembers?.(updated);
    } catch (err) {
      console.error("Add member failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (member) => {
    try {
      setLoading(true);

      const memberIdentifier = getMemberIdentifier(member);

      let updated;

      if (type === "project") {
        await removeMemberFromProject(projectId, memberIdentifier);
        updated = await fetchProjectMembers(projectId);
        setProjectMembers(updated);
      }

      if (type === "workspace") {
        await removeMemberFromWorkspace(workspaceId, memberIdentifier);
        updated = await fetchWorkspaceMembers(workspaceId);
        setWorkspaceMembers(updated);
      }

      setMembers?.(updated);
    } catch (err) {
      console.error("Remove member failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-xl p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Manage Members</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm capitalize ${
                activeTab === tab
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "add" ? "Add Members" : "Remove Members"}
            </button>
          ))}
        </div>

        {!dataLoaded ? (
          <div className="text-sm text-gray-400 text-center py-10">
            Loading members...
          </div>
        ) : (
          <>
            {/* ADD TAB */}
            {activeTab === "add" && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {addCandidates.length === 0 ? (
                  <p className="text-sm text-gray-400">No members available.</p>
                ) : (
                  addCandidates.map((member) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-white">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {member.username}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>

                      <button
                        disabled={loading}
                        onClick={() => handleAdd(member)}
                        className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded"
                      >
                        <FiUserPlus />
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* REMOVE TAB */}
            {activeTab === "remove" && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {removeCandidates.length === 0 ? (
                  <p className="text-sm text-gray-400">No members to remove.</p>
                ) : (
                  removeCandidates.map((member) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-white">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {member.username}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>

                      <button
                        disabled={loading}
                        onClick={() => handleRemove(member)}
                        className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                      >
                        <FiUserMinus />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EditMember;

// For workspace members
{
  /* 
    <EditMember
      type="workspace"
      workspaceId={project.workspace._id}
      setMembers={setMembers}
      onClose={() => {
        setShowEditMember(false);
      }}
    /> 
  */
}

// For project members
{
  /* 
    <EditMember
      type="project"
      workspaceId={project.workspace._id}
      projectId={project._id}
      onClose={() => {
        setShowEditMember(false);
      }}
      setMembers={setMembers}
    /> 
  */
}
