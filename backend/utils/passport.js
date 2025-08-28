const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
        };
        return done(null, user);
    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));

module.exports = passport;
