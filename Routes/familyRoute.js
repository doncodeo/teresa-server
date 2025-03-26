const express = require('express');
const router = express.Router();
const { protect, isAdmin, adminOnly } = require('../Middleware/adminMiddleware');
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
  updateMemberRole,
  uploadToGallery,
  updateFamilyProfilePicture,
} = require('../Controller/familyController');

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Create a new family group
 *     tags: [Family]
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
 *               description:
 *                 type: string
 *             required:
 *               - name
 *               - description
 *     responses:
 *       201:
 *         description: Family created successfully
 *       400:
 *         description: Validation error or family name exists
 *       403:
 *         description: User not verified
 */
router.route('/')
  .post(protect, createFamily)
  /**
   * @swagger
   * /api/families:
   *   get:
   *     summary: Get all families (admin only)
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all families
   *       403:
   *         description: Not an admin
   */
  .get(protect, adminOnly, getAllFamilies);

/**
 * @swagger
 * /api/families/join:
 *   post:
 *     summary: Join a family group
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               familyCode:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
 *     responses:
 *       200:
 *         description: Joined family successfully
 *       400:
 *         description: Already a member or invalid input
 *       404:
 *         description: Invalid token or family code
 */
router.route('/join')
  .post(protect, joinFamily);

/**
 * @swagger
 * /api/families/leave/{familyId}:
 *   put:
 *     summary: Leave a family group
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left family successfully
 *       400:
 *         description: Not a member or last admin
 *       404:
 *         description: Family not found
 */
router.route('/leave/:familyId')
  .put(protect, leaveFamilyGroup);

/**
 * @swagger
 * /api/families/{id}:
 *   get:
 *     summary: Get family by ID
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family details
 *       404:
 *         description: Family not found
 */
router.route('/:id')
  .get(protect, getFamilyById)
  /**
   * @swagger
   * /api/families/{id}:
   *   put:
   *     summary: Update family details
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Family updated
   *       404:
   *         description: Family not found
   */
  .put(protect, updateFamily)
  /**
   * @swagger
   * /api/families/{id}:
   *   delete:
   *     summary: Delete a family (admin only)
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Family deleted
   *       403:
   *         description: Not an admin
   *       404:
   *         description: Family not found
   */
  .delete(protect, isAdmin, deleteFamily);

/**
 * @swagger
 * /api/families/{familyId}/members:
 *   post:
 *     summary: Add a member to a family (admin only)
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
 *     responses:
 *       200:
 *         description: Member added
 *       400:
 *         description: User already a member
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Family not found
 */
router.route('/:familyId/members')
  .post(protect, isAdmin, addMember)
  /**
   * @swagger
   * /api/families/{familyId}/members:
   *   delete:
   *     summary: Remove a member from a family (admin only)
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: familyId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Member removed
   *       400:
   *         description: User not a member
   *       403:
   *         description: Not an admin
   *       404:
   *         description: Family not found
   */
  .delete(protect, isAdmin, removeMember);

/**
 * @swagger
 * /api/families/{familyId}/admins:
 *   post:
 *     summary: Add an admin to a family (admin only)
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin added
 *       400:
 *         description: User already an admin
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Family not found
 */
router.route('/:familyId/admins')
  .post(protect, isAdmin, addAdmin)
  /**
   * @swagger
   * /api/families/{familyId}/admins:
   *   delete:
   *     summary: Remove an admin from a family (admin only)
   *     tags: [Family]
 *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: familyId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Admin removed
   *       400:
   *         description: User not an admin
   *       403:
   *         description: Not an admin
   *       404:
   *         description: Family not found
   */
  .delete(protect, isAdmin, removeAdmin);

/**
 * @swagger
 * /api/families/{familyId}/members/location:
 *   get:
 *     summary: Get family members' locations
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members with locations
 *       404:
 *         description: Family or members not found
 */
router.route('/:familyId/members/location')
  .get(protect, getFamilyMembersLocation);

