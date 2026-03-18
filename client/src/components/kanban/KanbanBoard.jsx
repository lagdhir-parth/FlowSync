import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { reorderTasks, updateTask, deleteTask } from "../../api/dataApi";
import useOptimisticTasks from "../../hooks/useOptimisticTasks";
import KanbanColumn from "./KanbanColumn";
import KanbanTask from "./KanbanTask";

const COLUMNS = [
  { key: "todo", title: "Todo", accent: "border-rose-400/50" },
  { key: "in progress", title: "In Progress", accent: "border-amber-400/50" },
  { key: "review", title: "Review", accent: "border-sky-400/50" },
  { key: "done", title: "Done", accent: "border-emerald-400/50" },
];

const COLUMN_KEYS = COLUMNS.map((column) => column.key);
const getTaskId = (task) => task?._id || task?.id;

function KanbanBoard({ tasks: incomingTasks = [], onTasksChange }) {
  const { projectId } = useParams();
  const { tasks, setTasks, removeTaskLocal, revertTasks } =
    useOptimisticTasks(incomingTasks);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const dragMetaRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

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
    const targetStatus = COLUMN_KEYS.includes(overId)
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
      COLUMN_KEYS.flatMap((status) => statusBuckets[status]),
    );

    return hasTaskOrderOrStatusChanged(allTasks, nextTasks) ? nextTasks : null;
  };

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

  const activeTask = useMemo(
    () => tasks.find((task) => getTaskId(task) === activeTaskId) || null,
    [tasks, activeTaskId],
  );

  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    removeTaskLocal(taskId);
    onTasksChange?.((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (task) => getTaskId(task) !== taskId,
      ),
    );

    try {
      await deleteTask(projectId, taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
      revertTasks(previousTasks);
      onTasksChange?.(previousTasks);
    }
  };

  const syncTasks = (nextTasks) => {
    setTasks(nextTasks);
    onTasksChange?.(nextTasks);
  };

  function handleDragStart(event) {
    const activeId = event.active?.id;
    const activeTaskOnStart = tasks.find(
      (task) => getTaskId(task) === activeId,
    );

    if (!activeTaskOnStart) return;

    dragMetaRef.current = {
      previousTasks: [...tasks],
      sourceStatus: activeTaskOnStart.status,
    };
    setActiveTaskId(activeId);
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

    setActiveTaskId(null);

    if (!dragMeta) return;

    const currentTasks = [...tasks];
    const hasChanges = hasTaskOrderOrStatusChanged(
      dragMeta.previousTasks,
      currentTasks,
    );

    if (!over) {
      revertTasks(dragMeta.previousTasks);
      onTasksChange?.(dragMeta.previousTasks);
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
      onTasksChange?.(dragMeta.previousTasks);
      dragMetaRef.current = null;
      return;
    }

    if (nextTasks !== currentTasks) {
      syncTasks(nextTasks);
    } else if (hasChanges) {
      onTasksChange?.(currentTasks);
    }

    if (!hasChanges && nextTasks === currentTasks) {
      dragMetaRef.current = null;
      return;
    }

    try {
      if (dragMeta.sourceStatus !== activeTaskAfterDrop.status) {
        await Promise.all([
          updateTask(getTaskId(activeTaskAfterDrop), {
            status: activeTaskAfterDrop.status,
          }),
          reorderTasks(projectId, nextTasks),
        ]);
      } else {
        await reorderTasks(projectId, nextTasks);
      }
    } catch (error) {
      console.error("Failed to persist board drag-and-drop change:", error);
      revertTasks(dragMeta.previousTasks);
      onTasksChange?.(dragMeta.previousTasks);
    }

    dragMetaRef.current = null;
  }

  function handleDragCancel() {
    const dragMeta = dragMetaRef.current;

    setActiveTaskId(null);

    if (dragMeta) {
      revertTasks(dragMeta.previousTasks);
      onTasksChange?.(dragMeta.previousTasks);
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.key}
            status={column.key}
            title={column.title}
            accent={column.accent}
            tasks={groupedTasks[column.key]}
            activeTaskId={activeTaskId}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {activeTask ? <KanbanTask task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
