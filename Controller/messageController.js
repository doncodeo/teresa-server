const { body, validationResult } = require('express-validator');
const Message = require('../Models/messageModel');
const Family = require('../Models/familyModel');
const User = require('../Models/userModel');

// Create a new message

const createMessage = [
  body('content').notEmpty().withMessage('Content is required'),
  body('familyId').notEmpty().withMessage('Family ID is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content, familyId } = req.body;
      const userId = req.user ? req.user._id : null;

      // console.log('req.user:', req.user); // Debug statement

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if family exists
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      // Create the message
      const message = new Message({
        sender: userId,
        content,
        familyId
      });

      await message.save();
      res.status(201).json({ message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// const createMessage = [
//   body('content').notEmpty().withMessage('Content is required'),
//   body('familyId').notEmpty().withMessage('Family ID is required'),

//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { content, familyId } = req.body;
//       const userId = req.user._id; 

//       console.log('Request body:', req.body);  // Log request body
//       console.log('User ID:', userId);  // Log user ID

//       // Check if family exists
//       const family = await Family.findById(familyId);
//       if (!family) {
//         return res.status(404).json({ error: 'Family not found' });
//       }

//       // Check if user exists
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       // Create the message
//       const message = new Message({
//         sender: userId,
//         content,
//         familyId
//       });

//       await message.save();
//       res.status(201).json({ message });
//     } catch (error) {
//       console.error('Server error:', error);  // Log server error
//       res.status(500).json({ error: 'Server error' });
//     }
//   }
// ];

// Get all messages for a family
const getMessagesByFamilyId = async (req, res) => {
  try {
    const { familyId } = req.params;

    // Check if family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const messages = await Message.find({ familyId }).populate('sender', 'username email').populate('comments.user', 'username email');
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific message by ID
const getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId).populate('sender', 'username email').populate('comments.user', 'username email');
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only update your own messages' });
    }

    message.content = content;
    await message.save();

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if the user is an admin or the owner of the message
    const family = await Family.findById(message.familyId);
    const isAdmin = family.admins.includes(userId);

    if (message.sender.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own messages or be an admin' });
    }

    await message.remove();
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Like a message
const likeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have already liked this message' });
    }

    message.likes.push(userId);
    await message.save();

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Unlike a message
const unlikeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const likeIndex = message.likes.indexOf(userId);
    if (likeIndex === -1) {
      return res.status(400).json({ error: 'You have not liked this message' });
    }

    message.likes.splice(likeIndex, 1);
    await message.save();

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a comment to a message
const addComment = [
  body('content').notEmpty().withMessage('Content is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      message.comments.push({ user: userId, content });
      await message.save();

      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Remove a comment from a message
const removeComment = async (req, res) => {
  try {
    const { messageId, commentId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const commentIndex = message.comments.findIndex(comment => comment._id.toString() === commentId && comment.user.toString() === userId.toString());
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found or you do not have permission to delete this comment' });
    }

    message.comments.splice(commentIndex, 1);
    await message.save();

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createMessage,
  getMessagesByFamilyId,
  getMessageById,
  updateMessage,
  deleteMessage,
  likeMessage,
  unlikeMessage,
  addComment,
  removeComment
};
