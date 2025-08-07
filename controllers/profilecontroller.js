const User = require('../models/user');

const profileController = {

    uploadProfilePicture: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            await User.findByIdAndUpdate(req.user._id, {
                image: {
                    data: req.file.buffer,
                    type: req.file.mimetype
                }
            });

            res.json({ 
                success: true, 
                message: 'Profile picture uploaded successfully'
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({ error: 'Failed to upload profile picture' });
        }
    },

    getMyProfilePicture: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const user = await User.findById(req.user._id);
            
            if (!user.image || !user.image.data) {
                return res.status(404).json({ error: 'No profile picture set' });
            }
            
            res.set('Content-Type', user.image.type);
            res.send(user.image.data);
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            res.status(500).json({ error: 'Failed to fetch profile picture' });
        }
    },

    getProfilePicture: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            
            if (!user || !user.image || !user.image.data) {
                return res.status(404).json({ error: 'Profile picture not found' });
            }
            
            res.set('Content-Type', user.image.type);
            res.send(user.image.data);
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            res.status(500).json({ error: 'Failed to fetch profile picture' });
        }
    },

    deleteProfilePicture: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            await User.findByIdAndUpdate(req.user._id, {
                image: {
                    data: null,
                    type: null
                }
            });

            res.json({ success: true, message: 'Profile picture deleted successfully' });
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            res.status(500).json({ error: 'Failed to delete profile picture' });
        }
    },

    getMyProfile: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const user = await User.findById(req.user._id).select('-jwt -googleId -image.data');
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    _id: user._id,
                    displayName: user.displayName,
                    email: user.email,
                    nickname: user.nickname,
                    isAdmin: user.isAdmin,
                    emojis: user.emojis,
                    profileimage: user.profileimage,
                    year: user.year,
                    interests: user.interests,
                    bio: user.bio,
                    createdAt: user.createdAt,
                    hasProfilePicture: !!(user.image && user.image.data)
                }
            });
        } catch (error) {
            console.error('Error fetching my profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    getUserProfile: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId).select('-jwt -googleId -image.data');
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    _id: user._id,
                    displayName: user.displayName,
                    email: user.email,
                    nickname: user.nickname,
                    isAdmin: user.isAdmin,
                    emojis: user.emojis,
                    profileimage: user.profileimage,
                    year: user.year,
                    interests: user.interests,
                    bio: user.bio,
                    createdAt: user.createdAt,
                    hasProfilePicture: !!(user.image && user.image.data)
                }
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { nickname, year, interests, bio, emojis } = req.body;
            
            const updateData = {};
            
            if (nickname !== undefined) {
                updateData.nickname = nickname;
            }
            if (year !== undefined) {
                if (isNaN(year)) {
                    return res.status(400).json({ error: 'Valid year is required' });
                }
                updateData.year = parseInt(year);
            }
            if (interests !== undefined) {
                if (!Array.isArray(interests)) {
                    return res.status(400).json({ error: 'Interests must be an array' });
                }
                updateData.interests = interests;
            }
            if (bio !== undefined) {
                if (bio && bio.length > 500) {
                    return res.status(400).json({ error: 'Bio must be less than 500 characters' });
                }
                updateData.bio = bio;
            }
            if (emojis !== undefined) {
                if (!Array.isArray(emojis)) {
                    return res.status(400).json({ error: 'Emojis must be an array' });
                }
                updateData.emojis = emojis;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'No valid fields to update' });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id, 
                updateData,
                { new: true }
            ).select('-jwt -googleId -image.data');

            res.json({ 
                success: true, 
                message: 'Profile updated successfully',
                user: updatedUser,
                updatedFields: Object.keys(updateData) 
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}).select('-jwt -googleId -image.data').sort({ createdAt: -1 });
            
            res.json({
                users: users.map(user => ({
                    _id: user._id,
                    displayName: user.displayName,
                    email: user.email,
                    nickname: user.nickname,
                    isAdmin: user.isAdmin,
                    emojis: user.emojis,
                    year: user.year,
                    interests: user.interests,
                    bio: user.bio,
                    createdAt: user.createdAt,
                    hasProfilePicture: !!(user.image && user.image.data)
                }))
            });
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
};

module.exports = profileController;
