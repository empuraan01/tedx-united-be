const express = require('express');
const { getAlbums } = require('../controllers/galleryController');

const router = express.Router();

// GET /albums - Get all album data from database
router.get('/albums', getAlbums);

module.exports = router;
