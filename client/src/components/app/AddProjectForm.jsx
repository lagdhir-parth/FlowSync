import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { createProject, fetchAllWorkspaces } from "../../api/dataApi";

const AddProjectForm = ({ setShowAddProjectForm, onProjectCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch workspaces
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchAllWorkspaces();
        setWorkspaces(data || []);

        // auto select first workspace
        if (data?.length) {
          setWorkspaceId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadWorkspaces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !workspaceId) return;

    setLoading(true);

    const projectData = {
      name,
      description,
    };

    const tempId = Date.now();

    const tempProject = {
      _id: tempId,
      name,
      description,
      status: "active",
      members: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      workspace: workspaceId,
      isOptimistic: true,
    };

    // ✅ Optimistic UI
    onProjectCreate(tempProject);

    try {
      const realProject = await createProject(workspaceId, projectData);

      // replace temp
      onProjectCreate(realProject, tempId);

      setShowAddProjectForm(false);
    } catch (err) {
      console.error(err);

      // rollback
      onProjectCreate(null, tempId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowAddProjectForm(false)}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">
            Create Project
          </h2>
          <button
            onClick={() => setShowAddProjectForm(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace Dropdown */}
          <div>
            <label className="text-sm text-gray-400">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {workspaces.length === 0 && <p>No workspace found</p>}
              {workspaces.map((ws) => (
                <option key={ws._id} value={ws._id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Name */}
          <div>
            <label className="text-sm text-gray-400">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Enter project name"
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter description"
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!workspaceId || !name.trim() || loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectForm;
