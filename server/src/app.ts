import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// Extend express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

let db: Database<sqlite3.Database, sqlite3.Statement>;

// Initialize Database
async function initDb() {
  const dbPath = path.resolve(__dirname, '../../database/database.sqlite');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      mobile TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      referralCode TEXT,
      role TEXT DEFAULT 'Customer',
      registrationDate TEXT NOT NULL
    )
  `);

  // Create OTPs Table (fallback for mock development mode)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      mobile TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expiresAt TEXT NOT NULL
    )
  `);

  // Create Hall Bookings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hall_bookings (
      bookingId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      mandal TEXT NOT NULL,
      hallId TEXT NOT NULL,
      hallName TEXT NOT NULL,
      hallAddress TEXT NOT NULL,
      eventDate TEXT NOT NULL,
      bookingDate TEXT NOT NULL,
      costPerDay REAL NOT NULL,
      totalAmount REAL NOT NULL,
      status TEXT DEFAULT 'Confirmed',
      createdAt TEXT NOT NULL
    )
  `);

  // Create Booking History (Audit Log) Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS booking_history (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      fieldName TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      changedAt TEXT NOT NULL,
      changedBy TEXT NOT NULL
    )
  `);

  // Migrations for Function Halls Module fields
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN eventType TEXT DEFAULT "General Event"');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN guestsCount INTEGER DEFAULT 100');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN eventSession TEXT DEFAULT "Full Day"');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN foodItems TEXT');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN updatedAt TEXT');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN paymentStatus TEXT DEFAULT "Paid"');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN specialNotes TEXT');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN startTime TEXT DEFAULT "09:00"');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE hall_bookings ADD COLUMN endTime TEXT DEFAULT "18:00"');
  } catch (e) { }

  // Create Food Items Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Seed Default Food Items
  try {
    const defaultFoodItems = [
      { name: 'Paneer Butter Masala', category: 'VEG', price: 180 },
      { name: 'Veg Biryani', category: 'VEG', price: 160 },
      { name: 'Dal Tadka', category: 'VEG', price: 100 },
      { name: 'Chicken Biryani', category: 'NON-VEG', price: 220 },
      { name: 'Chicken Curry', category: 'NON-VEG', price: 220 },
      { name: 'Mutton Curry', category: 'NON-VEG', price: 300 },

      // Veg Starters
      { name: 'Paneer Tikka', category: 'VEG', price: 180 },
      { name: 'Hara Bhara Kebab', category: 'VEG', price: 140 },
      { name: 'Veg Manchurian', category: 'VEG', price: 130 },
      { name: 'Gobi 65', category: 'VEG', price: 120 },
      { name: 'Baby Corn Manchurian', category: 'VEG', price: 140 },
      { name: 'Crispy Corn', category: 'VEG', price: 130 },

      // Veg Main Course
      { name: 'Kadai Paneer', category: 'VEG', price: 180 },
      { name: 'Palak Paneer', category: 'VEG', price: 170 },
      { name: 'Mix Veg Curry', category: 'VEG', price: 140 },
      { name: 'Veg Kolhapuri', category: 'VEG', price: 150 },
      { name: 'Dal Makhani', category: 'VEG', price: 130 },
      { name: 'Chole Masala', category: 'VEG', price: 110 },
      { name: 'Aloo Gobi', category: 'VEG', price: 100 },

      // Veg Rice
      { name: 'Jeera Rice', category: 'VEG', price: 90 },
      { name: 'Veg Pulao', category: 'VEG', price: 120 },
      { name: 'Plain Rice', category: 'VEG', price: 70 },

      // Veg Breads
      { name: 'Butter Naan', category: 'VEG', price: 50 },
      { name: 'Tandoori Roti', category: 'VEG', price: 35 },
      { name: 'Butter Roti', category: 'VEG', price: 40 },
      { name: 'Plain Naan', category: 'VEG', price: 45 },

      // Veg Sides
      { name: 'Veg Raita', category: 'VEG', price: 70 },
      { name: 'Boondi Raita', category: 'VEG', price: 70 },
      { name: 'Green Salad', category: 'VEG', price: 60 },
      { name: 'Papad', category: 'VEG', price: 30 },
      { name: 'Pickle', category: 'VEG', price: 20 },

      // Veg Desserts
      { name: 'Gulab Jamun', category: 'VEG', price: 80 },
      { name: 'Rasmalai', category: 'VEG', price: 100 },
      { name: 'Gajar Halwa', category: 'VEG', price: 90 },
      { name: 'Ice Cream', category: 'VEG', price: 100 },
      { name: 'Kheer', category: 'VEG', price: 80 },

      // Non-Veg Starters
      { name: 'Chicken 65', category: 'NON-VEG', price: 200 },
      { name: 'Chicken Tikka', category: 'NON-VEG', price: 220 },
      { name: 'Chicken Manchurian', category: 'NON-VEG', price: 200 },
      { name: 'Chicken Seekh Kebab', category: 'NON-VEG', price: 220 },
      { name: 'Chicken Lollipop', category: 'NON-VEG', price: 230 },
      { name: 'Fish Fry', category: 'NON-VEG', price: 250 },

      // Non-Veg Main Course
      { name: 'Butter Chicken', category: 'NON-VEG', price: 240 },
      { name: 'Chicken Tikka Masala', category: 'NON-VEG', price: 240 },
      { name: 'Kadai Chicken', category: 'NON-VEG', price: 230 },
      { name: 'Andhra Chicken Curry', category: 'NON-VEG', price: 220 },
      { name: 'Mutton Rogan Josh', category: 'NON-VEG', price: 320 },
      { name: 'Fish Curry', category: 'NON-VEG', price: 260 },

      // Non-Veg Rice
      { name: 'Mutton Biryani', category: 'NON-VEG', price: 320 },
      { name: 'Chicken Pulao', category: 'NON-VEG', price: 200 },
      { name: 'Egg Biryani', category: 'NON-VEG', price: 170 },
      { name: 'Egg Fried Rice', category: 'NON-VEG', price: 150 },

      // Non-Veg Egg
      { name: 'Egg Curry', category: 'NON-VEG', price: 130 },
      { name: 'Egg Masala', category: 'NON-VEG', price: 120 },
      { name: 'Egg Bhurji', category: 'NON-VEG', price: 100 }
    ];

    const now = new Date().toISOString();
    let seededCount = 0;
    let updatedCount = 0;
    for (const item of defaultFoodItems) {
      const existing = await db.get('SELECT * FROM food_items WHERE name = ?', [item.name]);
      if (!existing) {
        const id = 'food-' + Math.random().toString(36).substr(2, 9);
        await db.run(
          `INSERT INTO food_items (id, name, category, price, active, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 1, ?, ?)`,
          [id, item.name, item.category, item.price, now, now]
        );
        seededCount++;
      } else {
        await db.run(
          `UPDATE food_items SET price = ?, category = ?, updatedAt = ? WHERE id = ?`,
          [item.price, item.category, now, existing.id]
        );
        updatedCount++;
      }
    }
    if (seededCount > 0 || updatedCount > 0) {
      console.log(`Database updated: seeded ${seededCount} items, updated prices for ${updatedCount} items.`);
    }
  } catch (err) {
    console.error('Error seeding/updating food items:', err);
  }

  // Create Contact Messages Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT NOT NULL
    )
  `);

  // Create Support Requests Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS support_requests (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT NOT NULL
    )
  `);

  // Seed Default Users
  const defaultUsers = [
    {
      id: 'admin-seed',
      name: 'Admin',
      email: 'admin@gkevents.com',
      mobile: '9999999999',
      password: 'admin123',
      role: 'Admin'
    },
    {
      id: 'employee-seed',
      name: 'Employee',
      email: 'employee@gkevents.com',
      mobile: '8888888888',
      password: 'employee123',
      role: 'Employee'
    },
    {
      id: 'customer-seed',
      name: 'Rao SBK',
      email: 'customer@gkevents.com',
      mobile: '9876543210',
      password: 'password123',
      role: 'Customer'
    }
  ];

  for (const user of defaultUsers) {
    const existing = await db.get('SELECT * FROM users WHERE mobile = ?', [user.mobile]);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    if (!existing) {
      await db.run(
        `INSERT INTO users (id, name, email, mobile, password, role, registrationDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.mobile, hashedPassword, user.role, new Date().toISOString()]
      );
    } else {
      await db.run(
        `UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE mobile = ?`,
        [user.name, user.email, hashedPassword, user.role, user.mobile]
      );
    }
  }

  console.log('Database initialized and seeded.');
}

// JWT Helpers & Middlewares
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

function generateToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Access denied' });
    }
    next();
  };
}

// Signup Endpoint
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { name, email, mobile, password, referralCode } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    // Check duplicates
    const existingMobile = await db.get('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (existingMobile) {
      return res.status(400).json({ message: 'This mobile number is already registered' });
    }

    const existingEmail = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(400).json({ message: 'This email address is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const registrationDate = new Date().toISOString();

    // Insert user
    await db.run(
      `INSERT INTO users (id, name, email, mobile, password, referralCode, role, registrationDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, mobile, hashedPassword, referralCode || null, 'Customer', registrationDate]
    );

    const token = generateToken({ id: userId, role: 'Customer' });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, mobile, role: 'Customer' }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { emailOrMobile, mobile, password } = req.body;
  const identifier = emailOrMobile || mobile;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email or Mobile number and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE mobile = ? OR email = ?', [identifier, identifier]);
    if (!user) {
      return res.status(400).json({ message: 'This email or mobile number is not registered. Please sign up first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Food Items CRUD Endpoints
app.get('/api/food-items', async (req: Request, res: Response) => {
  try {
    const items = await db.all('SELECT * FROM food_items ORDER BY category DESC, name ASC');
    return res.status(200).json(items);
  } catch (error: any) {
    console.error('Fetch food items error:', error);
    return res.status(500).json({ message: 'Internal server error while fetching food items' });
  }
});

app.post('/api/food-items', async (req: Request, res: Response) => {
  const { name, category, price, active } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Name, category and price are required' });
  }

  try {
    const id = 'food-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO food_items (id, name, category, price, active, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, Number(price), active ? 1 : 0, now, now]
    );

    const newItem = {
      id,
      name,
      category,
      price: Number(price),
      active: active ? 1 : 0,
      createdAt: now,
      updatedAt: now
    };

    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Create food item error:', error);
    return res.status(500).json({ message: 'Internal server error while creating food item' });
  }
});

app.put('/api/food-items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, price, active } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Name, category and price are required' });
  }

  try {
    const existing = await db.get('SELECT * FROM food_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE food_items 
       SET name = ?, category = ?, price = ?, active = ?, updatedAt = ? 
       WHERE id = ?`,
      [name, category, Number(price), active ? 1 : 0, now, id]
    );

    const updatedItem = {
      id,
      name,
      category,
      price: Number(price),
      active: active ? 1 : 0,
      createdAt: existing.createdAt,
      updatedAt: now
    };

    return res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error('Update food item error:', error);
    return res.status(500).json({ message: 'Internal server error while updating food item' });
  }
});

app.delete('/api/food-items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await db.get('SELECT * FROM food_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await db.run('DELETE FROM food_items WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error: any) {
    console.error('Delete food item error:', error);
    return res.status(500).json({ message: 'Internal server error while deleting food item' });
  }
});

// Get Logged-In User Profile Endpoint (Protected)
app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db.get('SELECT id, name, email, mobile, role, registrationDate FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json({
      user
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return res.status(500).json({ message: 'Internal server error verifying session' });
  }
});

// Forgot Password Endpoint
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!user) {
      return res.status(400).json({ message: 'This mobile number is not registered. Please sign up first.' });
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    // Check if running in MSG91 mode or Mock mode
    if (authKey && templateId) {
      // MSG91 Integration
      const formattedMobile = mobile.length === 10 ? `91${mobile}` : mobile;
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedMobile}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'content-type': 'application/json'
        }
      });

      const responseData: any = await response.json();

      if (response.ok && responseData.type === 'success') {
        console.log(`[MSG91] OTP sent successfully to ${formattedMobile}`);
        return res.status(200).json({ message: 'OTP sent successfully via SMS' });
      } else {
        console.error('[MSG91] Error response:', responseData);
        return res.status(500).json({
          message: 'Failed to send OTP via SMS platform. Please try again later.',
          error: responseData
        });
      }
    } else {
      // Mock / Development Fallback Mode
      console.warn('[AUTH] MSG91 credentials missing. Running in mock development mode.');

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // random 6 digit OTP
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

      await db.run(
        `INSERT OR REPLACE INTO otps (mobile, code, expiresAt)
         VALUES (?, ?, ?)`,
        [mobile, generatedOtp, expiresAt]
      );

      console.log(`[MOCK OTP] Mobile: ${mobile} | Code: ${generatedOtp} | Expires: ${expiresAt}`);
      return res.status(200).json({
        message: 'OTP sent successfully (Development Mode)',
        devOtp: generatedOtp // return it so testing is easier
      });
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error during password recovery' });
  }
});

// Reset Password Endpoint
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { mobile, otp, password } = req.body;

  if (!mobile || !otp || !password) {
    return res.status(400).json({ message: 'Mobile number, OTP and new password are required' });
  }

  try {
    const authKey = process.env.MSG91_AUTH_KEY;

    if (authKey) {
      // Verify via MSG91
      const formattedMobile = mobile.length === 10 ? `91${mobile}` : mobile;
      const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${formattedMobile}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'authkey': authKey
        }
      });

      const responseData: any = await response.json();

      if (!response.ok || responseData.type !== 'success') {
        console.error('[MSG91] Verification failure:', responseData);
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      console.log(`[MSG91] OTP verified successfully for ${formattedMobile}`);
    } else {
      // Verify locally via SQLite otps table
      const storedOtp = await db.get('SELECT * FROM otps WHERE mobile = ?', [mobile]);

      if (!storedOtp) {
        return res.status(400).json({ message: 'No OTP requested for this mobile number' });
      }

      if (storedOtp.code !== otp) {
        return res.status(400).json({ message: 'Incorrect OTP entered' });
      }

      if (new Date() > new Date(storedOtp.expiresAt)) {
        await db.run('DELETE FROM otps WHERE mobile = ?', [mobile]);
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Valid OTP. Delete from DB.
      await db.run('DELETE FROM otps WHERE mobile = ?', [mobile]);
      console.log(`[MOCK OTP] Verified successfully for ${mobile}`);
    }

    // Hash new password and update user record
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password = ? WHERE mobile = ?', [hashedPassword, mobile]);

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error during password reset' });
  }
});

// Bookings Endpoints

// Helper to send email confirmation
async function sendBookingEmail(booking: any) {
  try {
    const smtpHost = process.env.SMTP_HOST || '';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const companyEmail = process.env.COMPANY_EMAIL || 'bookings@gkevents.com';

    let foodItemsHtml = '';
    if (booking.foodItems) {
      try {
        const items = typeof booking.foodItems === 'string' ? JSON.parse(booking.foodItems) : booking.foodItems;
        if (Array.isArray(items) && items.length > 0) {
          foodItemsHtml = `
            <tr>
              <td><strong>Catering Selection</strong></td>
              <td>
                <ul style="margin: 0; padding-left: 15px; font-size: 0.95em; color: #374151; list-style-type: square;">
                  ${items.map((i: any) => `<li>${i.name} — ₹${i.price}</li>`).join('')}
                </ul>
              </td>
            </tr>
          `;
        }
      } catch (e) {
        console.error('Error parsing foodItems for email:', e);
      }
    }

    const emailBody = `
      <h2>Booking Confirmation - GK BOOKING</h2>
      <p>Dear <strong>${booking.customerName}</strong>,</p>
      <p>Thank you for choosing GK BOOKING. Your booking has been successfully confirmed!</p>
      
      <table border="1" cellpadding="8" style="border-collapse: collapse; border-color: #e5e7eb; font-family: sans-serif;">
        <tr style="background-color: #f3f4f6;">
          <th colspan="2" align="left">Booking Invoice / Details</th>
        </tr>
        <tr>
          <td><strong>Booking ID</strong></td>
          <td><span style="font-family: monospace; font-weight: bold; color: #b45309;">${booking.bookingId}</span></td>
        </tr>
        <tr>
          <td><strong>Function Hall</strong></td>
          <td>${booking.hallName}</td>
        </tr>
        <tr>
          <td><strong>Address</strong></td>
          <td>${booking.hallAddress}, ${booking.mandal}, ${booking.district}, ${booking.state}</td>
        </tr>
        <tr>
          <td><strong>Event Date</strong></td>
          <td>${booking.eventDate}</td>
        </tr>
        <tr>
          <td><strong>Booking Date</strong></td>
          <td>${booking.bookingDate}</td>
        </tr>
        <tr>
          <td><strong>Capacity</strong></td>
          <td>${booking.capacity || '1000+'} Guests</td>
        </tr>
        <tr>
          <td><strong>Cost per Day</strong></td>
          <td>₹${Number(booking.costPerDay).toLocaleString('en-IN')}</td>
        </tr>
        ${foodItemsHtml}
        <tr style="font-weight: bold; font-size: 1.1em; color: #1e3a8a;">
          <td>Total Paid / Amount</td>
          <td>₹${Number(booking.totalAmount).toLocaleString('en-IN')}</td>
        </tr>
      </table>
      
      <p>For any changes or queries, please contact our Customer Care at +91 12345 67890 or reply to this email.</p>
      <br/>
      <p>Best Regards,<br/><strong>GK BOOKING Team</strong></p>
    `;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"GK BOOKING" <${companyEmail}>`,
        to: booking.email,
        subject: `Booking Confirmed! ID: ${booking.bookingId} - ${booking.hallName}`,
        html: emailBody
      });
      console.log(`[Email] Booking confirmation sent to ${booking.email}`);
    } else {
      const logDir = path.resolve(__dirname, '../../database');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logPath = path.join(logDir, 'email_logs.txt');
      const logEntry = `
=============================================
Timestamp: ${new Date().toISOString()}
To: ${booking.email}
Subject: Booking Confirmed! ID: ${booking.bookingId} - ${booking.hallName}
Content:
${emailBody.replace(/<[^>]*>/g, '')}
=============================================
`;
      fs.appendFileSync(logPath, logEntry, 'utf-8');
      console.log(`[Email Mock] SMTP credentials not set. Logged email for ${booking.email} to database/email_logs.txt`);
    }
  } catch (err) {
    console.error('[Email Error] Failed to send booking email:', err);
  }
}

