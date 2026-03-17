import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";

const ProjecListViewHeader = ({ onAddTask }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Project Tasks</h2>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm bg-indigo-500 rounded-lg hover:bg-indigo-400 transition-colors">
            Filter
          </button>

          <button className="px-3 py-1 text-sm bg-indigo-500 rounded-lg hover:bg-indigo-400 transition-colors">
            Sort
          </button>

          <button
            onClick={onAddTask}
            className="px-3 py-1 flex items-center gap-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            <FiPlus className="size-4" />
            Add Task
          </button>
        </div>
      </div>

      <hr className="border-gray-700 mb-4" />
    </div>
  );
};

export default ProjecListViewHeader;
