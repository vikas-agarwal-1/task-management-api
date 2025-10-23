import mongoose from 'mongoose';

// Define Token Blacklist Schema
// This stores logged out tokens so they can't be used again
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB will automatically delete expired tokens
  },
});

// Create TokenBlacklist model from schema
const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;