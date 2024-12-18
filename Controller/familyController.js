const { body, validationResult } = require('express-validator');
const Family = require('../Models/familyModel');

// Create a Family Group
const createFamily = [
    body('name').notEmpty().withMessage('Family name is required'),
    body('createdBy').notEmpty().withMessage('Creator is required'),
  
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const { name, description, createdBy } = req.body;
  
        // Check if the family name already exists
        const existingFamily = await Family.findOne({ name });
        if (existingFamily) {
          return res.status(400).json({ error: 'Family name already exists' });
        }
  
        const family = new Family({
          name,
          description,
          createdBy,
        });
  
        await family.save();
        res.status(201).json({ family });
      } catch (error) {
        // Handle MongoDB duplicate key error (E11000)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
          return res.status(400).json({ error: 'Family name must be unique' });
        }
        res.status(500).json({ error: 'Server error' });
      }
    }
  ];
// Get a Family Group by ID
const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id).populate('members.user', 'username email').populate('admins', 'username email');
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    res.status(200).json({ family });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Family Groups
const getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find().populate('members.user', 'username email').populate('admins', 'username email');
    res.status(200).json({ families });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Family Group
const updateFamily = [
  async (req, res) => {
    try {
      const family = await Family.findById(req.params.id);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      const updates = req.body;
      Object.keys(updates).forEach(key => {
        family[key] = updates[key];
      });

      await family.save();
      res.status(200).json({ family });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Delete a Family Group
const deleteFamily = [
  async (req, res) => {
    try {
      const family = await Family.findByIdAndDelete(req.params.id);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }
      res.status(200).json({ message: 'Family deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

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






// const getFamilyMembersLocation = async (req, res) => {
//   try {
//     const { familyId } = req.params; // Get the family ID from the request parameters

//     // Fetch all users that belong to the specified family
//     const familyMembers = await Family.find({ familyId }).select('firstName lastName location');

//     if (!familyMembers.length) {
//       return res.status(404).json({ message: 'No family members found' });
//     }

//     // Return the family members with their locations
//     res.status(200).json({ members: familyMembers });
//   } catch (error) {
//     console.error('Error fetching family members:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
 
module.exports = {
  createFamily,
  getFamilyById,
  getAllFamilies,
  updateFamily,
  deleteFamily,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin,
  getFamilyMembersLocation,
  addMovieToFamily,
  getFamilyMovies,  
};
