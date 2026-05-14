const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./db");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
          console.log("LOGIN DATA:", email, password);
          console.log("STRATEGY HIT:", email, password);

      try {
        const user = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (user.rows.length === 0) {
          return done(null, false, { message: "User not found" });
        }

        const match = await bcrypt.compare(
          password,
          user.rows[0].password
        );

        if (!match) {
          return done(null, false, { message: "Wrong password" });
        }

        return done(null, user.rows[0]);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  });
};