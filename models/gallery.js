const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    links: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema, 'gallery');
