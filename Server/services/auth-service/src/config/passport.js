const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const prisma = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: {
            email: profile.emails[0].value,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.displayName,
              avatar: profile.photos[0]?.value || null,
              googleId: profile.id,
              provider: "google",
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        done(error, null);
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    console.error("Deserialize User Error:", error);
    done(error, null);
  }
});