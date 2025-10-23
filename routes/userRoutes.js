import express from 'express';
import {
  createUser,
  updateUserRole,
  assignUserToManager,
  getAllUsers,
  getAllManagers,
  deleteUser,
  getTeamMembers,
  getUserProfile,
} from '../controllers/userController.js';
import {
  createUserValidation,
  updateUserRoleValidation,
  assignUserToManagerValidation,
  userIdValidation,
  getUsersValidation,
  validate,
} from '../validators/userValidator.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
// Team route for managers (must come before admin-only middleware)

/**
 * @swagger
 * /api/users/team:
 *   get:
 *     summary: Get team members (Manager only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 */
router.get('/team', authorize('manager', 'admin'), getTeamMembers);

/**
 * @swagger
 * /api/users/profile/{userId}:
 *   get:
 *     summary: Get user profile by ID (Admin: all, Manager: team only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/profile/:userId', authorize('manager', 'admin'), userIdValidation, validate, getUserProfile);

router.use(authorize('admin'));

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     description: Admin can create users with any role. If role is not provided, user role is assigned by default
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: manager_john
 *               email:
 *                 type: string
 *                 example: manager@example.com
 *               password:
 *                 type: string
 *                 example: Manager@1234
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: manager
 *                 description: Optional - defaults to 'user' if not provided
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/create', createUserValidation, validate, createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, manager, admin]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', getUsersValidation, validate, getAllUsers);

/**
 * @swagger
 * /api/users/managers:
 *   get:
 *     summary: Get all managers (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Managers retrieved successfully
 *       404:
 *         description: No managers found
 */
router.get('/managers', getAllManagers);

/**
 * @swagger
 * /api/users/{userId}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     description: Change existing user's role to user, manager, or admin
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: manager
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:userId/role', updateUserRoleValidation, validate, updateUserRole);

/**
 * @swagger
 * /api/users/assign-to-manager:
 *   post:
 *     summary: Assign user to manager (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     description: Assigns a regular user to a manager. Returns error if no managers exist in system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - managerId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               managerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: User assigned successfully
 *       400:
 *         description: No managers found - create manager first
 *       404:
 *         description: User or manager not found
 */
router.post('/assign-to-manager', assignUserToManagerValidation, validate, assignUserToManager);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:userId', userIdValidation, validate, deleteUser);

export default router;