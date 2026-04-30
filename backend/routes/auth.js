// ===========================
// routes/auth.js
// ===========================

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// ===== GENERATE TOKEN =====
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// ===========================
// POST /api/auth/register
// ===========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ===== VALIDATION =====
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, phone, password)'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // ===== CHECK EMAIL EXISTS =====
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // ===== CREATE USER =====
    const user = await User.create({
      name   : name.trim(),
      email  : email.toLowerCase().trim(),
      phone  : phoneDigits,
      password: password
    });

    // ===== GENERATE TOKEN =====
    const token = generateToken(user._id);

    console.log('✅ New user registered:', user.email);

    // ===== SEND RESPONSE =====
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token  : token,
      user   : {
        _id  : user._id,
        name : user.name,
        email: user.email,
        phone: user.phone,
        role : user.role
      }
    });

  } catch (err) {
    console.error('Register Error:', err);

    // Duplicate email error from MongoDB
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Validation error from Mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error  : process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ===========================
// POST /api/auth/login
// ===========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== VALIDATION =====
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // ===== FIND USER (include password) =====
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== CHECK PASSWORD =====
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ===== GENERATE TOKEN =====
    const token = generateToken(user._id);

    console.log('✅ User logged in:', user.email);

    // ===== SEND RESPONSE =====
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token  : token,
      user   : {
        _id  : user._id,
        name : user.name,
        email: user.email,
        phone: user.phone,
        role : user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error  : process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ===========================
// GET /api/auth/profile
// ===========================
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user   : user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// PUT /api/auth/profile
// ===========================
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name, phone: phone },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user   : user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;