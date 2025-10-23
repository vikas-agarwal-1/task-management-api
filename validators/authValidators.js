import { body, validationResult } from 'express-validator';

// Validation rules for registration
export const registerValidation = [
  // Username validation
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
];

// Validation rules for login
export const loginValidation = [
  // Identifier (username or email) validation
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  
  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Middleware to check validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  // If there are validation errors
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
  
  // No errors, continue to next middleware
  next();
};