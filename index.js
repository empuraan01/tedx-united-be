require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('./config/passport');

const app = express();


app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));



app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 8000;

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileroutes');


app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "TEDx Server API",
        endpoints: {
            auth: "/auth",
            profile: "/profile"
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