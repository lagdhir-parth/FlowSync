import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";

const getTaskId = (task) => task?._id || task?.id;

function StatusSection({
  status,
  title,
  tasks,
  columns,
  onCellEdit,
  onDeleteTask,
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <tbody ref={setNodeRef} className="align-top">
      <tr className="bg-slate-700/70 text-slate-100">
        <td
          colSpan={columns.length}
          className="px-3 py-2 font-semibold rounded-t-md"
        >
          {title}
        </td>
      </tr>

      <SortableContext
        items={tasks.map((task) => getTaskId(task))}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <SortableRow
            key={getTaskId(task)}
            task={task}
            columns={columns}
            onCellEdit={onCellEdit}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </SortableContext>

      {tasks.length === 0 && (
        <tr className="text-slate-400 italic bg-slate-900/60">
          <td
            colSpan={columns.length}
            className="py-4 text-center rounded-b-md"
          >
            Drop tasks here
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default StatusSection;
