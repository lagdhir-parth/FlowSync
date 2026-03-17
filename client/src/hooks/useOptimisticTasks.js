import { useState, useEffect } from "react";

const getTaskId = (task) => task?._id || task?.id;

export default function useOptimisticTasks(initialTasks = []) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  const updateTaskLocal = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((task) =>
        getTaskId(task) === taskId ? { ...task, ...updates } : task,
      ),
    );
  };

  const removeTaskLocal = (taskId) => {
    setTasks((prev) => prev.filter((task) => getTaskId(task) !== taskId));
  };

  const revertTasks = (oldTasks) => {
    setTasks(oldTasks);
  };

  return {
    tasks,
    setTasks,
    updateTaskLocal,
    removeTaskLocal,
    revertTasks,
  };
}
