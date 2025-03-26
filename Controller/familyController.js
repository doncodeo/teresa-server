const { body, validationResult } = require('express-validator');
const Family = require('../Models/familyModel');
const asyncHandler = require('express-async-handler');
const { familyCreationMail, familyWelcomeMail, familyLeaveMail } = require('../Middleware/emailServices');
const userData = require('../Models/userModel');
const upload = require('../config/multerConfig');
const cloudinary = require('../config/cloudinaryConfig');

const validRoles = [
  'Father', 'Mother', 'Son', 'Daughter',
  'Cousin', 'Uncle', 'Aunt',
  'Grandparent', 'Sibling', 'Other',
];

const validateRole = (role) => validRoles.includes(role);

const createFamily = [
  body('name').notEmpty().withMessage('Family name is required'),
  body('description').notEmpty().withMessage('Family description is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description } = req.body;
      const createdBy = req.user.id;

      const user = await userData.findById(createdBy);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ error: 'You must verify your account before creating a family.' });
      }

      const existingFamily = await Family.findOne({ name });
      if (existingFamily) {
        return res.status(400).json({ error: 'Family name already exists.' });
      }

      const family = new Family({
        name,
        description,
        createdBy,
        admins: [createdBy],
        members: [{ userId: createdBy, role: 'Other' }],
      });
      await family.save();

      user.familyIds.push(family._id);
      await user.save();

      const joinLink = `${process.env.FRONTEND_URL}/join-family/${family.joinToken}`;
      await familyWelcomeMail(req.user, family, joinLink);

      res.status(201).json({
        family,
        message: 'Family created successfully, and an email has been sent.',
      });
    } catch (error) {
      console.error('Error creating family:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const joinFamily = async (req, res) => {
  try {
    const { token, familyCode, role } = req.body;
    const userId = req.user.id;

    if (!token && !familyCode) {
      return res.status(400).json({ error: 'Either a join token or a family code must be provided.' });
    }

    let family;
    if (token) {
      family = await Family.findOne({ joinToken: token });
      if (!family) {
        return res.status(404).json({ error: 'Invalid or expired join link.' });
      }
    } else if (familyCode) {
      family = await Family.findOne({ familyCode });
      if (!family) {
        return res.status(404).json({ error: 'Invalid family code.' });
      }
    }

    const isMember = family.members.some((member) => member.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this family.' });
    }

    const user = await userData.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    family.members.push({ userId, role: role || 'Other' });
    await family.save();

    user.familyIds.push(family._id);
    await user.save();

    const familyLink = `${process.env.FRONTEND_URL}/family/${family._id}`;
    await familyWelcomeMail(user, family, familyLink);

    res.status(200).json({ message: 'Successfully joined the family group.', family });
  } catch (error) {
    console.error('Error joining family:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const leaveFamilyGroup = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.id;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family group not found.' });
    }

    const memberIndex = family.members.findIndex((member) => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this family group.' });
    }

    const user = await userData.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isAdmin = family.admins.some((adminId) => adminId.toString() === userId);
    if (isAdmin) {
      if (family.admins.length === 1) {
        return res.status(400).json({ error: 'You cannot leave the family group as an admin unless there is another admin.' });
      }
      family.admins = family.admins.filter((adminId) => adminId.toString() !== userId);
    }

    family.members = family.members.filter((member) => member.userId.toString() !== userId);
    await family.save();

    user.familyIds = user.familyIds.filter((id) => id.toString() !== familyId);
    await user.save();

    const familyCode = family.familyCode;
    const familyLink = `${process.env.FRONTEND_URL}/join-family/${family.joinToken}`;
    await familyLeaveMail(user, family, familyLink, familyCode);

    res.status(200).json({ message: 'You have successfully left the family group.' });
  } catch (error) {
    console.error('Error leaving family group:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate({ path: 'members.userId', select: 'firstName lastName username email onlineStatus lastSeen' })
      .populate({ path: 'admins', select: 'firstName lastName username email onlineStatus lastSeen' });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.status(200).json({ family });
  } catch (error) {
    console.error('Error fetching family by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find()
      .populate('members.userId', 'firstName lastName username email')
      .populate('admins', 'firstName lastName username email');

    res.status(200).json({ families });
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await Family.findById(id);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      family[key] = updates[key];
    });

    await family.save();
    res.status(200).json({ family });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateOwnRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const { familyId } = req.params;
    const userId = req.user.id;

    if (!validateRole(newRole)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found.' });
    }

    const member = family.members.find((member) => member.userId.toString() === userId);
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this family.' });
    }

    member.role = newRole;
    await family.save();

    res.status(200).json({ message: 'Role updated successfully.', family });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { memberId, newRole } = req.body;
    const { familyId } = req.params;
    const userId = req.user.id;

    if (!validateRole(newRole)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found.' });
    }

    const isAdmin = family.admins.some((admin) => admin.toString() === userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update roles of other members.' });
    }

    const member = family.members.find((member) => member.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found in this family.' });
    }

    member.role = newRole;
    await family.save();

    res.status(200).json({ message: 'Member role updated successfully.', family });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    res.status(200).json({ message: 'Family deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addMember = [
  async (req, res) => {
    try {
      const { familyId, userId, role } = req.body;

      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const memberExists = family.members.some((member) => member.userId.toString() === userId);
      if (memberExists) {
        return res.status(400).json({ error: 'User is already a member of this family' });
      }

      family.members.push({ userId, role });
      await family.save();

      res.status(200).json({ family });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const removeMember = [
  async (req, res) => {
    try {
      const { familyId, userId } = req.body;

      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const memberIndex = family.members.findIndex((member) => member.userId.toString() === userId);
      if (memberIndex === -1) {
        return res.status(400).json({ error: 'User is not a member of this family' });
      }

      family.members.splice(memberIndex, 1);
      await family.save();

      res.status(200).json({ family });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const addAdmin = async (req, res) => {
  try {
    const { familyId, userId } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const adminExists = family.admins.some((admin) => admin.toString() === userId);
    if (adminExists) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    family.admins.push(userId);
    await family.save();

    res.status(200).json({ family });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { familyId, userId } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const adminIndex = family.admins.findIndex((admin) => admin.toString() === userId);
    if (adminIndex === -1) {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    family.admins.splice(adminIndex, 1);
    await family.save();

    res.status(200).json({ family });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getFamilyMembersLocation = async (req, res) => {
  try {
    const { familyId } = req.params;

    const family = await Family.findById(familyId).populate('members.userId', 'firstName lastName profilePicture location');
    if (!family || !family.members.length) {
      return res.status(404).json({ message: 'No family members found' });
    }

    const membersWithLocation = family.members.map((member) => ({
      userId: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      location: member.userId.location,
    }));

    res.status(200).json({ members: membersWithLocation });
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addMovieToFamily = asyncHandler(async (req, res) => {
  const { familyCode, title, description, link } = req.body;
  const userId = req.user._id;

  try {
    const family = await Family.findOne({ familyCode });
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const newMovie = { title, description, link, addedBy: userId };
    family.movies.push(newMovie);
    await family.save();

    res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const getFamilyMovies = asyncHandler(async (req, res) => {
  const { familyCode } = req.params;

  try {
    const family = await Family.findOne({ familyCode }).populate('movies.addedBy', 'username email');
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.status(200).json({ movies: family.movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const uploadToGallery = [
  (req, res, next) => {
    req.uploadFolder = `family_${req.params.familyId}/gallery`; // Set folder dynamically
    next();
  },
  upload.single('image'),
  async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.id; 

      console.log('Gallery - File details:', {
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        path: req.file?.path, // Cloudinary URL
        filename: req.file?.filename, // Cloudinary public ID
      });

      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const isMember = family.members.some((member) => member.userId.toString() === userId);
      if (!isMember) {
        return res.status(403).json({ error: 'You are not a member of this family' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const imageData = {
        url: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public ID
        uploadedBy: userId,
      };

      family.gallery.push(imageData);
      await family.save();

      res.status(201).json({
        message: 'Image uploaded to gallery successfully',
        image: imageData,
      });
    } catch (error) {
      console.error('Error uploading to gallery:', error.message || error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const updateFamilyProfilePicture = [
  (req, res, next) => {
    req.uploadFolder = `family_${req.params.familyId}/profile`; // Set folder dynamically
    next();
  },
  upload.single('profile'),
  async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.id;

      console.log('Profile - File details:', {
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        path: req.file?.path,
        filename: req.file?.filename,
      });

      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const isAdmin = family.admins.some((admin) => admin.toString() === userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update the profile picture' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Delete old profile picture if it exists
      if (family.profilePicture && family.profilePicture.publicId) {
        await cloudinary.uploader.destroy(family.profilePicture.publicId);
      }

      const profilePictureData = {
        url: req.file.path,
        publicId: req.file.filename,
      };

      family.profilePicture = profilePictureData;
      await family.save();

      res.status(200).json({
        message: 'Profile picture updated successfully',
        profilePicture: profilePictureData,
      });
    } catch (error) {
      console.error('Error updating profile picture:', error.message || error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];











// const uploadToGallery = [
//   upload.single('image'),
//   async (req, res) => {
//     try {
//       const { familyId } = req.params;
//       const userId = req.user.id;

//       console.log('Gallery - File details:', {
//         originalname: req.file?.originalname,
//         mimetype: req.file?.mimetype,
//         size: req.file?.size,
//         hasBuffer: !!req.file?.buffer, // True if buffer exists
//         bufferSample: req.file?.buffer ? req.file.buffer.slice(0, 10).toString('hex') : 'no buffer', // First 10 bytes
//       });

//       const family = await Family.findById(familyId);
//       if (!family) {
//         return res.status(404).json({ error: 'Family not found' });
//       }

//       const isMember = family.members.some((member) => member.userId.toString() === userId);
//       if (!isMember) {
//         return res.status(403).json({ error: 'You are not a member of this family' });
//       }

//       if (!req.file) {
//         return res.status(400).json({ error: 'No image provided' });
//       }

//       const result = await new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream(
//           {
//             folder: `family_${familyId}/gallery`,
//             allowed_formats: ['jpg', 'png', 'jpeg'],
//             public_id: `image-${Date.now()}`,
//           },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         ).end(req.file.buffer);
//       });

//       const imageData = {
//         url: result.secure_url,
//         publicId: result.public_id,
//         uploadedBy: userId,
//       };

//       family.gallery.push(imageData);
//       await family.save();

//       res.status(201).json({
//         message: 'Image uploaded to gallery successfully',
//         image: imageData,
//       });
//     } catch (error) {
//       console.error('Error uploading to gallery:', error.message || error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   },
// ];

// const updateFamilyProfilePicture = [
//   upload.single('profile'),
//   async (req, res) => {
//     try {
//       const { familyId } = req.params;
//       const userId = req.user.id;

//       const family = await Family.findById(familyId);
//       if (!family) {
//         return res.status(404).json({ error: 'Family not found' });
//       }

//       const isAdmin = family.admins.some((admin) => admin.toString() === userId);
//       if (!isAdmin) {
//         return res.status(403).json({ error: 'Only admins can update the profile picture' });
//       }

//       if (!req.file) {
//         return res.status(400).json({ error: 'No image provided' });
//       }

//       const result = await new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream(
//           {
//             folder: `family_${familyId}/profile`,
//             allowed_formats: ['jpg', 'png', 'jpeg'],
//             public_id: `profilePicture-${Date.now()}`,
//           },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         ).end(req.file.buffer);
//       });

//       if (family.profilePicture && family.profilePicture.publicId) {
//         await cloudinary.uploader.destroy(family.profilePicture.publicId);
//       }

//       const profilePictureData = {
//         url: result.secure_url,
//         publicId: result.public_id,
//       };

//       family.profilePicture = profilePictureData;
//       await family.save();

//       res.status(200).json({
//         message: 'Profile picture updated successfully',
//         profilePicture: profilePictureData,
//       });
//     } catch (error) {
//       console.error('Error updating profile picture:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   },
// ];

module.exports = {
  createFamily,
  joinFamily,
  leaveFamilyGroup,
  getFamilyById,
  getAllFamilies,
  updateFamily,
  updateOwnRole,
  updateMemberRole,
  deleteFamily,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin,
  getFamilyMembersLocation,
  addMovieToFamily,
  getFamilyMovies,
  uploadToGallery,
  updateFamilyProfilePicture,
};
