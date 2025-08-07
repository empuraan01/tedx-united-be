const multer = require('multer');

const storage = multer.memoryStorage();

const profileUpload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures!'), false);
        }
    }
});

module.exports = profileUpload;
