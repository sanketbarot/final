// backend/createAdmin.js

const mongoose = require('mongoose');
const User     = require('./models/User');
require('dotenv').config();

async function createAdmin() {

  console.log('🔄 MongoDB sa connect thay chhe...');

  // MongoDB sa connect karo
  await mongoose.connect(process.env.MONGO_URI);

  console.log('✅ MongoDB Connected!');

  // Check karo admin pahela thi chhe ke nahi
  const existing = await User.findOne({
    email: 'admin@decostock.com'
  });

  if (existing) {
    console.log('⚠️  Admin pahela thi j exists kare chhe!');
    console.log('📧 Email   : admin@decostock.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
    return;
  }

  // Navo Admin banavo
  const admin = await User.create({
    name    : 'Admin',
    email   : 'admin@decostock.com',
    phone   : '9876543210',
    password: 'admin123',
    role    : 'admin'       // ← AA IMPORTANT CHHE
  });

  console.log('');
  console.log('🎉 Admin Successfully Created!');
  console.log('================================');
  console.log('📧 Email   : ' + admin.email);
  console.log('🔑 Password: admin123');
  console.log('👤 Role    : ' + admin.role);
  console.log('================================');
  console.log('');
  console.log('👉 Hve login.html ma ja ane login karo!');

  process.exit(0);
}

// Run karo
createAdmin().catch(function(err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
});