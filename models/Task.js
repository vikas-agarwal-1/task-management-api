import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Due date should be in the future
          return !value || value >= new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be pending, in-progress, or completed',
      },
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

// Method to check if user can access this task
taskSchema.methods.canAccess = function (userId, userRole) {
  if (userRole === 'admin') return true;
  
  // User can access if they created it or it's assigned to them
  return (
    this.createdBy.toString() === userId.toString() ||
    (this.assignedTo && this.assignedTo.toString() === userId.toString())
  );
};

const Task = mongoose.model('Task', taskSchema);

export default Task;