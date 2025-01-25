const { body, validationResult } = require('express-validator');
const Family = require('../Models/familyModel');
const asyncHandler = require ('express-async-handler'); 
const {familyCreationMail, familyWelcomeMail, familyLeaveMail} = require('../Middleware/emailServices');
const userData = require('../Models/userModel');

const validRoles = [
  'Father', 'Mother', 'Son', 'Daughter', 
  'Cousin', 'Uncle', 'Aunt', 
  'Grandparent', 'Sibling', 'Other'
];

const validateRole = (role) => validRoles.includes(role);

// Create a Family Group
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
      const createdBy = req.user.id; // Ensure `req.user` is populated

      // Fetch user details
      const user = await userData.findById(createdBy);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          error: 'You must verify your account before creating a family.',
        });
      }

      // Check if the family name already exists
      const existingFamily = await Family.findOne({ name });
      if (existingFamily) {
        return res.status(400).json({ error: 'Family name already exists.' });
      }

      // Create the family and add the creator as an admin
      const family = new Family({
        name,
        description,
        createdBy,
        admins: [createdBy],
        members: [{ userId: createdBy, role: 'Other' }],
      });
      await family.save();

      // Update the user's familyIds (push the new family ID)
      user.familyIds.push(family._id);
      await user.save();

      // Generate a join link
      const joinLink = `${process.env.FRONTEND_URL}/join-family/${family.joinToken}`;

      // Send the email with the join link
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
    const { token, familyCode, role } = req.body; // Accept token, familyCode, and role
    const userId = req.user.id; // User attempting to join

    if (!token && !familyCode) {
      return res.status(400).json({
        error: 'Either a join token or a family code must be provided.',
      });
    }

    let family;

    // Find the family by the provided token or family code
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

    // Check if the user is already a member of the family
    const isMember = family.members.some(
      (member) => member.userId.toString() === userId
    );
    if (isMember) {
      return res.status(400).json({
        error: 'User is already a member of this family.',
      });
    }

    // Fetch user details
    const user = await userData.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Add the user to the family with the provided or default role
    family.members.push({
      userId,
      role: role || 'Other', // Default to 'Other' if no role is provided
    });
    await family.save();

    // Update the user's familyIds (push the new family ID)
    user.familyIds.push(family._id);
    await user.save();

    // Generate the family group link
    const familyLink = `${process.env.FRONTEND_URL}/family/${family._id}`;

    // Send welcome email
    await familyWelcomeMail(user, family, familyLink);

    res.status(200).json({
      message: 'Successfully joined the family group.',
      family,
    });
  } catch (error) {
    console.error('Error joining family:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const leaveFamilyGroup = async (req, res) => {
  try {
    const { familyId } = req.params; // Family group ID
    const userId = req.user.id; // Extracted from the authenticated user

    // Find the family by ID
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family group not found.' });
    }

    // Check if the user is a member of the family
    const memberIndex = family.members.findIndex(
      (member) => member.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this family group.' });
    }

    // Fetch user details
    const user = await userData.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the user is an admin
    const isAdmin = family.admins.some((adminId) => adminId.toString() === userId);

    if (isAdmin) {
      // Ensure there is at least one other admin in the group
      if (family.admins.length === 1) {
        return res.status(400).json({
          error: 'You cannot leave the family group as an admin unless there is another admin in the group.',
        });
      }

      // Remove the user from the admins list
      family.admins = family.admins.filter((adminId) => adminId.toString() !== userId);
    }

    // Remove the user from the members list
    family.members = family.members.filter(
      (member) => member.userId.toString() !== userId
    );

    await family.save();

    // Remove the `familyId` from the user's familyIds array
    user.familyIds = user.familyIds.filter(
      (id) => id.toString() !== familyId
    );
    await user.save();

    // Prepare the family code and family link
    const familyCode = family.familyCode;
    const familyLink = `${process.env.FRONTEND_URL}/join-family/${family.joinToken}`;

    // Send the leave email with the family code and link
    await familyLeaveMail(user, family, familyLink, familyCode);

    res.status(200).json({ message: 'You have successfully left the family group.' });
  } catch (error) {
    console.error('Error leaving family group:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate('members.userId', 'firstName lastName username email') // Correct path for members
      .populate('admins', 'firstName lastName username email');        // Correct path for admins

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.status(200).json({ family });
  } catch (error) {
    console.error('Error fetching family by ID:', error); // Log the actual error
    res.status(500).json({ error: 'Server error' });
  }
};
const getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find()
      .populate('members.userId', 'firstName lastName username email') // Populate members' details
      .populate('admins', 'firstName lastName username email');        // Populate admins' details

    res.status(200).json({ families });
  } catch (error) {
    console.error('Error fetching families:', error); // Log detailed error
    res.status(500).json({ error: 'Server error' });
  }
}; 
 
