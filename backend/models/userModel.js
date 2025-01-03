// /Users/jonatas/Documents/Projects/ai-publisher/backend/models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50 // Validation for name length
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    trim: true,
    lowercase: true // Store email in lowercase for consistency
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum password length
  },
  approved: {
    type: Boolean,
    default: false // Indicates whether the user is approved
  },
  emailVerified: {
    type: Boolean,
    default: false // Indicates whether the email is verified
  },
  verificationToken: String, // Token for email verification
  verificationExpires: Date, // Expiration time for the verification token
  resetPasswordToken: String, // Token for password reset
  resetPasswordExpires: Date, // Expiration time for the reset password token
  lastLogin: Date, // Timestamp for the last login
  loginAttempts: {
    type: Number,
    default: 0 // Tracks failed login attempts
  },
  lockUntil: Date // Account lockout timestamp if too many failed login attempts
}, {
  timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});

// Indexes for optimizing queries
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Middleware to hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip hashing if password is not modified
  try {
    this.password = await bcrypt.hash(this.password, 12); // Hash the password with a salt factor of 12
    next();
  } catch (error) {
    next(error); // Pass errors to the next middleware
  }
});

// Instance method to compare the provided password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Returns true if passwords match
};

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // If the lock has expired, reset loginAttempts and remove lockUntil
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } }; // Increment login attempts
  if (this.loginAttempts + 1 >= 5) { // Lock the account after 5 failed attempts
    updates.$set = { lockUntil: Date.now() + 3600000 }; // Lock for 1 hour
  }
  return this.updateOne(updates); // Apply the updates
};

// Export the User model
module.exports = mongoose.model('User', userSchema);