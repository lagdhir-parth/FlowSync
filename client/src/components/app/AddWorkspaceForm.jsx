import { useState } from "react";
import { FiX } from "react-icons/fi";
import { createWorkspace } from "../../api/dataApi";

const AddWorkspaceForm = ({ setShowAddWorkspaceForm, onWorkspaceCreate }) => {
  // ✅ Simple JSON state (single object)
  const [workspace, setWorkspace] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setWorkspace({
      ...workspace,
      name: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workspace.name.trim()) return;

    setLoading(true);

    const tempId = Date.now();

    const tempWorkspace = {
      _id: tempId,
      name: workspace.name,
      owner: { name: "You" },
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // ✅ Optimistic UI
    onWorkspaceCreate(tempWorkspace);

    try {
      // ✅ Send pure JSON
      const realWorkspace = await createWorkspace(workspace);

      // replace temp → real
      onWorkspaceCreate(realWorkspace, tempId);

      setShowAddWorkspaceForm(false);
    } catch (err) {
      console.error(err);

      // rollback
      onWorkspaceCreate(null, tempId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowAddWorkspaceForm(false)}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">
            Create Workspace
          </h2>
          <button
            onClick={() => setShowAddWorkspaceForm(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace Name */}
          <div>
            <label className="text-sm text-gray-400">Workspace Name</label>
            <input
              type="text"
              value={workspace.name}
              onChange={handleChange}
              placeholder="e.g. Startup, Personal, Team Alpha"
              autoFocus
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !workspace.name.trim()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkspaceForm;
