const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user' },
    location: {
      type: { lat: Number, lng: Number },
      default: null,
    },
    familyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Family' }],
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationCodeExpiration: { type: Date, default: null },
    
    // New fields for online tracking
    onlineStatus: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    socketId: { type: String, default: null }, // Track user's WebSocket session
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;


