const LocalStrategy = require('passport-local').Strategy;
const pool = require('../db');
const bcrypt = require('bcrypt');

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return done(null, false, { message: 'No user with that email' });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) return done(null, user);
      else return done(null, false, { message: 'Password incorrect' });

    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        done(null, result.rows[0]);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  });
}

module.exports = initialize;
