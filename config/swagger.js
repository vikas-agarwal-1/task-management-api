import swaggerJsdoc from 'swagger-jsdoc';

// Swagger configuration options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A RESTful API for task management with authentication and role-based access control',
      contact: {
        name: 'API Support',
        email: 'support@taskmanagement.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['user', 'manager', 'admin'],
              description: 'User role',
            },
            isEmailConfirmed: {
              type: 'boolean',
              description: 'Email confirmation status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task ID',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Task description',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed'],
            },
            createdBy: {
              type: 'object',
              description: 'User who created the task',
            },
            assignedTo: {
              type: 'object',
              description: 'User assigned to the task',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Seed',
        description: 'Database seeding - Create first admin',
      },
      {
        name: 'Authentication',
        description: 'User authentication (register, login, logout)',
      },
      {
        name: 'User Management',
        description: 'User management endpoints (Admin only)',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to route files
};

// Generate swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;