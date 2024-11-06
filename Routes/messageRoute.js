const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../Middleware/adminMiddleware');

const {
    createMessage,
    getMessagesByFamilyId,
    getMessageById,
    updateMessage,
    deleteMessage,
    likeMessage,
    unlikeMessage,
    addComment,
    removeComment
} = require('../Controller/messageController');

/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the message
 *               familyId:
 *                 type: string
 *                 description: ID of the family the message belongs to
 *     responses:
 *       201:
 *         description: Message created successfully
 *       401:
 *         description: Unauthorized
 */
router.route('/')
    .post(protect, createMessage);

/**
 * @swagger
 * /api/message/{familyId}:
 *   get:
 *     summary: Retrieve all messages for a specific family
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *       401:
 *         description: Unauthorized
 */
router.route('/:familyId')
    .get(protect, getMessagesByFamilyId);

/**
 * @swagger
 * /api/message/{messageId}:
 *   get:
 *     summary: Retrieve a specific message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Successfully retrieved the message
 *       404:
 *         description: Message not found
 *   put:
 *     summary: Update a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.route('/:messageId')
    .get(protect, getMessageById)
    .put(protect, updateMessage)
    .delete(protect, isAdmin, deleteMessage);

/**
 * @swagger
 * /api/message/{messageId}/like:
 *   post:
 *     summary: Like a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to like
 *     responses:
 *       200:
 *         description: Message liked successfully
 *       404:
 *         description: Message not found
 */
router.route('/:messageId/like')
    .post(protect, likeMessage);

/**
 * @swagger
 * /api/message/{messageId}/unlike:
 *   post:
 *     summary: Unlike a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to unlike
 *     responses:
 *       200:
 *         description: Message unliked successfully
 *       404:
 *         description: Message not found
 */
router.route('/:messageId/unlike')
    .post(protect, unlikeMessage);

/**
 * @swagger
 * /api/message/{messageId}/comments:
 *   post:
 *     summary: Add a comment to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The comment text
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Message not found
 */
router.route('/:messageId/comments')
    .post(protect, addComment);

/**
 * @swagger
 * /api/message/{messageId}/comments/{commentId}:
 *   delete:
 *     summary: Remove a comment from a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment removed successfully
 *       404:
 *         description: Comment or message not found
 */
router.route('/:messageId/comments/:commentId')
    .delete(protect, removeComment);

module.exports = router;








// const express = require('express');
// const router = express.Router();
// const { protect, isAdmin } = require('../Middleware/adminMiddleware');

// const {
//     createMessage,
//     getMessagesByFamilyId,
//     getMessageById,
//     updateMessage,
//     deleteMessage,
//     likeMessage,
//     unlikeMessage,
//     addComment,
//     removeComment
// } = require('../Controller/messageController');

// // Routes for creating and retrieving messages
// router.route('/')
//     .post(protect, createMessage); // Create a new message 

// router.route('/:familyId')
//     .get(protect, getMessagesByFamilyId); // Get all messages for a family

// // Routes for specific message operations
// router.route('/:messageId')
//     .get(protect, getMessageById) // Get a specific message by ID
//     .put(protect, updateMessage) // Update a message
//     .delete(protect, isAdmin, deleteMessage); // Delete a message

// // Routes for liking and unliking messages
// router.route('/:messageId/like')
//     .post(protect, likeMessage); // Like a message

// router.route('/:messageId/unlike')
//     .post(protect, unlikeMessage); // Unlike a message

// // Routes for adding and removing comments on messages
// router.route('/:messageId/comments')
//     .post(protect, addComment); // Add a comment to a message

// router.route('/:messageId/comments/:commentId')
//     .delete(protect, removeComment); // Remove a comment from a message

// module.exports = router;
