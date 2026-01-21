/**
 * Create Initial Admin User
 * 
 * Run this script once to create the first admin account
 * Usage: node scripts/createAdmin.js
 * 
 * @module scripts/createAdmin
 * @created 2026-01-20
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple inline AdminUser model for script
const AdminUserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: String,
  lastLogin: Date,
}, { timestamps: true });

AdminUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in environment variables');
      console.error('   Please set MONGODB_URI or DATABASE_URL in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!');

    // Check if admin already exists
    const existing = await AdminUser.findOne({ username: 'admin' });
    if (existing) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Username:', existing.username);
      console.log('   Email:', existing.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await AdminUser.create({
      username: 'admin',
      password: 'admin12345', // Change this!
      email: 'admin@aggronation.com',
      role: 'admin',
      lastLogin: null,
    });

    console.log('✅ Admin user created!');
    console.log('   Username: admin');
    console.log('   Password: admin12345');
    console.log('   Email:', admin.email);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('   Login at: http://localhost:3000/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
