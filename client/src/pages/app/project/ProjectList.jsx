import { useEffect, useMemo, useState } from "react";
import TaskTable from "../../../components/app/task/TaskTable";
import { fetchProjectMembers } from "../../../api/dataApi";
import { useParams } from "react-router-dom";
import ProjecListViewHeader from "../../../components/app/project/ProjecListViewHeader";
import AddTaskForm from "../../../components/app/task/AddTaskForm";
import { useAuth } from "../../../context/AuthContext";

const getEntityId = (entity) =>
  typeof entity === "object" ? entity?._id || entity?.id : entity;

const ProjectList = ({ project, setProject, tasks = [], onTasksChange }) => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const isProjectManager =
    getEntityId(project?.projectManager) === getEntityId(user);

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
        editable: isProjectManager,
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
    [isProjectManager, members],
  );

  const handleTaskCreated = (task) => {
    onTasksChange?.((prev) => [...prev, task]);
    setProject((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), task],
    }));
  };

  useEffect(() => {
    if (!project) return;

    fetchProjectMembers(project._id)
      .then((data) => setMembers(data ?? []))
      .catch((err) => console.error("Error fetching project members:", err));
  }, [project]);

  return (
    <div>
      <ProjecListViewHeader onAddTask={() => setShowForm(true)} />

      {showForm && (
        <AddTaskForm
          projectId={project._id}
          onClose={() => setShowForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      <TaskTable data={tasks} columns={columns} onTasksChange={onTasksChange} />
    </div>
  );
};

export default ProjectList;
