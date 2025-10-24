# Task Management API

A comprehensive RESTful API for task management system with user authentication, role-based access control (RBAC), and email notifications.

## 🚀 Features

- **User Authentication**: Register, Login, Logout with JWT
- **Role-Based Access Control**: Admin, Manager, and User roles
- **Task Management**: Complete CRUD operations with filtering and pagination
- **Task Assignment**: Assign tasks based on roles and team structure
- **Team Management**: Managers can manage their team members
- **Email Notifications**: Welcome emails and task assignment notifications
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Password hashing, JWT tokens, rate limiting, token blacklisting

## 📋 Table of Contents

- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Deployment](#deployment)

## 🛠 Technologies Used

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email Service**: Nodemailer
- **API Documentation**: Swagger (OpenAPI 3.0)
- **Security**: Helmet, CORS, express-rate-limit

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Git

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd task-management-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Or create it manually with the following content:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/task-management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# Email Configuration (Mailtrap recommended for testing)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@taskmanagement.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

## 🗄️ Database Setup

### Local MongoDB

1. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS

2. **Start MongoDB**
```bash
   mongod
```

3. The database `task-management` will be created automatically when you run the application.

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

## 🎯 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

### Initial Admin User

On first startup, an admin user is automatically created:
```
Email: admin@taskmanagement.com
Password: Admin@1234
```


## 📚 API Documentation

Once the server is running, access the interactive API documentation:

**Swagger UI**: http://localhost:5000/api-docs

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests
- Try-it-out functionality

## 👥 User Roles & Permissions

### 🔴 Admin
- Full access to all endpoints
- Create/update/delete users
- Assign users to managers
- View all tasks and profiles
- Assign tasks to anyone
- Manage all tasks (CRUD)

### 🟡 Manager
- Manage team members assigned to them
- View team member profiles only
- View team tasks only
- Assign tasks to team members only
- Update/delete team tasks only
- Create own tasks

### 🟢 User
- Register and manage own profile
- Create own tasks
- View own tasks
- Assign tasks to self only
- Update/delete own tasks only

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/seed/admin` | Public | Create first admin (empty DB only) |
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/logout` | Authenticated | Logout user |
| GET | `/api/auth/profile` | Authenticated | Get own profile |

### User Management (Admin Only)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users/create` | Admin | Create user with role |
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/managers` | Admin | Get all managers |
| GET | `/api/users/team` | Manager/Admin | Get team members |
| GET | `/api/users/profile/:userId` | Manager/Admin | Get user profile by ID |
| PUT | `/api/users/:userId/role` | Admin | Update user role |
| POST | `/api/users/assign-to-manager` | Admin | Assign user to manager |
| DELETE | `/api/users/:userId` | Admin | Delete user |

### Task Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tasks` | Authenticated | Create task |
| GET | `/api/tasks` | Authenticated | Get tasks (filtered by role) |
| GET | `/api/tasks/:id` | Authenticated | Get single task |
| PUT | `/api/tasks/:id` | Creator/Manager/Admin | Update task |
| DELETE | `/api/tasks/:id` | Creator/Manager/Admin | Delete task |
| POST | `/api/tasks/:id/assign` | User/Manager/Admin | Assign task |
| GET | `/api/tasks/assigned/me` | Authenticated | Get my assigned tasks |
| GET | `/api/tasks/assigned/user/:userId` | Manager/Admin | Get user's assigned tasks |

## 🧪 Testing

### Using Postman

1. Import the provided Postman collection
2. Set environment variable `baseUrl` to `http://localhost:5000`
3. Follow this test flow:
```
1. POST /api/seed/admin (if needed)
2. POST /api/auth/login (save token)
3. POST /api/users/create (create manager)
4. POST /api/users/create (create user)
5. POST /api/users/assign-to-manager
6. POST /api/tasks (create task)
7. POST /api/tasks/:id/assign
8. GET /api/tasks
```

### Manual Testing Flow

#### 1. Create Admin
```bash
# Automatic on first startup
# Or manually:
POST http://localhost:5000/api/seed/admin
```

#### 2. Login as Admin
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "identifier": "admin@taskmanagement.com",
  "password": "Admin@1234"
}
```

#### 3. Create Manager
```bash
POST http://localhost:5000/api/users/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "manager1",
  "email": "manager@example.com",
  "password": "Manager@1234",
  "role": "manager"
}
```

#### 4. Create User
```bash
POST http://localhost:5000/api/users/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "user1",
  "email": "user@example.com",
  "password": "User@1234"
}
```

#### 5. Assign User to Manager
```bash
POST http://localhost:5000/api/users/assign-to-manager
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "<user_id>",
  "managerId": "<manager_id>"
}
```

## 📁 Project Structure
```
task-management-api/
├── config/
│   ├── database.js          # Database connection
│   └── swagger.js            # API documentation config
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── seedController.js     # Admin seeding
│   ├── taskController.js     # Task management
│   └── userController.js     # User management
├── middlewares/
│   ├── auth.js               # JWT authentication
│   ├── authorize.js          # Role-based authorization
│   ├── errorHandler.js       # Error handling
│   └── rateLimiter.js        # Rate limiting
├── models/
│   ├── User.js               # User schema
│   ├── Task.js               # Task schema
│   └── TokenBlacklist.js     # Token blacklist schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── seedRoutes.js         # Seed endpoints
│   ├── taskRoutes.js         # Task endpoints
│   └── userRoutes.js         # User endpoints
├── services/
│   └── emailService.js       # Email service
├── utils/
│   ├── customError.js        # Custom error class
│   └── jwt.js                # JWT utilities
├── validators/
│   ├── authValidator.js      # Auth validation
│   ├── taskValidator.js      # Task validation
│   └── userValidator.js      # User validation
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
├── README.md                 # Documentation
└── server.js                 # Entry point
```

## 💡 Design Decisions

### 1. **Team-Based Architecture**
- Users have a `managerId` field linking them to their manager
- Managers can only access resources belonging to their team members
- Admin has unrestricted access across all teams

### 2. **Token Blacklisting**
- Implemented secure logout using token blacklist
- Expired tokens are automatically removed via MongoDB TTL index
- Prevents token reuse after logout

### 3. **Auto-Seeding Admin**
- Admin user created automatically on first startup
- Eliminates manual database manipulation
- Provides immediate system access

### 4. **Rate Limiting**
- Login endpoint limited to 5 attempts per 15 minutes
- Prevents brute-force attacks
- Configurable via environment variables

### 5. **Role-Based Filtering**
- Database queries automatically filtered based on user role
- Ensures data isolation between teams
- Maintains performance with proper indexing

### 6. **Email Notifications**
- Asynchronous email sending (non-blocking)
- Graceful failure handling (logs errors, doesn't break API)
- Mailtrap recommended for testing

## 🚀 Deployment
The project is currently running locally.  
It can be easily deployed to platforms like **Render**, **Railway**, or **Vercel** by setting the required environment variables in the hosting service.

### Prerequisites for Deployment

1. MongoDB Atlas account (or hosted MongoDB)
2. Email service credentials (SendGrid, Mailgun, etc.)
3. Cloud hosting platform account

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Deploy to Render

1. Create new Web Service
2. Connect repository
3. Add environment variables
4. Deploy

### Production Checklist

- [ ] Use strong JWT_SECRET
- [ ] Configure production database
- [ ] Set up production email service
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 📝 Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 5000 | No |
| NODE_ENV | Environment | development | No |
| MONGODB_URI | MongoDB connection | - | Yes |
| JWT_SECRET | JWT signing key | - | Yes |
| JWT_EXPIRE | Token expiration | 24h | Yes |
| EMAIL_HOST | SMTP host | - | Yes |
| EMAIL_PORT | SMTP port | 587 | Yes |
| EMAIL_USER | SMTP username | - | Yes |
| EMAIL_PASSWORD | SMTP password | - | Yes |
| EMAIL_FROM | Sender email | - | Yes |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 | No |
| RATE_LIMIT_MAX_REQUESTS | Max requests | 5 | No |

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running (`mongod`)

### JWT Token Error
```
Error: Invalid token
```
**Solution**: Token may be expired or blacklisted. Login again.

### Email Not Sending
```
Email error: ...
```
**Solution**: Check EMAIL_* environment variables. For testing, use Mailtrap.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env or kill process using port 5000

## 📞 Support

For issues or questions:
- Check API documentation at `/api-docs`
- Review this README
- Check error messages in console
- Verify environment variables

## 📄 License

ISC

## 👨‍💻 Author

Vikas Agarwal

---

**Last Updated**: 24 Oct 2025