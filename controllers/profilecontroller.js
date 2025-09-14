const User = require('../models/user');

const profileController = {

    uploadProfilePicture: async (req, res) => {
        try {
            console.log('🔄 Profile picture upload request received');
            console.log('📁 File info:', req.file ? { 
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size 
            } : 'No file');
            console.log('👤 User info:', req.user ? { 
                id: req.user._id, 
                displayName: req.user.displayName,
                clerkId: req.user.clerkId 
            } : 'No user');
            console.log('📋 Headers:', {
                'x-clerk-user-id': req.headers['x-clerk-user-id'],
                'x-clerk-user-name': req.headers['x-clerk-user-name']
            });

            if (!req.file) {
                console.log('❌ No file uploaded');
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!req.user) {
                console.log('❌ User not authenticated');
                return res.status(401).json({ error: 'User not authenticated' });
            }

            console.log('💾 Updating user image in database...');
            console.log('📊 Buffer info:', {
                bufferSize: req.file.buffer.length,
                bufferType: typeof req.file.buffer,
                isBuffer: Buffer.isBuffer(req.file.buffer)
            });
            
            const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                image: {
                    data: req.file.buffer,
                    type: req.file.mimetype
                }
            }, { new: true });

            console.log('✅ Image updated successfully', { 
                userId: updatedUser._id,
                hasImageData: !!(updatedUser.image && updatedUser.image.data),
                imageDataSize: updatedUser.image?.data?.length,
                imageType: updatedUser.image?.type
            });
            
            // Double-check by fetching the user again
            const verifyUser = await User.findById(req.user._id);
            console.log('🔍 Verification check:', {
                userFound: !!verifyUser,
                hasImageData: !!(verifyUser.image && verifyUser.image.data),
                imageDataSize: verifyUser.image?.data?.length
            });

            res.json({ 
                success: true, 
                message: 'Profile picture uploaded successfully',
                hasProfilePicture: !!(updatedUser.image && updatedUser.image.data)
            });
        } catch (error) {
            console.error('❌ Error uploading profile picture:', error);
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
            console.log(`🔍 Fetching profile picture for user: ${userId}`);
            
            const user = await User.findById(userId);
            console.log(`👤 User found:`, user ? { 
                id: user._id, 
                displayName: user.displayName,
                hasImageData: !!(user.image && user.image.data),
                imageType: user.image?.type
            } : 'No user found');
            
            if (!user || !user.image || !user.image.data) {
                console.log('❌ Profile picture not found');
                return res.status(404).json({ error: 'Profile picture not found' });
            }
            
            console.log('✅ Sending profile picture');
            res.set('Content-Type', user.image.type);
            res.send(user.image.data);
        } catch (error) {
            console.error('❌ Error fetching profile picture:', error);
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

            // Don't exclude image.data since we need it to check hasProfilePicture
            const user = await User.findById(req.user._id).select('-jwt -googleId');
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            console.log('🔍 getMyProfile: Fresh user data:', {
                id: user._id,
                displayName: user.displayName,
                hasImageData: !!(user.image && user.image.data),
                imageDataSize: user.image?.data?.length
            });

            res.json({
                user: {
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
            const user = await User.findById(userId).select('-jwt -googleId');
            
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
            ).select('-jwt -googleId');

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
            const users = await User.find({}).select('-jwt -googleId').sort({ createdAt: -1 });
            
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
