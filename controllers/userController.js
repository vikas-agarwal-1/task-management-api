import User from '../models/User.js';

// Admin creates new user (can specify role, default is 'user')
export const createUser = async (req, res) => {
  try {
    // Get data from request
    const { username, email, password, role } = req.body;

    // If role not provided, use 'user' as default
    const userRole = role || 'user';

    // Check if role is valid
    const validRoles = ['user', 'manager', 'admin'];
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be user, manager, or admin',
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists',
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    // Create new user
    const newUser = await User.create({
      username: username,
      email: email,
      password: password,
      role: userRole,
      isEmailConfirmed: true,
    });

    // Send success response
    res.status(201).json({
      status: 'success',
      message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} created successfully`,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
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

// Admin updates existing user's role
export const updateUserRole = async (req, res) => {
  try {
    // Get user ID from URL
    const userId = req.params.userId;
    
    // Get new role from request body
    const { role } = req.body;

    // Check if role is valid
    const validRoles = ['user', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be user, manager, or admin',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Admin cannot change their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot change your own role',
      });
    }

    // Update the role
    user.role = role;
    await user.save();

    // Send success response
    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role} successfully`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
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

// Admin assigns user to manager
export const assignUserToManager = async (req, res) => {
  try {
    // Get IDs from request body
    const { userId, managerId } = req.body;

    // First, check if any manager exists in the system
    const managerCount = await User.countDocuments({ role: 'manager' });
    if (managerCount === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No managers found in system. Please create a manager first using POST /api/users/create with role: manager',
      });
    }

    // Check if specified manager exists
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        status: 'error',
        message: 'Manager not found',
      });
    }

    // Check if the user is actually a manager
    if (manager.role !== 'manager') {
      return res.status(400).json({
        status: 'error',
        message: 'The specified user is not a manager',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if user is a regular user (not manager or admin)
    if (user.role !== 'user') {
      return res.status(400).json({
        status: 'error',
        message: 'Only regular users can be assigned to managers',
      });
    }

    // Check if user is already assigned to a manager
    if (user.managerId) {
      return res.status(400).json({
        status: 'error',
        message: `This user is already assigned to another manager. Please unassign first.`,
        currentManager: {
          id: user.managerId,
        },
      });
    }

    // Assign user to manager
    user.managerId = managerId;
    await user.save();

    // Assignment successful
    res.status(200).json({
      status: 'success',
      message: 'User assigned to manager successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          managerId: user.managerId,
        },
        manager: {
          id: manager._id,
          username: manager.username,
          email: manager.email,
          role: manager.role,
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

// Admin gets all users
export const getAllUsers = async (req, res) => {
  try {
    // Get filters from query params
    const { role, page, limit } = req.query;

    // Create filter object
    let filter = {};
    if (role) {
      filter.role = role;
    }

    // Setup pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get users from database
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Count total users
    const total = await User.countDocuments(filter);

    // Send response
    res.status(200).json({
      status: 'success',
      data: {
        users: users,
        pagination: {
          total: total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
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

// Admin gets all managers
export const getAllManagers = async (req, res) => {
  try {
    // Find all managers
    const managers = await User.find({ role: 'manager' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Check if any managers exist
    if (managers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No managers found. Create a manager using POST /api/users/create with role: manager',
      });
    }

    // Send response
    res.status(200).json({
      status: 'success',
      data: {
        managers: managers,
        count: managers.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Admin deletes user
export const deleteUser = async (req, res) => {
  try {
    // Get user ID from URL
    const userId = req.params.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Cannot delete own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account',
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Manager gets their team members
export const getTeamMembers = async (req, res) => {
  try {
    // Find all users assigned to this manager
    const teamMembers = await User.find({ managerId: req.user._id })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        teamMembers: teamMembers,
        count: teamMembers.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get user profile by ID (Admin: all, Manager: team only)
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check permissions
    if (req.user.role === 'manager') {
      // Manager can only view their team members
      if (user.managerId?.toString() !== req.user._id.toString() && 
          userId !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only view your team members profiles',
        });
      }
    }

    // Admin can view anyone, users handled by /auth/profile route

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          managerId: user.managerId,
          isEmailConfirmed: user.isEmailConfirmed,
          createdAt: user.createdAt,
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