
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const { checkEmailInSheet } = require('./googlesheets');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        const userEmail = profile.emails[0].value;


        const isAuthorized = await checkEmailInSheet(userEmail);

        if (!isAuthorized) {
            console.log(`Authentication failed: Email ${userEmail} not found in Google Sheet.`);
            return done(null, false, { message: "This email address is not authorized." });
        }

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            user.displayName = profile.displayName;
            user.image = profile.photos[0].value;
        } else {
            user = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: userEmail,
                image: profile.photos[0].value,
            });
        }

        user.generateAuthToken();
        await user.save();
        
        console.log(`Successfully authenticated and saved user: ${user.email}`);
        return done(null, user);

    } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
