const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware to authenticate requests using a Bearer JWT token.
 * If a valid token is provided, attaches the corresponding user to req.user.
 * This is additive to passport session auth and does not error on absence.
 */
async function jwtAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader || typeof authHeader !== 'string') {
            return next();
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return next();
        }

        const token = parts[1];
        if (!token) {
            return next();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // Invalid or expired token; proceed without user
            return next();
        }

        // Fetch user and attach to request
        const user = await User.findById(decoded._id);
        if (user) {
            req.user = user;
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = jwtAuthMiddleware;


