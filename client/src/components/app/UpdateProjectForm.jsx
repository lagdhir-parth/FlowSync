import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSave } from "react-icons/fi";
import { updateProject } from "../../api/dataApi";

const STATUS_OPTIONS = [
  "active",
  "completed",
  "archived",
  "on hold",
  "dropped",
];

function UpdateProjectForm({ project, setShowUpdateProjectForm, onUpdated }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const updates = {
        name,
        description,
        status,
      };

      const updatedProject = await updateProject(project._id, updates);

      if (onUpdated) {
        onUpdated(updatedProject);
      }

      setShowUpdateProjectForm(false);
    } catch (error) {
      console.error("Project update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Update Project</h2>

          <button
            onClick={() => setShowUpdateProjectForm(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Project Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>

            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={400}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpdateProjectForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-gray-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white transition disabled:opacity-50"
            >
              <FiSave />
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default UpdateProjectForm;