/**
 * @swagger
 * /api/families/movie:
 *   post:
 *     summary: Add a movie to a family
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyCode:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie added
 *       404:
 *         description: Family not found
 */
router.route('/movie')
  .post(protect, addMovieToFamily)
  /**
   * @swagger
   * /api/families/movie:
   *   get:
   *     summary: Get family movies (incorrectly routed, should use familyCode)
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of movies
   *       404:
   *         description: Family not found
   */
  .get(protect, getFamilyMovies); // Note: This should probably be /:familyCode/movies

/**
 * @swagger
 * /api/families/{familyId}/role:
 *   put:
 *     summary: Update own role in a family
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Not a member
 *       404:
 *         description: Family not found
 */
router.put('/:familyId/role', protect, updateOwnRole);

/**
 * @swagger
 * /api/families/{familyId}/role-admin:
 *   put:
 *     summary: Update a member's role (admin only)
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               newRole:
 *                 type: string
 *                 enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
 *     responses:
 *       200:
 *         description: Member role updated
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Family or member not found
 */
router.put('/:familyId/role-admin', protect, updateMemberRole);

/**
 * @swagger
 * /api/families/{familyId}/gallery:
 *   post:
 *     summary: Upload an image to the family gallery
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     uploadedBy:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No image provided
 *       403:
 *         description: Not a member
 *       404:
 *         description: Family not found
 */
router.route('/:familyId/gallery')
  .post(protect, uploadToGallery);

/**
 * @swagger
 * /api/families/{familyId}/profile-picture:
 *   put:
 *     summary: Update the family profile picture (admin only)
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profilePicture:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *       400:
 *         description: No image provided
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Family not found
 */
router.route('/:familyId/profile')
  .put(protect, updateFamilyProfilePicture);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { protect, isAdmin, adminOnly } = require('../Middleware/adminMiddleware');

// const {
//   createFamily,
//   joinFamily,
//   leaveFamilyGroup,
//   getFamilyById,
//   getAllFamilies, // This is the correct function
//   updateFamily,
//   deleteFamily,
//   addMember,
//   removeMember,
//   addAdmin,
//   removeAdmin,
//   getFamilyMembersLocation,
//   addMovieToFamily,
//   getFamilyMovies,
//   updateOwnRole,
//   updateMemberRole,
//   uploadToGallery,
//   updateFamilyProfilePicture,
// } = require('../Controller/familyController');

// router.route('/')
//   .post(protect, createFamily)
//   .get(protect, adminOnly, getAllFamilies); // Fixed from getAllPackages to getAllFamilies

// router.route('/join')
//   .post(protect, joinFamily);

// router.route('/leave/:familyId')
//   .put(protect, leaveFamilyGroup);

// router.route('/:id')
//   .get(protect, getFamilyById)
//   .put(protect, updateFamily)
//   .delete(protect, isAdmin, deleteFamily);

// router.route('/:familyId/members')
//   .post(protect, isAdmin, addMember)
//   .delete(protect, isAdmin, removeMember);

// router.route('/:familyId/admins')
//   .post(protect, isAdmin, addAdmin)
//   .delete(protect, isAdmin, removeAdmin);

// router.route('/:familyId/members/location')
//   .get(protect, getFamilyMembersLocation);

// router.route('/movie')
//   .post(protect, addMovieToFamily)
//   .get(protect, getFamilyMovies);

// router.put('/:familyId/role', protect, updateOwnRole);
// router.put('/:familyId/role-admin', protect, updateMemberRole);

// router.route('/:familyId/gallery')
//   .post(protect, uploadToGallery);

// router.route('/:familyId/profile')
//   .put(protect, updateFamilyProfilePicture);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { 
//     protect,
//     isAdmin,
//     adminOnly
//  } = require('../Middleware/adminMiddleware');

