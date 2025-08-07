const authMiddleware = {
    requireAuth: (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }
    },

    requireAdmin: (req, res, next) => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            res.status(403).json({ 
                error: 'Admin access required',
                message: 'You do not have permission to access this resource'
            });
        }
    },

    optionalAuth: (req, res, next) => {
        next();
    },

    requireOwnershipOrAdmin: (resourceUserId) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const targetUserId = typeof resourceUserId === 'function' 
                ? resourceUserId(req) 
                : resourceUserId;

            if (req.user._id.toString() === targetUserId || req.user.isAdmin) {
                next();
            } else {
                res.status(403).json({ 
                    error: 'Access denied',
                    message: 'You can only access your own resources'
                });
            }
        };
    }
};

module.exports = authMiddleware; 