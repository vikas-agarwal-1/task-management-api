// Middleware to check user role (Role-Based Access Control)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be added by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Please login first',
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Role '${req.user.role}' is not allowed to access this route`,
      });
    }

    // User has correct role, continue
    next();
  };
};