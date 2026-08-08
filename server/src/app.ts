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

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
