// ===========================
// routes/bookings.js
// ===========================

const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Item    = require('../models/Item');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// ===========================
// POST /api/bookings
// ===========================
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      itemId,
      name,
      phone,
      address,
      eventDate,
      quantity,
      totalPrice
    } = req.body;

    // ===== VALIDATION =====
    if (!itemId || !name || !phone || !address || !eventDate || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields are required'
      });
    }

    // ===== CHECK ITEM EXISTS =====
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // ===== CHECK STOCK =====
    if (item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Only ' + item.stock + ' items available in stock'
      });
    }

    // ===== CREATE BOOKING =====
    const booking = await Booking.create({
      itemId    : itemId,
      userId    : req.user ? req.user._id : null,
      name      : name,
      phone     : phone,
      address   : address,
      eventDate : eventDate,
      quantity  : quantity,
      totalPrice: totalPrice || (item.price * quantity)
    });

    // ===== REDUCE STOCK (Real-time) =====
    item.stock -= quantity;

    if (item.stock <= 0) {
      item.stock      = 0;
      item.isAvailable = false;
    }

    await item.save();

    console.log('✅ Booking created. Item:', item.name, '| Stock remaining:', item.stock);

    // ===== RESPONSE =====
    return res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      booking: booking,
      updatedStock: item.stock
    });

  } catch (err) {
    console.error('Booking Error:', err);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
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
// GET /api/bookings/my
// ===========================
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('itemId', 'name emoji price category')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// GET /api/bookings (Admin)
// ===========================
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('itemId', 'name emoji price category')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// PUT /api/bookings/:id
// ===========================
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // User can only cancel own booking
    // Admin can update any
    if (req.user.role !== 'admin') {
      if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }
    }

    // If cancelling - restore stock
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await Item.findByIdAndUpdate(
        booking.itemId,
        {
          $inc: { stock: booking.quantity },
          isAvailable: true
        }
      );
      console.log('✅ Stock restored for cancelled booking');
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated',
      booking: booking
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;