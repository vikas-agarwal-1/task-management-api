import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendTaskAssignmentEmail } from '../services/emailService.js';

// Create new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get all tasks with filters
export const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy, order, page, limit } = req.query;

    // Build filter object
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'user') {
        // Users can only see their own tasks
        filter.$or = [
          { createdBy: req.user._id },
          { assignedTo: req.user._id },
        ];
      } else if (req.user.role === 'manager') {
        // Managers can see their team's tasks
        // First, get all team member IDs
        const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
        const teamMemberIds = teamMembers.map(member => member._id);
        
        // Add manager's own ID
        teamMemberIds.push(req.user._id);
        
        // Filter tasks created by or assigned to team members
        filter.$or = [
          { createdBy: { $in: teamMemberIds } },
          { assignedTo: { $in: teamMemberIds } },
      ];
    }
    // Admin can see all tasks (no filter needed)

    // Apply status filter
    if (status) {
      filter.status = status;
    }

    // Apply priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Sorting
    let sortOption = {};
    if (sortBy) {
      sortOption[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOption.createdAt = -1; // Default sort by creation date
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    // Get tasks
    const tasks = await Task.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    // Get total count
    const total = await Task.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Check if user can access this task
    const canAccess = task.canAccess(req.user._id, req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this task',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Check permissions
    let canUpdate = req.user.role === 'admin' || task.createdBy.toString() === req.user._id.toString();

    // If manager, check if task belongs to team member
    if (req.user.role === 'manager' && !canUpdate) {
      const taskCreator = await User.findById(task.createdBy);
      const taskAssignee = task.assignedTo ? await User.findById(task.assignedTo) : null;
      
      canUpdate = (taskCreator?.managerId?.toString() === req.user._id.toString()) || (taskAssignee?.managerId?.toString() === req.user._id.toString());
    }

    if (!canUpdate) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this task',
      });
    }

    // Update task fields
    const { title, description, dueDate, priority, status } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;

    await task.save();

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Check permissions
    let canDelete = req.user.role === 'admin' || task.createdBy.toString() === req.user._id.toString();

    // If manager, check if task belongs to team member
    if (req.user.role === 'manager' && !canDelete) {
      const taskCreator = await User.findById(task.createdBy);
      
      canDelete = taskCreator?.managerId?.toString() === req.user._id.toString();
    }

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this task',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Assign task to user
export const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    // Check if user exists
    const userToAssign = await User.findById(userId);
    if (!userToAssign) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check permissions (only manager and admin can assign)
    if (req.user.role === 'user') {
      // Users can only assign tasks to themselves
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only assign tasks to yourself',
        });
      }
    }

    // If manager, check if user is in their team
    if (req.user.role === 'manager') {
      if (userToAssign.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only assign tasks to your team members',
        });
      }
    }

    // Update task assignment
    task.assignedTo = userId;
    await task.save();

    // Send email notification
    sendTaskAssignmentEmail(
      userToAssign.email,
      task.title,
      req.user.username
    );

    res.status(200).json({
      status: 'success',
      message: 'Task assigned successfully',
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get tasks assigned to current user
export const getMyAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get tasks assigned to specific user (for managers/admin)
export const getUserAssignedTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const tasks = await Task.find({ assignedTo: userId })
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};