// ===========================
// models/Booking.js
// ===========================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    itemId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'Item',
      required: [true, 'Item is required']
    },
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      default : null
    },
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true
    },
    phone: {
      type    : String,
      required: [true, 'Phone is required']
    },
    address: {
      type    : String,
      required: [true, 'Address is required']
    },
    eventDate: {
      type    : Date,
      required: [true, 'Event date is required']
    },
    quantity: {
      type    : Number,
      required: [true, 'Quantity is required'],
      min     : [1, 'Quantity must be at least 1']
    },
    totalPrice: {
      type    : Number,
      required: [true, 'Total price is required']
    },
    status: {
      type   : String,
      enum   : ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);