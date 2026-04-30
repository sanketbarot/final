// ===========================
// server.js
// ===========================

const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

// Load env
dotenv.config();

// Connect Database
connectDB();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== REQUEST LOGGER (Development) =====
if (process.env.NODE_ENV === 'development') {
  app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
  });
}

// ===== ROUTES =====
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/items',    require('./routes/items'));
app.use('/api/bookings', require('./routes/bookings'));

// ===== TEST ROUTE =====
app.get('/', function (req, res) {
  res.json({
    success: true,
    message: '🎊 DecoStock API is Running!',
    version: '1.0.0',
    routes : {
      auth    : '/api/auth',
      items   : '/api/items',
      bookings: '/api/bookings'
    }
  });
});

app.get('/api', function (req, res) {
  res.json({
    success: true,
    message: '🎊 DecoStock API is Running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login   : 'POST /api/auth/login',
      profile : 'GET  /api/auth/profile',
      items   : 'GET  /api/items',
      booking : 'POST /api/bookings'
    }
  });
});

// ===== 404 HANDLER =====
app.use(function (req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.method + ' ' + req.url
  });
});

// ===== ERROR HANDLER =====
app.use(function (err, req, res, next) {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error  : process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log('');
  console.log('🚀 DecoStock Server Started!');
  console.log('📡 Port     : ' + PORT);
  console.log('🌍 URL      : http://localhost:' + PORT);
  console.log('📦 Database : ' + process.env.MONGO_URI);
  console.log('🔧 Mode     : ' + (process.env.NODE_ENV || 'development'));
  console.log('');
});

module.exports = app;