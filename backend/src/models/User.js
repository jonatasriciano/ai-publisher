// Import required modules
import mongoose from 'mongoose';

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    minlength: 3, 
    maxlength: 30 
  },
  password: { 
    type: String, 
    required: true 
  },
  companyName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'], 
    lowercase: true, 
    trim: true 
  },
  emailConfirmed: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the User model
const User = mongoose.model('User', userSchema);

export default User;