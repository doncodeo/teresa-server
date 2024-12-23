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
// const { protect, adminOnly, superAdminOnly, errorHandler } = require('../Middleware/adminMiddleware');

// /**
//  * @swagger
//  * /api/user:
//  *   get:
//  *     summary: Retrieve a list of all users
//  *     tags: [Users]
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved list of users
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: string
//  *                     description: The user ID
//  *                   name:
//  *                     type: string
//  *                     description: The user's name
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User successfully registered
//  */
// router.route('/').get(getAllUsers).post(registerUser);

// /**
//  * @swagger
//  * /api/user/login:
//  *   post:
//  *     summary: Login a user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successfully logged in
//  *       401:
//  *         description: Invalid credentials
//  */
// router.route('/login').post(loginUser);

// /**
//  * @swagger
//  * /api/user/{id}:
//  *   get:
//  *     summary: Get user by ID
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The user ID
//  *     responses:
//  *       200:
//  *         description: User data retrieved
//  *       404:
//  *         description: User not found
//  *   put:
//  *     summary: Update user information
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The user ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User updated
//  *       404:
//  *         description: User not found
//  *   delete:
//  *     summary: Delete a user
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The user ID
//  *     responses:
//  *       200:
//  *         description: User deleted
//  *       404:
//  *         description: User not found
//  */
// router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

// /**
//  * @swagger
//  * /api/user/{id}/location:
//  *   get:
//  *     summary: Get a user's location
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The user ID
//  *     responses:
//  *       200:
//  *         description: User location retrieved
//  *       404:
//  *         description: User not found
//  *   put:
//  *     summary: Update a user's location
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The user ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               lat:
//  *                 type: number
//  *                 description: Latitude
//  *               lng:
//  *                 type: number
//  *                 description: Longitude
//  *     responses:
//  *       200:
//  *         description: User location updated
//  *       404:
//  *         description: User not found
//  */
// router.route('/:id/location').get(protect, getUserLocation).put(protect, updateLocation);

// module.exports = router;


const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateLocation,
    getUserLocation
} = require('../Controller/userController');
const { protect, adminOnly, superAdminOnly, errorHandler } = require('../Middleware/adminMiddleware');

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The user ID
 *                   name:
 *                     type: string
 *                     description: The user's name
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
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *               username:
 *                 type: string
 *                 description: The user's username
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *               familyCode:
 *                 type: string
 *                 description: (Optional) The family code for the user
 *               profilePicture:
 *                 type: string
 *                 description: (Optional) The user's profile picture URL
 *               role:
 *                 type: string
 *                 enum: ['user', 'admin', 'superAdmin']
 *                 default: 'user'
 *                 description: The role of the user (default is 'user')
 *               familyId:
 *                 type: string
 *                 description: The ID of the family the user belongs to
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The user's ID
 *                     firstName:
 *                       type: string
 *                       description: The user's first name
 *                     lastName:
 *                       type: string
 *                       description: The user's last name
 *                     email:
 *                       type: string
 *                       description: The user's email
 */

router.route('/').get(getAllUsers).post(registerUser);

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