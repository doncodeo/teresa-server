const Family = require('../Models/familyModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userData = require('../Models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // console.log('Token:', token); // Debug statement

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('Decoded token:', decoded); // Debug statement

            // Get user from the token 
            req.user = await userData.findById(decoded.userId).select('-password');
            // console.log('req.user:', req.user); // Debug statement

            if (!req.user) {
                throw new Error("User not found");
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: "You are not authorized to access this resource" });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
});

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized, only admin and superAdmin users can access this resource' });
    }
};

// This middleware will handle authentication and application-level authorization.
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superAdmin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized, only superAdmin users can access this resource' });
    }
};


// This middleware will handle authorization based on the admins array in the Family model.
const isAdmin = asyncHandler(async (req, res, next) => {
    const { familyId } = req.params;
    const { userId } = req.user;

    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        const isAdmin = family.admins.some(admin => admin.toString() === userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'User is not an admin of this family' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error' });
};

module.exports = {
    protect,
    adminOnly,
    superAdminOnly,
    isAdmin,
    errorHandler,
};


