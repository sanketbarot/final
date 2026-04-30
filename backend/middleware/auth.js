// ===========================
// middleware/auth.js
// ===========================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ===== PROTECT ROUTE =====
const protect = async (req, res, next) => {
  try {
    let token = null;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('Auth Error:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized.'
    });
  }
};

// ===== ADMIN ONLY =====
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access only.'
    });
  }
};

// ===== OPTIONAL AUTH (For bookings without login) =====
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      req.user = user;
    }

    next();
  } catch (err) {
    // No token or invalid - still proceed
    req.user = null;
    next();
  }
};

module.exports = { protect, adminOnly, optionalAuth };