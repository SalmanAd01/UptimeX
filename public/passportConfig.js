const LocalStrategy = require("passport-local").Strategy;
const User = require("../Models/database")
const crypto = require("crypto")

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = async (req, email, password, done) => {
    const user = await User.findOne({ where: { email: email, username: req.body.username } });
    if (user) {
      const newHash = crypto.pbkdf2Sync(password, process.env.SALT, 1000, 64, 'sha256').toString('hex');
      if (user.password == newHash) {
        console.log(user.password);
        return done(null, user);
      }
      else {
        return done(null, false, req.flash("infos", "Password Is Invalid"));
      }
    }
    else {
      return done(null, false, req.flash("infos", "No user found"))
    }

  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", passReqToCallback: true },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findOne({ where: { id: id } });
    if (!user) {
      console.log(user);
      return done(err);
    }
    return done(null, user.id);
  });
}

module.exports = initialize;
