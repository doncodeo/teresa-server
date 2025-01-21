const express = require('express');
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateLocation,
    getUserLocation,
    resendVerification
} = require('../Controller/userController');
const { protect, adminOnly, superAdminOnly, errorHandler } = require('../Middleware/adminMiddleware');


/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID
 *                       firstName:
 *                         type: string
 *                         description: First name of the user
 *                       lastName:
 *                         type: string
 *                         description: Last name of the user
 *                       username:
 *                         type: string
 *                         description: Username of the user
 *                       email:
 *                         type: string
 *                         description: Email of the user
 *                       role:
 *                         type: string
 *                         enum: [user, admin, superAdmin]
 *                         description: Role of the user
 *                       familyId:
 *                         type: string
 *                         description: ID of the user's family
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
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user
 *                 example: johndoe123
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: User's password (minimum 6 characters)
 *                 example: mysecurepassword
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               familyCode:
 *                 type: string
 *                 description: (Optional) Family code to join an existing family
 *                 example: FAM123ABC
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the created user
 *                     username:
 *                       type: string
 *                       description: Username of the created user
 *                     email:
 *                       type: string
 *                       description: Email of the created user
 *                     firstName:
 *                       type: string
 *                       description: First name of the created user
 *                     lastName:
 *                       type: string
 *                       description: Last name of the created user
 *                     familyId:
 *                       type: string
 *                       description: ID of the family the user belongs to (if any)
 *       400:
 *         description: Validation error or user already exists
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
 *                   description: Error message (e.g., email/username already exists)
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


router.route('/').get(getAllUsers).post(registerUser);

/**
 * @swagger
 * /api/user/verify:
 *   post:
 *     summary: Verify a user's account
 *     tags: [Users]
 *     description: Verifies a user's account using a verification code. Marks the account as verified and sends a welcome email upon successful verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to verify
 *                 example: 64d8f9b0c0e87c001234abcd
 *               verificationCode:
 *                 type: string
 *                 description: The verification code sent to the user
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Account verified successfully. Welcome email sent!
 *       400:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Invalid or expired verification code.
 *       500:
 *         description: Server error during verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Server error during verification.
 */

router.route('/verify').post(verifyUser);

/**
 * @swagger
 * /api/user/reverify:
 *   post:
 *     summary: Resend verification email
 *     tags: [Users]
 *     description: Resends a verification email with a new verification code to a user who is not yet verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user to resend the verification email to.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification code resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: Verification code resent successfully. Please check your email.
 *       400:
 *         description: User is already verified or other validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: User is already verified.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: User not found.
 *       500:
 *         description: Server error while resending the verification email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Server error while resending verification code.
 */


router.route('/reverify').post(resendVerification);


/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *       401:
 *         description: Invalid credentials
 */
router.route('/login').post(loginUser);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

/**
 * @swagger
 * /api/user/{id}/location:
 *   get:
 *     summary: Get a user's location
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User location retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   description: Latitude of the user
 *                 lng:
 *                   type: number
 *                   description: Longitude of the user
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user's location
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude of the user
 *               lng:
 *                 type: number
 *                 description: Longitude of the user
 *     responses:
 *       200:
 *         description: User location updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *       404:
 *         description: User not found
 */
router.route('/:id/location').get(protect, getUserLocation).put(protect, updateLocation);

module.exports = router;







// const express = require('express');
// const router = express.Router();

// const {
//     registerUser,
//     loginUser,
//     updateUser,
//     deleteUser,
//     getAllUsers,
//     getUserById,
//     updateLocation,
//     getUserLocation
// } = require('../Controller/userController');
// const {protect, adminOnly, superAdminOnly, errorHandler} = require('../Middleware/adminMiddleware');


// router.route('/').get(getAllUsers).post(registerUser);
// router.route('/login').post(loginUser);
// router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);
// router.route('/:id/location').get(protect, getUserLocation).put(protect, updateLocation);

 
// module.exports = router;