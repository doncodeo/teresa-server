const express = require('express');
const router = express.Router();
const { 
    protect,
    isAdmin,
    adminOnly
 } = require('../Middleware/adminMiddleware');

const {
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
    getFamilyMovies
} = require('../Controller/familyController');

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Create a new family group
 *     tags: [Families]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the family group
 *     responses:
 *       201:
 *         description: Family group created successfully
 *   get:
 *     summary: Get all family groups
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of family groups
 *       403:
 *         description: Access denied, admin only
 */
router.route('/')
    .post(createFamily)
    .get(protect, adminOnly, getAllFamilies);

/**
 * @swagger
 * /api/families/{id}:
 *   get:
 *     summary: Get a family group by ID
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     responses:
 *       200:
 *         description: Family group details
 *       404:
 *         description: Family group not found
 *   put:
 *     summary: Update a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the family group
 *     responses:
 *       200:
 *         description: Family group updated successfully
 *       404:
 *         description: Family group not found
 *   delete:
 *     summary: Delete a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     responses:
 *       200:
 *         description: Family group deleted successfully
 *       404:
 *         description: Family group not found
 */
router.route('/:id')
    .get(protect, getFamilyById)
    .put(protect, isAdmin, updateFamily)
    .delete(protect, isAdmin, deleteFamily);

/**
 * @swagger
 * /api/families/{familyId}/members:
 *   post:
 *     summary: Add a member to a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *     responses:
 *       200:
 *         description: Member added successfully
 *       404:
 *         description: Family group not found
 *   delete:
 *     summary: Remove a member from a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Family group or member not found
 */
router.route('/:familyId/members')
    .post(protect, isAdmin, addMember)
    .delete(protect, isAdmin, removeMember);

/**
 * @swagger
 * /api/families/{familyId}/admins:
 *   post:
 *     summary: Add an admin to a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add as admin
 *     responses:
 *       200:
 *         description: Admin added successfully
 *       404:
 *         description: Family group not found
 *   delete:
 *     summary: Remove an admin from a family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the admin to remove
 *     responses:
 *       200:
 *         description: Admin removed successfully
 *       404:
 *         description: Family group or admin not found
 */
router.route('/:familyId/admins')
    .post(protect, isAdmin, addAdmin)
    .delete(protect, isAdmin, removeAdmin);

/**
 * @swagger
 * /api/families/{familyId}/members/location:
 *   get:
 *     summary: Get locations of family members
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the family group
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 *       404:
 *         description: Family group not found
 */
router.route('/:familyId/members/location')
    .get(protect, getFamilyMembersLocation);

router.route('/movie')
    .post(protect, addMovieToFamily)
    .get(protect, getFamilyMovies)

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { 
//     protect,
//     isAdmin,
//     adminOnly,
//     superAdminOnly
//  } = require('../Middleware/adminMiddleware');

// const {
//     createFamily,
//     getFamilyById,
//     getAllFamilies,
//     updateFamily,
//     deleteFamily,
//     addMember,
//     removeMember,
//     addAdmin,
//     removeAdmin,
//     getFamilyMembersLocation
// } = require('../Controller/familyController');

// // Routes for Family CRUD operations
// router.route('/')
//     .post(createFamily) // Create a new family group
//     .get(protect, adminOnly, getAllFamilies); // Get all family groups

// router.route('/:id')
//     .get(protect, getFamilyById) // Get a family group by ID
//     .put(protect, isAdmin, updateFamily) // Update a family group
//     .delete(protect, isAdmin, deleteFamily); // Delete a family group

// // Routes for managing members and admins in a family group
// router.route('/:familyId/members')
//     .post(protect, isAdmin, addMember) // Add a member to a family group
//     .delete(protect, isAdmin, removeMember); // Remove a member from a family group

// router.route('/:familyId/admins')
//     .post(protect, isAdmin, addAdmin) // Add an admin to a family group
//     .delete(protect, isAdmin, removeAdmin); // Remove an admin from a family group

// router.route('/:familyId/members/location')
//     .get(protect, getFamilyMembersLocation)

// module.exports = router;
