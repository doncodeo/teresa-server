const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const userData = require('../Models/userModel');
const Family = require('../Models/familyModel');
const nodemailer = require('nodemailer');
const {
  verificationmail,
  sendWelcomeMail,
  resendVerificationMail
} = require('../Middleware/emailServices');

// Register User with Validation

const registerUser = [
  // Validation middleware
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('familyCode').optional().isString().withMessage('Family code must be a string'),

  // Controller logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, firstName, lastName, familyCode } = req.body;

      // Check if the user already exists
      const existingEmail = await userData.findOne({ email });
      const existingUsername = await userData.findOne({ username });

      if (existingEmail) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }

      if (existingUsername) {
        return res.status(400).json({ message: 'User already exists with this username.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification details
      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const verificationCodeExpiration = Date.now() + 30 * 60 * 1000; // 30 minutes

      // Create the user (familyId is null for now)
      const newUser = await userData.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isVerified: false,
        verificationCode,
        verificationCodeExpiration,
        familyId: null, // Will be updated if familyCode is valid
      });

      // If a familyCode is provided, validate it and add the user to the family
      if (familyCode) {
        const family = await Family.findOne({ familyCode });
        if (!family) {
          return res.status(400).json({ message: 'Invalid family code.' });
        }

        // Assign user to the family
        newUser.familyId = family._id;
        await newUser.save();

        // Add user to the family members
        family.members.push({ userId: newUser._id, role: 'Other' }); // Default role: Other
        await family.save();
      }

      // Send verification email
      await verificationmail(newUser, verificationCode);

      res.status(201).json({
        message: 'User registered successfully. Verification email sent.',
        userId: newUser._id, 
      });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  },
];

// const registerUser = [
//   // Validation rules
//   body('username').notEmpty().withMessage('Username is required'),
//   body('email').isEmail().withMessage('Email is invalid'),
//   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
//   body('firstName').notEmpty().withMessage('First name is required'),
//   body('lastName').notEmpty().withMessage('Last name is required'),
//   body('familyCode').optional().isString().withMessage('Family code must be a string'),

//   // Controller logic
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { username, email, password, firstName, lastName, familyCode } = req.body;

//       // Check for existing user by email or username
//       const userExistByEmail = await userData.findOne({ email });
//       const userExistByUsername = await userData.findOne({ username });

//       if (userExistByEmail) {
//         return res.status(400).json({ error: 'User already exists with this email.' });
//       }

//       if (userExistByUsername) {
//         return res.status(400).json({ error: 'User already exists with this username.' });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Create the user initially without familyId
//       const user = await userData.create({
//         username,
//         email,
//         password: hashedPassword,
//         firstName,
//         lastName,
//         familyId: null, // Set to null initially
//       });

//       // If a family code is provided, find the family and add the user to it
//       if (familyCode) {
//         const family = await Family.findOne({ familyCode });
//         if (family) {
//           // Update user's familyId and save
//           user.familyId = family._id;
//           await user.save();

//           // Add user to family members and save family
//           family.members.push({ userId: user._id, role: 'Other' }); // Adjust role as needed
//           await family.save();
//         } else {
//           return res.status(400).json({ error: 'Invalid family code.' });
//         }
//       }

//       // Send confirmation email
//       await registrationConfirmation(user);
     
//       res.status(201).json({ user });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   },
// ];

// Login User with Validation



const verifyUser = async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;

    // Find the user by ID and verification code
    const user = await userData.findOne({ _id: userId, verificationCode });

    // Check if the user exists and the verification code has not expired
    if (!user || user.verificationCodeExpiration < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = null; // Clear the verification code
    user.verificationCodeExpiration = null; // Clear the expiration
    await user.save();

    // Send welcome email
    await sendWelcomeMail(user);

    res.status(200).json({ message: 'Account verified successfully. Welcome email sent!' });
  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await userData.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Generate a new verification code and expiration time
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30); // 30 minutes validity

    // Update user with new verification code and expiration time
    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = expirationTime;
    await user.save();

    // Send verification email
    await resendVerificationMail(user, verificationCode);

    res.status(200).json({
      message: 'Verification code resent successfully. Please check your email.',
    });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ message: 'Server error while resending verification code.' });
  }
};
  
// Controller for user login

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await userData.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      // expiresIn: '30d', // Token expires in 30 days
      expiresIn: process.env.JWT_EXPIRATION,
    });
    res.status(200).json({ user, token });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  try {
    // Find the user by ID
    let user = await userData.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Exclude sensitive fields from updates
    delete updates.password;

    // Update user fields
    for (const key in updates) {
      user[key] = updates[key];
    }

    // Save the updated user
    user = await user.save();

    // Omit sensitive fields from response
    user.password = undefined;

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Controller for deleting a user
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const deletedUser = await userData.findByIdAndDelete(userId);

  if (deletedUser) {
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Controller for getting all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userData.find();
  res.status(200).json({ users });
});

// Controller for getting a particular user by id
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await userData.findById(userId);

  if (user) {
    res.status(200).json({ user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update User Location
const updateLocation = [
  body('lat').notEmpty().withMessage('Latitude is required'),
  body('lng').notEmpty().withMessage('Longitude is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { lat, lng } = req.body;
      const userId = req.params.id;

      const user = await userData.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.location = { lat, lng };
      await user.save();

      res.status(200).json({ message: 'Location updated successfully', location: user.location });
    } catch (error) {
      console.error('Error updating location:', error); // Log the error for debugging
      res.status(500).json({ error: 'Server error', details: error.message }); // Include details in response for better understanding
    }
  }
];

// Get User Location
const getUserLocation = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userData.findById(userId).select('location');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.location) {
      return res.status(400).json({ error: 'Location not available' });
    }

    res.status(200).json({ location: user.location });
  } catch (error) {
    console.error('Error retrieving user location:', error); // Log the error for debugging
    res.status(500).json({ error: 'Server error', details: error.message }); // Include details in response for better understanding
  }
};


module.exports = { 
  registerUser,
  verifyUser,
  resendVerification,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateLocation,
  getUserLocation
};
