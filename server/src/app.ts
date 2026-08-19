import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';

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
      role: 'Customer' // using Customer since no employee page is in router
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
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.run(
        `INSERT INTO users (id, name, email, mobile, password, role, registrationDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.mobile, hashedPassword, user.role, new Date().toISOString()]
      );
    }
  }

  console.log('Database initialized and seeded.');
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

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, name, email, mobile, role: 'Customer' }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile number and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!user) {
      return res.status(400).json({ message: 'This mobile number is not registered. Please sign up first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({
      message: 'Login successful',
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

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
