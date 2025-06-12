const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { updateProfile } = require('../models/User');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
    }
  }
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Unauthorized' });
}

// GET current user's profile
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update profile data (optional image)
router.put('/', isLoggedIn, upload.single('photo'), async (req, res) => {
  try {
    const {
      name,
      lastname,
      gender,
      email,
      phone,
      address,
      country,
      state,
      city,
      pincode,
      removePhoto
    } = req.body;

    if (!name || !lastname || !email || !phone) {
      return res.status(400).json({ message: 'Name, lastname, email, and phone are required' });
    }

    // Handle photo upload/removal
    let photoPath = null;
    let shouldRemovePhoto = removePhoto === 'true';

    // Get current user data to check existing photo
    const currentUser = await pool.query('SELECT photo FROM users WHERE id = $1', [req.user.id]);
    const currentPhoto = currentUser.rows[0]?.photo;

    // Process photo changes
    if (req.file || shouldRemovePhoto) {
      // Delete old photo if it exists
      if (currentPhoto) {
        const oldPhotoPath = path.join(__dirname, '..', currentPhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlink(oldPhotoPath, (err) => {
            if (err) console.error('Error deleting old photo:', err);
          });
        }
      }

      if (shouldRemovePhoto) {
        photoPath = null;
      } else if (req.file) {
        photoPath = `/uploads/profile-photos/${req.file.filename}`;
      }
    }

    // Check for email change and uniqueness
    if (email !== req.user.email) {
      const checkEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (checkEmail.rows.length && checkEmail.rows[0].id !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }

    const profileData = {
      name,
      lastname,
      gender: gender || null,
      email,
      phone,
      address: address || null,
      country: country || null,
      state: state || null,
      city: city || null,
      pincode: pincode || null,
      photo: photoPath !== undefined ? photoPath : currentPhoto
    };

    await updateProfile(req.user.id, profileData);

    const updated = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Profile updated successfully', user: updated.rows[0] });

  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE profile photo
router.delete('/photo', isLoggedIn, async (req, res) => {
  try {
    const currentUser = await pool.query('SELECT photo FROM users WHERE id = $1', [req.user.id]);
    const currentPhoto = currentUser.rows[0]?.photo;

    if (!currentPhoto) {
      return res.status(400).json({ message: 'No profile photo to remove' });
    }

    // Delete the file from filesystem
    const photoPath = path.join(__dirname, '..', currentPhoto);
    if (fs.existsSync(photoPath)) {
      fs.unlink(photoPath, (err) => {
        if (err) console.error('Error deleting photo file:', err);
      });
    }

    // Update database to remove photo reference
    await pool.query('UPDATE users SET photo = NULL WHERE id = $1', [req.user.id]);

    const updatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Profile photo removed successfully', user: updatedUser.rows[0] });

  } catch (err) {
    console.error('Error removing profile photo:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;