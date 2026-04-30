// ===========================
// routes/items.js
// ===========================

const express = require('express');
const router  = express.Router();
const Item    = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');

// ===========================
// GET /api/items
// ===========================
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(items);

  } catch (err) {
    console.error('Get Items Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// GET /api/items/:id
// ===========================
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json(item);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// POST /api/items (Admin)
// ===========================
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Item added successfully',
      item   : item
    });

  } catch (err) {
    console.error('Add Item Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error  : err.message
    });
  }
});

// ===========================
// PUT /api/items/:id (Admin)
// ===========================
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item updated',
      item   : item
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===========================
// DELETE /api/items/:id (Admin)
// ===========================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item deleted'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;