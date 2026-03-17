import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanTask from "./KanbanTask";

const getTaskId = (task) => task?._id || task?.id;

function KanbanColumn({
  status,
  title,
  accent,
  tasks,
  activeTaskId,
  onDeleteTask,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-2xl border ${accent} bg-slate-900/70 shadow-[0_10px_30px_rgba(2,6,23,0.35)] p-4 min-h-112 transition-all duration-200 ${
        isOver ? "ring-2 ring-sky-400/50 bg-slate-900" : "ring-0"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-100">{title}</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => getTaskId(task))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <KanbanTask
              key={getTaskId(task)}
              task={task}
              isGhost={activeTaskId === getTaskId(task)}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

export default KanbanColumn;
