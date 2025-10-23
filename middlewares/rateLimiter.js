import rateLimit from 'express-rate-limit';

// Rate limiter for login route
// Prevents brute force attacks by limiting login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for all API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});