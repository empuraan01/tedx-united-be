const multer = require('multer');

const storage = multer.memoryStorage();

const profileUpload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        console.log('📁 Multer file filter:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        if (file.mimetype.startsWith('image/')) {
            console.log('✅ File accepted by multer');
            cb(null, true);
        } else {
            console.log('❌ File rejected by multer - not an image');
            cb(new Error('Only image files are allowed for profile pictures!'), false);
        }
    }
});

module.exports = profileUpload;
