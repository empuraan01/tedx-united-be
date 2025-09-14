const User = require('../models/user');

const clerkAuth = async (req, res, next) => {
    try {
        // Look for Clerk user ID in headers
        const clerkUserId = req.headers['x-clerk-user-id'];
        
        if (!clerkUserId) {
            return next(); // Continue without auth
        }

        console.log(`Clerk Auth: Processing user ID: ${clerkUserId}`);

        // Check if user exists in our database, if not create them
        let user = await User.findOne({ clerkId: clerkUserId });
        
        if (!user) {
            // Create new user with minimal data
            const displayName = req.headers['x-clerk-user-name'] || 'User';
            const email = req.headers['x-clerk-user-email'] || '';
            
            user = new User({
                clerkId: clerkUserId,
                displayName: displayName,
                email: email,
                image: req.headers['x-clerk-user-image'] || ''
            });
            
            await user.save();
            console.log(`✅ Created new user: ${displayName} (${email}) with Clerk ID: ${clerkUserId}`);
        } else {
            console.log(`✅ Found existing user: ${user.displayName} (${user.email})`);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Clerk auth error:', error.message);
        // Don't fail the request, just continue without auth
        next();
    }
};

module.exports = clerkAuth;
