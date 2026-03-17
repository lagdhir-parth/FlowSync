import { useParams } from "react-router-dom";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();

  return <div>Workspace ID: {workspaceId}</div>;
};

export default WorkspaceDetails;
