import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import errorHandler from './middlewares/errorHandler.js';
import swaggerSpec from './config/swagger.js';
import seedRoutes from './routes/seedRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Create express app
const app = express();

// Connect to MongoDB database and auto-seed admin
connectDB().then(async () => {
  // Auto-seed admin if database is empty
  const User = (await import('./models/User.js')).default;
  const userCount = await User.countDocuments();
  
  if (userCount === 0) {
    await User.create({
      username: 'admin',
      email: 'admin@taskmanagement.com',
      password: 'Admin@1234',
      role: 'admin',
      isEmailConfirmed: true,
    });
    
    console.log('✅ Admin user created automatically');
    console.log('📧 Email: admin@taskmanagement.com');
    console.log('🔑 Password: Admin@1234');
  }
});

// Use security middlewares
app.use(helmet()); // Adds security headers
app.use(cors()); // Allows cross-origin requests

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/seed', seedRoutes); // Seed routes (create first admin)
app.use('/api/auth', authRoutes); // Authentication routes (register, login, logout)
app.use('/api/users', userRoutes); // User management routes (admin only)
app.use('/api/tasks', taskRoutes); // Task routes

// Health check route - to test if server is running
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - route not found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler - must be last middleware
app.use(errorHandler);

// Get port from environment or use 5000
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});