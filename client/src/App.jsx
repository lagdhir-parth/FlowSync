import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import VoiceAssistant from "./components/VoiceAssistant.jsx";

const Landing = React.lazy(() => import("./pages/Landing"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const DashboardLayout = React.lazy(
  () => import("./components/app/DashboardLayout"),
);
const DashboardHome = React.lazy(() => import("./pages/app/DashboardHome"));
const Projects = React.lazy(() => import("./pages/app/project/Projects.jsx"));
const Tasks = React.lazy(() => import("./pages/app/task/MyTasks.jsx"));
const Workspaces = React.lazy(
  () => import("./pages/app/workspace/Workspaces.jsx"),
);
const ProjectDetails = React.lazy(
  () => import("./pages/app/project/ProjectDetails.jsx"),
);
const WorkspaceDetails = React.lazy(
  () => import("./pages/app/workspace/WorkspaceDetails.jsx"),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<Projects />} />
              <Route path="my-tasks" element={<Tasks />} />
              <Route path="workspaces" element={<Workspaces />} />
              <Route
                path="/app/projects/:projectId"
                element={<ProjectDetails />}
              />
              <Route
                path="/app/workspaces/:workspaceId"
                element={<WorkspaceDetails />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {/* <VoiceAssistant /> */}
    </BrowserRouter>
  );
}
