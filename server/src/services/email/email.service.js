import { Resend } from "resend";
import env from "../../config/env.js";
import {
  welcomeEmailTemplate,
  workspaceInviteTemplate,
  projectInviteTemplate,
  taskAssignedTemplate,
} from "./templates/index.js";

// Initialize Resend safely without crashing if the key is missing during local dev
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const FROM_EMAIL = env.EMAIL_FROM;

/**
 * Core wrapper to send emails via Resend.
 * It's structured as fire-and-forget, catching errors so the main app doesn't crash.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn(`[Email Service] Mock Send to ${to} (Subject: ${subject}). Resend API Key is missing.`);
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Successfully sent email to ${to}. ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error?.message || error);
    return null; // Return null on failure so the caller (controllers) don't crash
  }
};

/**
 * Send a welcome email to newly registered users
 */
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Welcome to FlowSync! 🚀",
    html: welcomeEmailTemplate({ name }),
  });
};

/**
 * Send a clean workspace invitation email
 */
export const sendWorkspaceInviteEmail = async (email, name, workspaceName) => {
  return sendEmail({
    to: email,
    subject: `You've been added to the ${workspaceName} workspace!`,
    html: workspaceInviteTemplate({ name, workspaceName }),
  });
};

/**
 * Send an email when added to a project
 */
export const sendProjectInviteEmail = async (email, name, projectName, workspaceName) => {
  return sendEmail({
    to: email,
    subject: `You've been added to the ${projectName} project!`,
    html: projectInviteTemplate({ name, projectName, workspaceName }),
  });
};

/**
 * Send a notification when a user is assigned to a specific task
 */
export const sendTaskAssignedEmail = async (email, name, taskName, projectName) => {
  return sendEmail({
    to: email,
    subject: `New Task Assigned: ${taskName}`,
    html: taskAssignedTemplate({ name, taskName, projectName }),
  });
};
