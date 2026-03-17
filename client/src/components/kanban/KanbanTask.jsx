import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiCalendar, FiFlag } from "react-icons/fi";
import { TbTrash } from "react-icons/tb";
import UserAvatar from "../UserAvatar";

const getTaskId = (task) => task?._id || task?.id;

const priorityStyles = {
  low: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  medium: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  high: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};

const formatDate = (rawDate) => {
  if (!rawDate) return "No deadline";

  const parsed = new Date(rawDate);

  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function KanbanTask({
  task,
  isOverlay = false,
  isGhost = false,
  onDeleteTask,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getTaskId(task),
  });

  const assignee = task?.assignee;
  const assigneeName =
    assignee?.username || assignee?.name || assignee?.email || "Unassigned";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 170ms cubic-bezier(0.2, 0, 0, 1)",
    opacity: isOverlay ? 0.95 : isDragging ? 0.35 : isGhost ? 0.55 : 1,
    willChange: "transform",
    boxShadow: isOverlay
      ? "0 16px 40px rgba(15, 23, 42, 0.45)"
      : "0 8px 20px rgba(15, 23, 42, 0.25)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-700/70 bg-slate-800/70 p-3 cursor-grab active:cursor-grabbing touch-none select-none transition-colors hover:border-slate-500/80 group"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 leading-5 line-clamp-2">
          {task?.name || "Untitled task"}
        </h3>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-md border capitalize ${priorityStyles[task?.priority] || "text-slate-300 border-slate-600 bg-slate-700/60"}`}
        >
          {task?.priority || "normal"}
        </span>
      </div>

      <p className="text-xs text-slate-300/90 mt-2 line-clamp-3 min-h-[2.8rem]">
        {task?.description || "No description provided."}
      </p>

      <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-400" />
          <span>{formatDate(task?.deadline)}</span>
        </div>

        <div className="flex items-center gap-2">
          <FiFlag className="text-slate-400" />
          <span className="capitalize">{task?.status || "todo"}</span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar user={assignee} size="6" />
            <span className="truncate">{assigneeName}</span>
          </div>
          {!isOverlay && (
            <button
              type="button"
              aria-label="Delete task"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDeleteTask?.(getTaskId(task))}
              className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <TbTrash className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default KanbanTask;
