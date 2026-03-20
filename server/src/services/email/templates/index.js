const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  line-height: 1.6;
`;

const containerStyles = `
  max-w-xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #4F46E5;
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  margin-top: 20px;
`;

export const welcomeEmailTemplate = ({ name }) => `
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <h2 style="color: #4F46E5;">Welcome to FlowSync, ${name}!</h2>
      <p>We're thrilled to have you on board. FlowSync is your central hub for task management, project organization, and team productivity.</p>
      <p>Get started by creating your first workspace and setting up tasks seamlessly with our AI suite!</p>
      <a href="https://flowsync.app/dashboard" style="${buttonStyles}">Go to Dashboard</a>
      <p style="margin-top: 30px; font-size: 13px; color: #777;">
        Best,<br/>The FlowSync Team
      </p>
    </div>
  </div>
`;

export const workspaceInviteTemplate = ({ name, workspaceName }) => `
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <h2>Hi ${name},</h2>
      <p>You have been added to the <strong>${workspaceName}</strong> workspace on FlowSync!</p>
      <p>Log in to view your team's projects and tasks mapped specifically to this workspace domain.</p>
      <a href="https://flowsync.app/workspaces" style="${buttonStyles}">View Workspace</a>
    </div>
  </div>
`;

export const projectInviteTemplate = ({ name, projectName, workspaceName }) => `
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <h2>Hi ${name},</h2>
      <p>You have been added to the <strong>${projectName}</strong> project within the ${workspaceName || 'workspace'}.</p>
      <p>Team members are waiting for your updates. Make sure you check your assignments!</p>
      <a href="https://flowsync.app/projects" style="${buttonStyles}">Open Project</a>
    </div>
  </div>
`;

export const taskAssignedTemplate = ({ name, taskName, projectName }) => `
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <h2>Hi ${name},</h2>
      <p>A new task has been assigned to you.</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Task:</strong> ${taskName}<br/>
        <strong>Project:</strong> ${projectName || 'General'}
      </div>
      <p>Please review and update its status when you begin working on it.</p>
      <a href="https://flowsync.app/my-tasks" style="${buttonStyles}">View My Tasks</a>
    </div>
  </div>
`;
