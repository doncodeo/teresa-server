// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true
//   },
//   lastName: {
//     type: String,
//     required: true
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   familyCode: {
//     type: String,
//     // required: true
//   },
//   profilePicture: String,
//   role: {
//     type: String,
//     enum: ['user', 'admin', 'superAdmin'],
//     default: 'user'
//   },
//   location: {
//     type: {
//       lat: Number,
//       lng: Number
//     },
//     default: null // Location is null if not shared
//   },
//   familyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Family', // Assuming you have a Family model
//     // required: true
//   },
  
// }, {
//   timestamps: true // Adds createdAt and updatedAt fields automatically
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    familyCode: {
      type: String,
      default: null, // Optional family code
    },
    profilePicture: {
      type: String,
      default: null, // Optional profile picture URL
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
    },
    location: {
      type: {
        lat: Number,
        lng: Number,
      },
      default: null, // Location is null if not shared
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family', // Reference to the Family model
      default: null,
    },
  
    isVerified: {
      type: Boolean,
      default: false, // Users are not verified by default
    },
    verificationCode: {
      type: String,
      default: null, // Will store the email verification code
    },
    verificationCodeExpiration: {
      type: Date,
      default: null, // Expiration time for the verification code
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

