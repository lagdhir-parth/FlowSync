import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in progress", "review", "done"],
      default: "todo",
      required: true,
    },
    deadline: {
      type: Date,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    order: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;

// TODO: Add subtasks as a separate collection with reference to parent task for better scalability and querying.
// subtasks: [
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     completed: {
//       type: Boolean,
//       default: false,
//     },
//   },
// ],
