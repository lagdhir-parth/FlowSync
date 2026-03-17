import { useEffect, useMemo, useState } from "react";
import TaskTable from "../../../components/app/task/TaskTable";
import { fetchWorkspaceMembers } from "../../../api/dataApi";
import { useParams } from "react-router-dom";
import ProjecListViewHeader from "../../../components/app/project/ProjecListViewHeader";
import AddTaskForm from "../../../components/app/task/AddTaskForm";

const ProjectList = ({ project, setProject, tasks = [], onTasksChange }) => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { projectId } = useParams();

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Task Name",
        editable: true,
        type: "text",
      },
      {
        accessorKey: "description",
        header: "Description",
        editable: true,
        type: "text",
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        editable: true,
        type: "member",
        options: members,
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        editable: true,
        type: "date",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        editable: true,
        type: "select",
        options: ["low", "medium", "high"],
      },
    ],
    [members],
  );

  const handleTaskCreated = (task) => {
    onTasksChange?.((prev) => [...prev, task]);
    setProject((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), task],
    }));
  };

  useEffect(() => {
    if (!project?.workspace) return;
    const workspaceId =
      typeof project.workspace === "object"
        ? project.workspace._id
        : project.workspace;

    fetchWorkspaceMembers(workspaceId)
      .then((data) => setMembers(data ?? []))
      .catch((err) => console.error("Error fetching workspace members:", err));
  }, [project?.workspace]);

  return (
    <div>
      <ProjecListViewHeader onAddTask={() => setShowForm(true)} />

      {showForm && (
        <AddTaskForm
          projectId={projectId}
          onClose={() => setShowForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      <TaskTable data={tasks} columns={columns} onTasksChange={onTasksChange} />
    </div>
  );
};

export default ProjectList;
