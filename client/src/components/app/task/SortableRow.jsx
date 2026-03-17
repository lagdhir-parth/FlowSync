import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbGripVertical } from "react-icons/tb";
import { TbTrash } from "react-icons/tb";
import EditableCell from "./EditableCell";

const getTaskId = (task) => task?._id || task?.id;

function SortableRow({ task, columns, onCellEdit, onDeleteTask }) {
  const id = getTaskId(task);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 160ms cubic-bezier(0.2, 0, 0, 1)",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 2 : 1,
    position: "relative",
    willChange: "transform",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="group bg-slate-900/70 hover:bg-slate-800/70"
    >
      {columns.map((column, index) => {
        const value = task[column.accessorKey];

        if (column.editable) {
          return (
            <td
              key={`${id}-${column.accessorKey}`}
              className="px-3 py-2 align-middle border-x border-gray-700"
            >
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <button
                    type="button"
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200 touch-none"
                    aria-label="Drag row"
                    {...attributes}
                    {...listeners}
                  >
                    <TbGripVertical />
                  </button>
                )}

                <EditableCell
                  value={value}
                  type={column.type}
                  options={column.options}
                  onSave={(nextValue) =>
                    onCellEdit(id, column.accessorKey, nextValue)
                  }
                />
                {index === columns.length - 1 && (
                  <button
                    type="button"
                    aria-label="Delete task"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDeleteTask?.(id)}
                    className="ml-1 p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                  >
                    <TbTrash className="size-4" />
                  </button>
                )}
              </div>
            </td>
          );
        }

        return (
          <td
            key={`${id}-${column.accessorKey}`}
            className="px-3 py-2 align-middle border-x border-gray-700"
          >
            <div className="flex items-center gap-2">
              {index === 0 && (
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200 touch-none"
                  aria-label="Drag row"
                  {...attributes}
                  {...listeners}
                >
                  <TbGripVertical />
                </button>
              )}

              <span className="flex-1">
                {typeof column.cell === "function"
                  ? column.cell(task)
                  : String(value ?? "-")}
              </span>

              {index === columns.length - 1 && (
                <button
                  type="button"
                  aria-label="Delete task"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onDeleteTask?.(id)}
                  className="ml-1 p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                >
                  <TbTrash className="size-4" />
                </button>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

export default SortableRow;