// const {
//     createFamily,
//     joinFamily,
//     leaveFamilyGroup,
//     getFamilyById,
//     getAllFamilies,
//     updateFamily,
//     deleteFamily,
//     addMember,
//     removeMember,
//     addAdmin,
//     removeAdmin,
//     getFamilyMembersLocation,
//     addMovieToFamily,
//     getFamilyMovies,
//     updateOwnRole,
//     updateMemberRole
// } = require('../Controller/familyController');

// /**
//  * @swagger
//  * /api/families:
//  *   post:
//  *     summary: Create a new family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: Name of the family group
//  *                 example: "The Smiths"
//  *               description:
//  *                 type: string
//  *                 description: Description of the family group
//  *                 example: "A family group for the Smiths."
//  *     responses:
//  *       201:
//  *         description: Family group created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 family:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                       description: ID of the created family
//  *                     name:
//  *                       type: string
//  *                       description: Name of the created family
//  *                     description:
//  *                       type: string
//  *                       description: Description of the created family
//  *                     familyCode:
//  *                       type: string
//  *                       description: Unique code for the family
//  *                     joinToken:
//  *                       type: string
//  *                       description: Token for joining the family
//  *                     createdBy:
//  *                       type: string
//  *                       description: ID of the user who created the family
//  *                     admins:
//  *                       type: array
//  *                       items:
//  *                         type: string
//  *                         description: IDs of the admins
//  *                     members:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           userId:
//  *                             type: string
//  *                             description: User ID of the member
//  *                           role:
//  *                             type: string
//  *                             description: Role of the member
//  *                           example:
//  *                             userId: "63a8c82e1f0b3e12c1234567"
//  *                             role: "Father"
//  *                     createdAt:
//  *                       type: string
//  *                       format: date-time
//  *                       description: Timestamp when the family was created
//  *                 message:
//  *                   type: string
//  *                   description: Success message
//  *       400:
//  *         description: Validation error or family name already exists
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 errors:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       msg:
//  *                         type: string
//  *                         description: Validation error message
//  *                       param:
//  *                         type: string
//  *                         description: The field that caused the error
//  *                       location:
//  *                         type: string
//  *                         description: Location of the field (e.g., "body")
//  *                 error:
//  *                   type: string
//  *                   description: Error message for duplicate family name
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  */

// router.route('/')
//     .post(protect, createFamily)
//     .get(protect, adminOnly, getAllFamilies);

// /**
//  * @swagger
//  * /api/families/join:
//  *   post:
//  *     summary: Join a family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               token:
//  *                 type: string
//  *                 description: The join token for the family
//  *                 example: 1234abcd5678efgh91011ijklmnopqr
//  *               familyCode:
//  *                 type: string
//  *                 description: The family code for the family
//  *                 example: FAM123ABC
//  *             oneOf:
//  *               - required: ["token"]
//  *               - required: ["familyCode"]
//  *     responses:
//  *       200:
//  *         description: Successfully joined the family group
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: Success message
//  *                   example: Successfully joined the family group.
//  *                 family:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                       description: Family ID
//  *                     name:
//  *                       type: string
//  *                       description: Family name
//  *                     familyCode:
//  *                       type: string
//  *                       description: Family code
//  *                     joinToken:
//  *                       type: string
//  *                       description: Join token for the family
//  *                     members:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           userId:
//  *                             type: string
//  *                             description: User ID of the member
//  *                           role:
//  *                             type: string
//  *                             description: Role of the user in the family
//  *                             enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
//  *       400:
//  *         description: Validation error or already a member of the family
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Either a join token or a family code must be provided.
//  *       404:
//  *         description: Family or user not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Invalid family code.
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Server error
//  */

// router.route('/join')
//     .post(protect, joinFamily)
// router.route('/leave/:familyId')
//     .put(protect, leaveFamilyGroup);

