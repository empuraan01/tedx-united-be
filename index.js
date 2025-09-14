require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('./config/passport');
const jwtAuthMiddleware = require('./middleware/jwtAuth');
const clerkAuth = require('./middleware/clerkAuth');

const app = express();



const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ["https://tedx-united-fe.vercel.app"]
    : ["http://localhost:3000", "https://tedx-united-fe.vercel.app"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization',
        'x-clerk-user-id',
        'x-clerk-user-name', 
        'x-clerk-user-email',
        'x-clerk-user-image'
    ]
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// When running behind a proxy (Railway, Vercel, etc.),
// trust the first proxy so secure cookies work correctly.
app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));



app.use(passport.initialize());
app.use(passport.session());

// Allow JWT-based auth alongside session auth for API requests
app.use(jwtAuthMiddleware);

// Add Clerk authentication middleware
app.use(clerkAuth);

const port = process.env.PORT || 8000;

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileroutes');
const galleryRoutes = require('./routes/galleryRoutes');


app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/', galleryRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "TEDx Server API",
        endpoints: {
            auth: "/auth",
            profile: "/profile",
            albums: "/albums"
        },
        isAuthenticated: !!req.user
    });
});


app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});


app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});


connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});