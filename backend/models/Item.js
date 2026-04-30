// ===========================
// models/Item.js
// ===========================

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Item name is required'],
      trim    : true
    },
    description: {
      type   : String,
      default: ''
    },
    price: {
      type    : Number,
      required: [true, 'Price is required'],
      min     : [0, 'Price cannot be negative']
    },
    stock: {
      type    : Number,
      required: [true, 'Stock is required'],
      min     : [0, 'Stock cannot be negative'],
      default : 0
    },
    category: {
      type   : String,
      enum   : ['Mandap', 'Lighting', 'Flowers', 'Setup', 'Party', 'Other'],
      default: 'Other'
    },
    emoji: {
      type   : String,
      default: '🎁'
    },
    image: {
      type   : String,
      default: ''
    },
    rating: {
      type   : Number,
      default: 4.5,
      min    : 0,
      max    : 5
    },
    isAvailable: {
      type   : Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Item', itemSchema);