// /**
//  * @swagger
//  * /api/families/{id}:
//  *   get:
//  *     summary: Get family details by ID
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the family to fetch
//  *     responses:
//  *       200:
//  *         description: Family details retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 family:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                       description: Family ID
//  *                     name:
//  *                       type: string
//  *                       description: Family name
//  *                     description:
//  *                       type: string
//  *                       description: Family description
//  *                     familyCode:
//  *                       type: string
//  *                       description: Unique family code
//  *                     joinToken:
//  *                       type: string
//  *                       description: Join token for the family
//  *                     members:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           userId:
//  *                             type: string
//  *                             description: User ID of the member
//  *                           role:
//  *                             type: string
//  *                             description: Role of the user in the family
//  *                             enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
//  *                     admins:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           userId:
//  *                             type: string
//  *                             description: User ID of the admin
//  *       404:
//  *         description: Family not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Family not found
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Server error
//  *   put:
//  *     summary: Update family details
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the family to update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: Family name
//  *               description:
//  *                 type: string
//  *                 description: Family description
//  *               members:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     userId:
//  *                       type: string
//  *                       description: User ID of the member
//  *                     role:
//  *                       type: string
//  *                       description: Role of the user in the family
//  *                       enum: [Father, Mother, Son, Daughter, Cousin, Uncle, Aunt, Grandparent, Sibling, Other]
//  *             example:
//  *               name: New Family Name
//  *               description: Updated description for the family
//  *     responses:
//  *       200:
//  *         description: Family updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 family:
//  *                   type: object
//  *                   description: Updated family details
//  *       404:
//  *         description: Family not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Family not found
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Server error
//  *   delete:
//  *     summary: Delete a family
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the family to delete
//  *     responses:
//  *       200:
//  *         description: Family deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: Success message
//  *                   example: Family deleted successfully
//  *       404:
//  *         description: Family not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Family not found
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   description: Error message
//  *                   example: Server error
//  */


// router.route('/:id')
//     .get(protect, getFamilyById)
//     .put(protect, updateFamily)
//     .delete(protect, isAdmin, deleteFamily);

// /**
//  * @swagger
//  * /api/families/{familyId}/members:
//  *   post:
//  *     summary: Add a member to a family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: familyId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the family group
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 description: ID of the user to add
//  *     responses:
//  *       200:
//  *         description: Member added successfully
//  *       404:
//  *         description: Family group not found
//  *   delete:
//  *     summary: Remove a member from a family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: familyId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the family group
//  *       - in: query
//  *         name: userId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the user to remove
//  *     responses:
//  *       200:
//  *         description: Member removed successfully
//  *       404:
//  *         description: Family group or member not found
//  */
// router.route('/:familyId/members')  
//     .post(protect, isAdmin, addMember)
//     .delete(protect, isAdmin, removeMember);

// /**
//  * @swagger
//  * /api/families/{familyId}/admins:
//  *   post:
//  *     summary: Add an admin to a family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: familyId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the family group
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 description: ID of the user to add as admin
//  *     responses:
//  *       200:
//  *         description: Admin added successfully
//  *       404:
//  *         description: Family group not found
//  *   delete:
//  *     summary: Remove an admin from a family group
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: familyId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the family group
//  *       - in: query
//  *         name: userId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the admin to remove
//  *     responses:
//  *       200:
//  *         description: Admin removed successfully
//  *       404:
//  *         description: Family group or admin not found
//  */
// router.route('/:familyId/admins')
//     .post(protect, isAdmin, addAdmin)
//     .delete(protect, isAdmin, removeAdmin);

// /**
//  * @swagger
//  * /api/families/{familyId}/members/location:
//  *   get:
//  *     summary: Get locations of family members
//  *     tags: [Families]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: familyId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: ID of the family group
//  *     responses:
//  *       200:
//  *         description: Locations retrieved successfully
//  *       404:
//  *         description: Family group not found
//  */
// router.route('/:familyId/members/location')
//     .get(protect, getFamilyMembersLocation);

// router.route('/movie')
//     .post(protect, addMovieToFamily)
//     .get(protect, getFamilyMovies)


// router.put('/:familyId/role', protect, updateOwnRole);
// router.put('/:familyId/role-admin', protect, updateMemberRole);


// module.exports = router;

