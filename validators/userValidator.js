import { body, param, query, validationResult } from 'express-validator';

// Validation for creating user
export const createUserValidation = [
  // Username validation
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide valid email'),
  
  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  
  // Role validation (optional - will default to 'user')
  body('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role must be user, manager, or admin'),
];

// Validation for updating role
export const updateUserRoleValidation = [
  // User ID validation
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  // Role validation (required)
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role must be user, manager, or admin'),
];

// Validation for assigning user to manager
export const assignUserToManagerValidation = [
  // User ID validation
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  // Manager ID validation
  body('managerId')
    .notEmpty()
    .withMessage('Manager ID is required')
    .isMongoId()
    .withMessage('Invalid manager ID'),
];

// Validation for user ID in URL
export const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

// Validation for getting users with filters
export const getUsersValidation = [
  // Role filter (optional)
  query('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Invalid role'),
  
  // Page number (optional)
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive number'),
  
  // Limit (optional)
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Middleware to check validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  // If validation errors exist
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  // No errors, continue
  next();
};