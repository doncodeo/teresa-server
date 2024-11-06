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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
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
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User data retrieved
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
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
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User location retrieved
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user's location
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude
 *               lng:
 *                 type: number
 *                 description: Longitude
 *     responses:
 *       200:
 *         description: User location updated
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