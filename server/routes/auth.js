const express = require('express');
const router = express.Router();
const passport = require('passport');
const { createUser } = require('../models/User');

// Default profile image path
const DEFAULT_PROFILE_IMAGE = '/uploads/default-profile.png';

// REGISTER
router.post('/register', async (req, res) => {
  const { name, lastname, email, password, phone, gender } = req.body;

  if (!name || !lastname || !email || !password || !phone) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    // Set default photo if none provided during registration
    const photo = DEFAULT_PROFILE_IMAGE;

    const user = await createUser({
      name,
      lastname,
      email,
      password,
      phone,
      gender,
      photo,
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login after registration failed' });
      res.json({ message: 'Registered and logged in', user });
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Registration error', error: err });
    }
  }
});

// LOGIN
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: req.user });
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// GET CURRENT USER
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;
