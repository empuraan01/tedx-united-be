const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profilecontroller');
const profileUpload = require('../middleware/profileupload');

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};


router.post('/upload-picture', isLoggedIn, profileUpload.single('profilePicture'), profileController.uploadProfilePicture);
router.get('/my-picture', isLoggedIn, profileController.getMyProfilePicture);
router.delete('/picture', isLoggedIn, profileController.deleteProfilePicture);
router.get('/picture/:userId', profileController.getProfilePicture);

router.get('/my-profile', isLoggedIn, profileController.getMyProfile);
router.put('/update', isLoggedIn, profileController.updateProfile);

router.get('/:userId', profileController.getUserProfile);

// Get all users (for people page)
router.get('/', profileController.getAllUsers);

module.exports = router;
