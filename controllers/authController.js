const User = require('../models/user');
const { checkEmailInSheet } = require('../config/googlesheets');

const authController = {
    getCurrentUser: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: "You are not logged in",
                    isAuthenticated: false 
                });
            }

            res.json({
                message: `Welcome ${req.user.displayName}`,
                isAuthenticated: true,
                user: {
                    _id: req.user._id,
                    name: req.user.displayName,
                    email: req.user.email,
                    picture: req.user.image,
                    token: req.user.jwt,
                    nickname: req.user.nickname,
                    isAdmin: req.user.isAdmin,
                    emojis: req.user.emojis,
                    year: req.user.year,
                    interests: req.user.interests,
                    bio: req.user.bio,
                    hasProfilePicture: !!(req.user.image && req.user.image.data)
                }
            });
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(500).json({ error: 'Failed to get user information' });
        }
    },

    getAuthStatus: async (req, res) => {
        try {
            if (!req.user) {
                return res.json({ 
                    isAuthenticated: false,
                    message: "Not authenticated"
                });
            }

            res.json({ 
                isAuthenticated: true,
                user: {
                    _id: req.user._id,
                    name: req.user.displayName,
                    email: req.user.email
                }
            });
        } catch (error) {
            console.error('Error checking auth status:', error);
            res.status(500).json({ error: 'Failed to check authentication status' });
        }
    },

    logout: async (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    return res.status(500).json({ error: 'Failed to destroy session' });
                }
                
                req.logout((err) => {
                    if (err) {
                        console.error('Logout error:', err);
                        return res.status(500).json({ error: 'Failed to logout' });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: 'Logged out successfully' 
                    });
                });
            });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ error: 'Failed to logout' });
        }
    },

    authFailure: async (req, res) => {
        res.status(401).json({ 
            error: 'Authentication failed',
            message: req.query.message || 'Authentication failed'
        });
    },


    checkEmailAuthorization: async (req, res) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const isAuthorized = await checkEmailInSheet(email);
            
            res.json({ 
                isAuthorized,
                message: isAuthorized ? 'Email is authorized' : 'Email is not authorized'
            });
        } catch (error) {
            console.error('Error checking email authorization:', error);
            res.status(500).json({ error: 'Failed to check email authorization' });
        }
    }
};

module.exports = authController; 