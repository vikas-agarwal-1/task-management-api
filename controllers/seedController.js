import User from '../models/User.js';

// Create first admin user (works only on empty database)
export const seedAdmin = async (req, res) => {
  try {
    // Count how many users exist in database
    const userCount = await User.countDocuments();

    // If users already exist, don't allow seeding
    if (userCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Users already exist. Seed can only be used on empty database.',
      });
    }

    // Create default admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@taskmanagement.com',
      password: 'Admin@1234',
      role: 'admin',
      isEmailConfirmed: true,
    });

    // Send success response with credentials
    res.status(201).json({
      status: 'success',
      message: 'Admin user created successfully',
      data: {
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        credentials: {
          email: 'admin@taskmanagement.com',
          password: 'Admin@1234',
          note: 'Please login with these credentials and change password',
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