import {
  DndContext,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { deleteTask, reorderTasks, updateTask } from "../../../api/dataApi";
import useOptimisticTasks from "../../../hooks/useOptimisticTasks";
import StatusSection from "./StatusSection";

const STATUS_SECTIONS = [
  { key: "todo", title: "Todo" },
  { key: "in progress", title: "In Progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

const STATUS_KEYS = STATUS_SECTIONS.map((section) => section.key);

const getTaskId = (task) => task?._id || task?.id;

function TaskTable({ data, columns, onTasksChange }) {
  const { projectId } = useParams();
  const { tasks, setTasks, updateTaskLocal, removeTaskLocal, revertTasks } =
    useOptimisticTasks(data);
  const dragMetaRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const groupedTasks = useMemo(() => {
    const grouped = {
      todo: [],
      "in progress": [],
      review: [],
      done: [],
    };

    [...tasks]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });

    return grouped;
  }, [tasks]);

  useEffect(() => {
    if (tasks !== data) {
      onTasksChange?.(tasks);
    }
  }, [tasks, data, onTasksChange]);

  const applyGlobalOrder = (items) =>
    items.map((task, index) => ({
      ...task,
      order: index,
    }));

  const hasTaskOrderOrStatusChanged = (before, after) => {
    if (before.length !== after.length) return true;

    for (let i = 0; i < before.length; i += 1) {
      const prev = before[i];
      const next = after[i];

      if (getTaskId(prev) !== getTaskId(next)) return true;
      if (prev.status !== next.status) return true;
      if ((prev.order ?? 0) !== (next.order ?? 0)) return true;
    }

    return false;
  };

  const buildNextTasksFromDrag = (allTasks, activeId, overId) => {
    const activeTask = allTasks.find((task) => getTaskId(task) === activeId);

    if (!activeTask) return null;

    const overTask = allTasks.find((task) => getTaskId(task) === overId);
    const targetStatus = STATUS_KEYS.includes(overId)
      ? overId
      : overTask?.status;

    if (!targetStatus) return null;

    const grouped = {
      todo: [],
      "in progress": [],
      review: [],
      done: [],
    };

    [...allTasks]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });

    const statusBuckets = {
      todo: grouped.todo.filter((task) => getTaskId(task) !== activeId),
      "in progress": grouped["in progress"].filter(
        (task) => getTaskId(task) !== activeId,
      ),
      review: grouped.review.filter((task) => getTaskId(task) !== activeId),
      done: grouped.done.filter((task) => getTaskId(task) !== activeId),
    };

    const targetList = [...statusBuckets[targetStatus]];
    const overIndex = overTask
      ? targetList.findIndex((task) => getTaskId(task) === getTaskId(overTask))
      : -1;

    const insertAt = overIndex >= 0 ? overIndex : targetList.length;
    targetList.splice(insertAt, 0, {
      ...activeTask,
      status: targetStatus,
    });
    statusBuckets[targetStatus] = targetList;

    const nextTasks = applyGlobalOrder(
      STATUS_KEYS.flatMap((status) => statusBuckets[status]),
    );

    return hasTaskOrderOrStatusChanged(allTasks, nextTasks) ? nextTasks : null;
  };

  const persistReorder = async (
    nextTasks,
    movedTaskStatusChanged,
    movedTaskId,
    nextStatus,
  ) => {
    if (movedTaskStatusChanged) {
      await Promise.all([
        updateTask(movedTaskId, { status: nextStatus }),
        reorderTasks(projectId, nextTasks),
      ]);
      return;
    }

    await reorderTasks(projectId, nextTasks);
  };

  const onDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    removeTaskLocal(taskId);
    try {
      await deleteTask(projectId, taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
      revertTasks(previousTasks);
    }
  };

  const onCellEdit = async (taskId, field, value) => {
    const previousTasks = [...tasks];
    updateTaskLocal(taskId, { [field]: value });

    // For assignee, the value is the full populated member object;
    // the API only accepts the _id string.
    const apiValue =
      field === "assignee" && value !== null && typeof value === "object"
        ? value._id
        : value;

    try {
      await updateTask(taskId, { [field]: apiValue });
    } catch (error) {
      console.error("Failed to update task field:", error);
      revertTasks(previousTasks);
    }
  };

  function handleDragStart(event) {
    const activeId = event.active?.id;
    const activeTask = tasks.find((task) => getTaskId(task) === activeId);

    if (!activeTask) return;

    dragMetaRef.current = {
      previousTasks: [...tasks],
      sourceStatus: activeTask.status,
    };
  }

  function handleDragOver(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setTasks((prevTasks) => {
      const nextTasks = buildNextTasksFromDrag(prevTasks, active.id, over.id);
      return nextTasks || prevTasks;
    });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    const dragMeta = dragMetaRef.current;

    if (!dragMeta) return;

    const currentTasks = [...tasks];
    const hasChanges = hasTaskOrderOrStatusChanged(
      dragMeta.previousTasks,
      currentTasks,
    );

    if (!over) {
      revertTasks(dragMeta.previousTasks);
      dragMetaRef.current = null;
      return;
    }

    const nextTasks =
      active.id === over.id
        ? currentTasks
        : buildNextTasksFromDrag(currentTasks, active.id, over.id) ||
          currentTasks;

    const activeTaskAfterDrop = nextTasks.find(
      (task) => getTaskId(task) === active.id,
    );

    if (!activeTaskAfterDrop) {
      revertTasks(dragMeta.previousTasks);
      dragMetaRef.current = null;
      return;
    }

    if (nextTasks !== currentTasks) {
      setTasks(nextTasks);
    }

    if (!hasChanges && nextTasks === currentTasks) {
      dragMetaRef.current = null;
      return;
    }

    try {
      await persistReorder(
        nextTasks,
        dragMeta.sourceStatus !== activeTaskAfterDrop.status,
        getTaskId(activeTaskAfterDrop),
        activeTaskAfterDrop.status,
      );
    } catch (error) {
      console.error("Failed to persist drag-and-drop change:", error);
      revertTasks(dragMeta.previousTasks);
    }

    dragMetaRef.current = null;
  }

  function handleDragCancel() {
    const dragMeta = dragMetaRef.current;
    if (dragMeta) {
      revertTasks(dragMeta.previousTasks);
    }
    dragMetaRef.current = null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        const pointerCollisions = pointerWithin(args);
        return pointerCollisions.length > 0
          ? pointerCollisions
          : closestCenter(args);
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <table className="w-full table-fixed border-separate border-spacing-y-1">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessorKey}>{column.header}</th>
            ))}
          </tr>
        </thead>

        {STATUS_SECTIONS.map((section) => (
          <StatusSection
            key={section.key}
            status={section.key}
            title={section.title}
            tasks={groupedTasks[section.key]}
            columns={columns}
            onCellEdit={onCellEdit}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </table>
    </DndContext>
  );
}

export default TaskTable;
