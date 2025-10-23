import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import TokenBlacklist from '../models/TokenBlacklist.js';

// Middleware to protect routes (check if user is logged in)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Please login to access this route',
      });
    }

    // Check if token is blacklisted (user logged out)
    const blacklistedToken = await TokenBlacklist.findOne({ token: token });
    if (blacklistedToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid. Please login again',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');

    // If user not found
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Add user and token to request object
    req.user = user;
    req.token = token;
    
    // Continue to next middleware
    next();
  } catch (error) {
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again',
      });
    }
    
    // Other errors
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};