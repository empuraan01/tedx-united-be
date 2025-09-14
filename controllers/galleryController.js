const Gallery = require('../models/gallery');

/**
 * Gets albums directly from MongoDB without scraping
 */
const getAlbumsFromDB = async () => {
    try {
        console.log('Fetching albums from database...');
        
        // Fetch all gallery documents from MongoDB
        const galleries = await Gallery.find();
        console.log(`Found ${galleries.length} gallery documents`);
        
        const albums = [];
        
        // Process each gallery document
        for (const gallery of galleries) {
            const albumEntries = Object.entries(gallery.links || {});
            console.log(`Processing gallery with ${albumEntries.length} albums`);
            
            // Add each album to the list
            for (const [albumTitle, albumUrl] of albumEntries) {
                albums.push({
                    albumUrl: albumUrl,
                    title: albumTitle,
                    photos: [] // Empty since we don't need photo data anymore
                });
            }
        }
        
        console.log(`Found ${albums.length} total albums`);
        return albums;
        
    } catch (error) {
        console.error('Error in getAlbumsFromDB:', error);
        throw error;
    }
};

/**
 * GET /albums - Returns all album data from database
 */
const getAlbums = async (req, res) => {
    try {
        const albums = await getAlbumsFromDB();
        res.json(albums);
        
    } catch (error) {
        console.error('Error in getAlbums:', error);
        res.status(500).json({ 
            error: 'Failed to fetch albums', 
            message: error.message 
        });
    }
};

module.exports = {
    getAlbums
};
