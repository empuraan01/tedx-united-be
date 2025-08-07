const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

router.get('/status', authController.getAuthStatus);
router.get('/me', isLoggedIn, authController.getCurrentUser);
router.get('/success', isLoggedIn, (req, res) => {
    res.json({
        success: true,
        message: 'Authentication successful',
        user: {
            _id: req.user._id,
            name: req.user.displayName,
            email: req.user.email
        }
    });
});

router.get('/failure', authController.authFailure);

router.get('/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/failure',
        failureMessage: true
    }),
    (req, res) => {

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/?success=true`);
    }
);

router.post('/logout', isLoggedIn, authController.logout);

router.post('/check-email', authController.checkEmailAuthorization);

module.exports = router; 