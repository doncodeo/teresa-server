const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  familyCode: {
    type: String,
    // required: true
  },
  profilePicture: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user'
  },
  location: {
    type: {
      lat: Number,
      lng: Number
    },
    default: null // Location is null if not shared
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family', // Assuming you have a Family model
    required: true
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

const User = mongoose.model('User', userSchema);

module.exports = User;