// POST Hall Booking
app.post('/api/bookings/hall', async (req: Request, res: Response) => {
  const {
    userId,
    customerName,
    email,
    mobile,
    state,
    district,
    mandal,
    hallId,
    hallName,
    hallAddress,
    eventDate,
    costPerDay,
    totalAmount,
    capacity,
    eventType,
    guestsCount,
    eventSession,
    foodItems
  } = req.body;

  if (
    !userId ||
    !customerName ||
    !email ||
    !mobile ||
    !state ||
    !district ||
    !mandal ||
    !hallId ||
    !hallName ||
    !hallAddress ||
    !eventDate ||
    !costPerDay ||
    !totalAmount
  ) {
    return res.status(400).json({ message: 'All booking fields are required' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(eventDate);
  selectedDate.setHours(0, 0, 0, 0);

  const diffTime = selectedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return res.status(400).json({
      message: 'Online booking is closed because the event date is within one month. Please contact customer care.'
    });
  }

  const typeOfEvent = eventType || 'General Event';
  const numGuests = guestsCount || 100;
  const sessionTime = eventSession || 'Full Day';

  try {
    // Check session overlapping availability
    let conflict = null;
    if (sessionTime === 'Full Day') {
      conflict = await db.get(
        'SELECT * FROM hall_bookings WHERE hallId = ? AND eventDate = ? AND status != ?',
        [hallId, eventDate, 'Cancelled']
      );
    } else {
      conflict = await db.get(
        'SELECT * FROM hall_bookings WHERE hallId = ? AND eventDate = ? AND status != ? AND (eventSession = ? OR eventSession = ?)',
        [hallId, eventDate, 'Cancelled', sessionTime, 'Full Day']
      );
    }

    if (conflict) {
      return res.status(400).json({
        message: `This hall is already booked for the selected date during the ${conflict.eventSession || 'Full Day'}. Please choose another date/session or hall.`
      });
    }

    const bookingId = 'GK-HALL-' + Math.floor(100000 + Math.random() * 900000);
    const bookingDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const createdAt = new Date().toISOString();

    const storedFoodItems = foodItems ? JSON.stringify(foodItems) : null;

    await db.run(
      `INSERT INTO hall_bookings (
        bookingId, userId, customerName, email, mobile, state, district, mandal,
        hallId, hallName, hallAddress, eventDate, bookingDate, costPerDay, totalAmount, status, createdAt,
        eventType, guestsCount, eventSession, foodItems
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        userId,
        customerName,
        email,
        mobile,
        state,
        district,
        mandal,
        hallId,
        hallName,
        hallAddress,
        eventDate,
        bookingDate,
        costPerDay,
        totalAmount,
        'Confirmed',
        createdAt,
        typeOfEvent,
        numGuests,
        sessionTime,
        storedFoodItems
      ]
    );

    const newBooking = {
      bookingId,
      userId,
      customerName,
      email,
      mobile,
      state,
      district,
      mandal,
      hallId,
      hallName,
      hallAddress,
      eventDate,
      bookingDate,
      costPerDay,
      totalAmount,
      capacity,
      status: 'Confirmed',
      createdAt,
      eventType: typeOfEvent,
      guestsCount: numGuests,
      eventSession: sessionTime,
      foodItems: storedFoodItems
    };

    sendBookingEmail(newBooking);

    return res.status(201).json({
      message: 'Booking completed successfully',
      booking: newBooking
    });
  } catch (error: any) {
    console.error('Hall booking error:', error);
    return res.status(500).json({ message: 'Internal server error during booking creation' });
  }
});

// GET User Hall Bookings
app.get('/api/bookings/hall', async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    let bookings;
    if (userId) {
      bookings = await db.all(
        'SELECT * FROM hall_bookings WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } else {
      bookings = await db.all('SELECT * FROM hall_bookings ORDER BY createdAt DESC');
    }
    return res.status(200).json(bookings);
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return res.status(500).json({ message: 'Internal server error while fetching bookings' });
  }
});

// PATCH Cancel Hall Booking
app.patch('/api/bookings/hall/:bookingId/cancel', async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const booking = await db.get('SELECT * FROM hall_bookings WHERE bookingId = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(booking.eventDate);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 15) {
      return res.status(400).json({
        message: 'Cancellations must be requested at least 15 days before the event. Please contact customer care.'
      });
    }

    await db.run('UPDATE hall_bookings SET status = ? WHERE bookingId = ?', ['Cancelled', bookingId]);
    console.log(`[Database] Booking ${bookingId} cancelled successfully`);

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Internal server error while cancelling booking' });
  }
});

// PUT Update Booking Food Items
app.put('/api/bookings/hall/:bookingId/food', async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { foodItems } = req.body;

  if (!Array.isArray(foodItems)) {
    return res.status(400).json({ message: 'foodItems must be an array' });
  }

  try {
    const booking = await db.get('SELECT * FROM hall_bookings WHERE bookingId = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate food cost
    let foodTotal = 0;
    for (const item of foodItems) {
      if (item.status === 'Unavailable') {
        if (item.replacedWith) {
          foodTotal += item.replacedWith.price;
        }
      } else {
        foodTotal += item.price;
      }
    }

    const newTotalAmount = booking.costPerDay + foodTotal;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE hall_bookings 
       SET foodItems = ?, totalAmount = ?, updatedAt = ? 
       WHERE bookingId = ?`,
      [JSON.stringify(foodItems), newTotalAmount, now, bookingId]
    );

    console.log(`[Database] Booking ${bookingId} food items updated successfully. New total: ₹${newTotalAmount}`);

    const updatedBooking = await db.get('SELECT * FROM hall_bookings WHERE bookingId = ?', [bookingId]);
    return res.status(200).json({
      message: 'Food items updated successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Update booking food error:', error);
    return res.status(500).json({ message: 'Internal server error while updating food items' });
  }
});

// PUT Update Full Hall Booking Details
app.put('/api/bookings/hall/:bookingId', async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const {
    customerName, email, mobile, hallId, hallName, hallAddress,
    eventDate, eventSession, startTime, endTime, eventType, guestsCount,
    foodItems, totalAmount, paymentStatus, status, specialNotes, changedBy
  } = req.body;

  try {
    const original = await db.get('SELECT * FROM hall_bookings WHERE bookingId = ?', [bookingId]);
    if (!original) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Default undefined fields to original values
    const finalCustomerName = customerName !== undefined ? customerName : original.customerName;
    const finalEmail = email !== undefined ? email : original.email;
    const finalMobile = mobile !== undefined ? mobile : original.mobile;
    const finalHallId = hallId !== undefined ? hallId : original.hallId;
    const finalHallName = hallName !== undefined ? hallName : original.hallName;
    const finalHallAddress = hallAddress !== undefined ? hallAddress : original.hallAddress;
    const finalEventDate = eventDate !== undefined ? eventDate : original.eventDate;
    const finalEventSession = eventSession !== undefined ? eventSession : original.eventSession;
    const finalStartTime = startTime !== undefined ? startTime : original.startTime;
    const finalEndTime = endTime !== undefined ? endTime : original.endTime;
    const finalEventType = eventType !== undefined ? eventType : original.eventType;
    const finalGuestsCount = guestsCount !== undefined ? guestsCount : original.guestsCount;
    const finalFoodItems = foodItems !== undefined ? foodItems : JSON.parse(original.foodItems || '[]');
    const finalTotalAmount = totalAmount !== undefined ? totalAmount : original.totalAmount;
    const finalPaymentStatus = paymentStatus !== undefined ? paymentStatus : original.paymentStatus;
    const finalStatus = status !== undefined ? status : original.status;
    const finalSpecialNotes = specialNotes !== undefined ? specialNotes : original.specialNotes;

    // Check availability only if hall, date, or session changed, and status is not Cancelled
    if (finalStatus !== 'Cancelled' &&
      (finalHallId !== original.hallId || finalEventDate !== original.eventDate || finalEventSession !== original.eventSession)) {

      let conflict = null;
      if (finalEventSession === 'Full Day') {
        conflict = await db.get(
          'SELECT * FROM hall_bookings WHERE hallId = ? AND eventDate = ? AND status != ? AND bookingId != ?',
          [finalHallId, finalEventDate, 'Cancelled', bookingId]
        );
      } else {
        conflict = await db.get(
          'SELECT * FROM hall_bookings WHERE hallId = ? AND eventDate = ? AND status != ? AND bookingId != ? AND (eventSession = ? OR eventSession = ?)',
          [finalHallId, finalEventDate, 'Cancelled', bookingId, finalEventSession, 'Full Day']
        );
      }

      if (conflict) {
        return res.status(400).json({
          message: `This hall is already booked for the selected date during the ${conflict.eventSession || 'Full Day'}. Please choose another date/session or hall.`
        });
      }
    }

    const nowStr = new Date().toISOString();
    const adminUser = changedBy || 'Admin';

    // Difference logger function
    const logDiff = async (fieldName: string, oldVal: any, newVal: any) => {
      const oldStr = oldVal === null || oldVal === undefined ? '' : String(oldVal);
      const newStr = newVal === null || newVal === undefined ? '' : String(newVal);
      if (oldStr !== newStr) {
        const histId = 'hist-' + Math.random().toString(36).substr(2, 9);
        await db.run(
          `INSERT INTO booking_history (id, bookingId, fieldName, oldValue, newValue, changedAt, changedBy)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [histId, bookingId, fieldName, oldStr, newStr, nowStr, adminUser]
        );
      }
    };

    // Audit Log comparisons
    await logDiff('Customer Name', original.customerName, finalCustomerName);
    await logDiff('Email', original.email, finalEmail);
    await logDiff('Mobile', original.mobile, finalMobile);
    await logDiff('Hall Name', original.hallName, finalHallName);
    await logDiff('Event Date', original.eventDate, finalEventDate);
    await logDiff('Session', original.eventSession, finalEventSession);
    await logDiff('Start Time', original.startTime, finalStartTime);
    await logDiff('End Time', original.endTime, finalEndTime);
    await logDiff('Event Type', original.eventType, finalEventType);
    await logDiff('Guests Count', original.guestsCount, finalGuestsCount);
    await logDiff('Booking Amount', original.totalAmount, finalTotalAmount);
    await logDiff('Payment Status', original.paymentStatus, finalPaymentStatus);
    await logDiff('Booking Status', original.status, finalStatus);
    await logDiff('Special Notes', original.specialNotes, finalSpecialNotes);

    const originalFoodStr = original.foodItems || '[]';
    const incomingFoodStr = JSON.stringify(finalFoodItems);
    await logDiff('Food Items', originalFoodStr, incomingFoodStr);

    // Save changes
    await db.run(
      `UPDATE hall_bookings 
       SET customerName = ?, email = ?, mobile = ?, hallId = ?, hallName = ?, hallAddress = ?,
           eventDate = ?, eventSession = ?, startTime = ?, endTime = ?, eventType = ?, guestsCount = ?,
           foodItems = ?, totalAmount = ?, paymentStatus = ?, status = ?, specialNotes = ?, updatedAt = ?
       WHERE bookingId = ?`,
      [
        finalCustomerName, finalEmail, finalMobile, finalHallId, finalHallName, finalHallAddress,
        finalEventDate, finalEventSession, finalStartTime, finalEndTime, finalEventType, finalGuestsCount,
        JSON.stringify(finalFoodItems), finalTotalAmount, finalPaymentStatus, finalStatus, finalSpecialNotes, nowStr,
        bookingId
      ]
    );

    const updatedBooking = await db.get('SELECT * FROM hall_bookings WHERE bookingId = ?', [bookingId]);
    return res.status(200).json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Update booking details error:', error);
    return res.status(500).json({ message: 'Internal server error while updating booking details' });
  }
});

// GET Booking Change History Audit Trail
app.get('/api/bookings/hall/:bookingId/history', async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  try {
    const history = await db.all(
      'SELECT * FROM booking_history WHERE bookingId = ? ORDER BY changedAt DESC',
      [bookingId]
    );
    return res.status(200).json(history);
  } catch (error: any) {
    console.error('Fetch booking history error:', error);
    return res.status(500).json({ message: 'Internal server error while fetching booking history' });
  }
});

// POST Contact Enquiry
app.post('/api/contact', async (req: Request, res: Response) => {
  const { userId, name, email, mobile, subject, message } = req.body;

  if (!name || !email || !mobile || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO contact_messages (id, userId, name, email, mobile, subject, message, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId || null, name, email, mobile, subject, message, 'Pending', createdAt]
    );

    return res.status(201).json({
      message: 'Message sent successfully!',
      enquiry: { id, userId, name, email, mobile, subject, message, status: 'Pending', createdAt }
    });
  } catch (error: any) {
    console.error('Contact message submit error:', error);
    return res.status(500).json({ message: 'Internal server error during message submission' });
  }
});

// POST Support Request
app.post('/api/support', async (req: Request, res: Response) => {
  const { userId, name, email, mobile, category, message } = req.body;

  if (!name || !email || !mobile || !category || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const id = 'req-' + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO support_requests (id, userId, name, email, mobile, category, message, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId || null, name, email, mobile, category, message, 'Pending', createdAt]
    );

    return res.status(201).json({
      message: 'Support request submitted successfully!',
      request: { id, userId, name, email, mobile, category, message, status: 'Pending', createdAt }
    });
  } catch (error: any) {
    console.error('Support request submit error:', error);
    return res.status(500).json({ message: 'Internal server error during support request submission' });
  }
});

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