// Update a Family Group
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
    const { newRole } = req.body; // Only the role is needed in the body
    const { familyId } = req.params; // Retrieve familyId from URL params
    const userId = req.user.id; // Assumes user ID is set by authentication middleware

    if (!validateRole(newRole)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    // Find the family
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found.' });
    }

    // Check if the user is a member of the family
    const member = family.members.find((member) => member.userId.toString() === userId);
    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this family.' });
    }

    // Update the user's role
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

    // Find the family
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found.' });
    }

    // Check if the user is an admin of the family
    const isAdmin = family.admins.some((admin) => admin.toString() === userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update roles of other members.' });
    }

    // Find the member to update
    const member = family.members.find((member) => member.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found in this family.' });
    }

    // Update the member's role
    member.role = newRole;
    await family.save();

    res.status(200).json({ message: 'Member role updated successfully.', family });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Delete a Family Group
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

// Add a Member to a Family Group
const addMember = [
  async (req, res) => {
    try {
      const { familyId, userId, role } = req.body;

      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const memberExists = family.members.some(member => member.user.toString() === userId);
      if (memberExists) {
        return res.status(400).json({ error: 'User is already a member of this family' });
      }

      family.members.push({ user: userId, role });
      await family.save();

      res.status(200).json({ family });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Remove a Member from a Family Group
const removeMember = [
    async (req, res) => {
      try {
        const { familyId, userId } = req.body;
  
        const family = await Family.findById(familyId);
        if (!family) {
          return res.status(404).json({ error: 'Family not found' });
        }
  
        const memberIndex = family.members.findIndex(member => member.user.toString() === userId);
        if (memberIndex === -1) {
          return res.status(400).json({ error: 'User is not a member of this family' });
        }
  
        family.members.splice(memberIndex, 1);
        await family.save();
  
        res.status(200).json({ family });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  ];
  
// Add an Admin to a Family Group
const addAdmin = async (req, res) => {
  try {
    const { familyId, userId } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const adminExists = family.admins.some(admin => admin.toString() === userId);
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

// Remove an Admin from a Family Group
const removeAdmin = async (req, res) => {
  try {
    const { familyId, userId } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const adminIndex = family.admins.findIndex(admin => admin.toString() === userId);
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
    const { familyId } = req.params; // Get the family ID from the request parameters

    // Fetch the family by its ID, including members
    const family = await Family.findById(familyId).populate('members.userId', 'firstName lastName profilePicture location');

    if (!family || !family.members.length) {
      return res.status(404).json({ message: 'No family members found' });
    }

    // Create an array of members with their location data
    const membersWithLocation = family.members.map(member => ({
      userId: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      location: member.userId.location
    })); 

    // Return the family members with their locations
    res.status(200).json({ members: membersWithLocation });
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 

// Add movie to Family 
const addMovieToFamily = asyncHandler(async (req, res) => {
  const { familyCode, title, description, link } = req.body;
  const userId = req.user._id; // Assumes authentication middleware adds `req.user`

  try {
    const family = await Family.findOne({ familyCode });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const newMovie = {
      title,
      description,
      link,
      addedBy: userId,
    };

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
};
