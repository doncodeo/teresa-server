const express = require('express');
const router = express.Router();
const { 
    protect,
    isAdmin,
    adminOnly
 } = require('../Middleware/adminMiddleware');

const {
    createFamily,
    joinFamily,
    leaveFamilyGroup,
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
    updateOwnRole,
    updateMemberRole
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
    .post(protect, createFamily)
    .get(protect, adminOnly, getAllFamilies);

router.route('/join')
    .post(protect, joinFamily)
router.route('/leave/:familyId')
    .put(protect, leaveFamilyGroup);

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Create a new family group
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "The Smiths"
 *               description:
 *                 type: string
 *                 description: Description of the family group
 *                 example: "A family group for the Smiths."
 *     responses:
 *       201:
 *         description: Family group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 family:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the created family
 *                     name:
 *                       type: string
 *                       description: Name of the created family
 *                     description:
 *                       type: string
 *                       description: Description of the created family
 *                     familyCode:
 *                       type: string
 *                       description: Unique code for the family
 *                     joinToken:
 *                       type: string
 *                       description: Token for joining the family
 *                     createdBy:
 *                       type: string
 *                       description: ID of the user who created the family
 *                     admins:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: IDs of the admins
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: User ID of the member
 *                           role:
 *                             type: string
 *                             description: Role of the member
 *                           example:
 *                             userId: "63a8c82e1f0b3e12c1234567"
 *                             role: "Father"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the family was created
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Validation error or family name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Validation error message
 *                       param:
 *                         type: string
 *                         description: The field that caused the error
 *                       location:
 *                         type: string
 *                         description: Location of the field (e.g., "body")
 *                 error:
 *                   type: string
 *                   description: Error message for duplicate family name
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */


router.route('/:id')
    .get(protect, getFamilyById)
    .put(protect, updateFamily)
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


router.put('/:familyId/role', protect, updateOwnRole);
router.put('/:familyId/role-admin', protect, updateMemberRole);


module.exports = router;

