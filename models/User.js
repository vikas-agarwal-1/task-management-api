import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't send password in response by default
    },
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
      default: 'user',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Create User model from schema
const User = mongoose.model('User', userSchema);

export default User;