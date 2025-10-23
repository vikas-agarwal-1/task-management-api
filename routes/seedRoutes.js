import express from 'express';
import { seedAdmin } from '../controllers/seedController.js';

const router = express.Router();

/**
 * @swagger
 * /api/seed/admin:
 *   post:
 *     summary: Create first admin user
 *     tags: [Seed]
 *     description: Creates default admin user. Works only when database is empty. Credentials - email:admin@taskmanagement.com password:Admin@1234
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     credentials:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: admin@taskmanagement.com
 *                         password:
 *                           type: string
 *                           example: Admin@1234
 *       400:
 *         description: Users already exist in database
 */
router.post('/admin', seedAdmin);

export default router;