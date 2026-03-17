import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/axios";

const AddTaskForm = ({ projectId, onClose, onTaskCreated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post("/tasks/", { ...form, projectId });
      onTaskCreated(res.data?.data);
      onClose();
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 w-full max-w-lg p-6 rounded-xl border border-gray-700"
      >
        <h2 className="text-lg font-semibold mb-4">Create Task</h2>

        {/* Task Name */}
        <input
          name="name"
          placeholder="Task name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
        />

        {/* Priority */}
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Status */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
        >
          <option value="todo">Todo</option>
          <option value="in progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        {/* Deadline */}
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-600 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-indigo-500 rounded-lg hover:bg-indigo-600 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddTaskForm;
