import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma, { connectDb } from './config/database';
import bookingRoutes from './routes/booking.routes';
import hallRoutes from './routes/hall.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import reportRoutes from './routes/report.routes';
import calendarRoutes from './routes/calendar.routes';
import vendorRoutes from './routes/vendor.routes';
import inventoryRoutes from './routes/inventory.routes';
import quotationRoutes from './routes/quotation.routes';
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';
import taskRoutes from './routes/task.routes';
import travelRoutes from './routes/travel.routes';
import settingsRoutes from './routes/settings.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';

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

// Helper to map Prisma HallBooking to expected frontend schema
function mapBookingResponse(b: any) {
  if (!b) return b;
  return {
    ...b,
    bookingId: b.id,
  };
}

// JWT Helpers & Middlewares
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

function generateToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
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

export function roleMiddleware(allowedRoles: string[]) {
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
    const existingMobile = await prisma.user.findUnique({ where: { mobile } });
    if (existingMobile) {
      return res.status(400).json({ message: 'This mobile number is already registered' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email address is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);

    // Insert user
    await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        mobile,
        password: hashedPassword,
        referralCode: referralCode || null,
        role: 'Customer',
      }
    });

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
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: identifier },
          { email: identifier }
        ]
      }
    });

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
    const items = await prisma.foodItem.findMany({
      orderBy: [
        { category: 'desc' },
        { name: 'asc' }
      ]
    });
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
    const newItem = await prisma.foodItem.create({
      data: {
        id,
        name,
        category,
        price: Number(price),
        active: active ? 1 : 0
      }
    });

    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Create food item error:', error);
    return res.status(500).json({ message: 'Internal server error while creating food item' });
  }
});

app.put('/api/food-items/:id', async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, category, price, active } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Name, category and price are required' });
  }

  try {
    const existing = await prisma.foodItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const updatedItem = await prisma.foodItem.update({
      where: { id },
      data: {
        name,
        category,
        price: Number(price),
        active: active ? 1 : 0
      }
    });

    return res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error('Update food item error:', error);
    return res.status(500).json({ message: 'Internal server error while updating food item' });
  }
});

app.delete('/api/food-items/:id', async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  try {
    const existing = await prisma.foodItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await prisma.foodItem.delete({ where: { id } });
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      registrationDate: user.createdAt.toISOString()
    };

    return res.status(200).json({
      user: mappedUser
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
    const user = await prisma.user.findUnique({ where: { mobile } });
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

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await prisma.otp.upsert({
        where: { mobile },
        update: {
          code: generatedOtp,
          expiresAt
        },
        create: {
          mobile,
          code: generatedOtp,
          expiresAt
        }
      });

      console.log(`[MOCK OTP] Mobile: ${mobile} | Code: ${generatedOtp} | Expires: ${expiresAt}`);
      return res.status(200).json({
        message: 'OTP sent successfully (Development Mode)',
        devOtp: generatedOtp
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

      if (!response.ok || responseData.type === 'success') {
        console.error('[MSG91] Verification failure:', responseData);
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      console.log(`[MSG91] OTP verified successfully for ${formattedMobile}`);
    } else {
      // Verify locally via Otp model
      const storedOtp = await prisma.otp.findUnique({ where: { mobile } });

      if (!storedOtp) {
        return res.status(400).json({ message: 'No OTP requested for this mobile number' });
      }

      if (storedOtp.code !== otp) {
        return res.status(400).json({ message: 'Incorrect OTP entered' });
      }

      if (new Date() > new Date(storedOtp.expiresAt)) {
        await prisma.otp.delete({ where: { mobile } });
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Valid OTP. Delete from DB.
      await prisma.otp.delete({ where: { mobile } });
      console.log(`[MOCK OTP] Verified successfully for ${mobile}`);
    }

    // Hash new password and update user record
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { mobile },
      data: { password: hashedPassword }
    });

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
      conflict = await prisma.hallBooking.findFirst({
        where: {
          hallId,
          eventDate,
          status: { not: 'Cancelled' }
        }
      });
    } else {
      conflict = await prisma.hallBooking.findFirst({
        where: {
          hallId,
          eventDate,
          status: { not: 'Cancelled' },
          OR: [
            { eventSession: sessionTime },
            { eventSession: 'Full Day' }
          ]
        }
      });
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
    const createdAt = new Date();

    const storedFoodItems = foodItems ? JSON.stringify(foodItems) : null;

    const booking = await prisma.hallBooking.create({
      data: {
        id: bookingId,
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
        costPerDay: Number(costPerDay),
        totalAmount: Number(totalAmount),
        status: 'Confirmed',
        createdAt,
        eventType: typeOfEvent,
        guestsCount: Number(numGuests),
        eventSession: sessionTime,
        foodItems: storedFoodItems
      }
    });

    const responseBooking = {
      ...mapBookingResponse(booking),
      capacity
    };

    sendBookingEmail(responseBooking);

    return res.status(201).json({
      message: 'Booking completed successfully',
      booking: responseBooking
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
      bookings = await prisma.hallBooking.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      bookings = await prisma.hallBooking.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }
    return res.status(200).json(bookings.map(mapBookingResponse));
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return res.status(500).json({ message: 'Internal server error while fetching bookings' });
  }
});

// PATCH Cancel Hall Booking
app.patch('/api/bookings/hall/:bookingId/cancel', async (req: Request, res: Response) => {
  const { bookingId } = req.params as { bookingId: string };

  try {
    const booking = await prisma.hallBooking.findUnique({ where: { id: bookingId } });
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

    await prisma.hallBooking.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' }
    });
    console.log(`[Database] Booking ${bookingId} cancelled successfully`);

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Internal server error while cancelling booking' });
  }
});

// PUT Update Booking Food Items
app.put('/api/bookings/hall/:bookingId/food', async (req: Request, res: Response) => {
  const { bookingId } = req.params as { bookingId: string };
  const { foodItems } = req.body;

  if (!Array.isArray(foodItems)) {
    return res.status(400).json({ message: 'foodItems must be an array' });
  }

  try {
    const booking = await prisma.hallBooking.findUnique({ where: { id: bookingId } });
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

    const updatedBooking = await prisma.hallBooking.update({
      where: { id: bookingId },
      data: {
        foodItems: JSON.stringify(foodItems),
        totalAmount: newTotalAmount
      }
    });

    console.log(`[Database] Booking ${bookingId} food items updated successfully. New total: ₹${newTotalAmount}`);

    return res.status(200).json({
      message: 'Food items updated successfully',
      booking: mapBookingResponse(updatedBooking)
    });
  } catch (error: any) {
    console.error('Update booking food error:', error);
    return res.status(500).json({ message: 'Internal server error while updating food items' });
  }
});

// PUT Update Full Hall Booking Details
app.put('/api/bookings/hall/:bookingId', async (req: Request, res: Response) => {
  const { bookingId } = req.params as { bookingId: string };
  const {
    customerName, email, mobile, hallId, hallName, hallAddress,
    eventDate, eventSession, startTime, endTime, eventType, guestsCount,
    foodItems, totalAmount, paymentStatus, status, specialNotes, changedBy
  } = req.body;

  try {
    const original = await prisma.hallBooking.findUnique({ where: { id: bookingId } });
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
        conflict = await prisma.hallBooking.findFirst({
          where: {
            hallId: finalHallId,
            eventDate: finalEventDate,
            status: { not: 'Cancelled' },
            id: { not: bookingId }
          }
        });
      } else {
        conflict = await prisma.hallBooking.findFirst({
          where: {
            hallId: finalHallId,
            eventDate: finalEventDate,
            status: { not: 'Cancelled' },
            id: { not: bookingId },
            OR: [
              { eventSession: finalEventSession },
              { eventSession: 'Full Day' }
            ]
          }
        });
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
        await prisma.bookingHistory.create({
          data: {
            id: histId,
            bookingId,
            fieldName,
            oldValue: oldStr,
            newValue: newStr,
            changedAt: nowStr,
            changedBy: adminUser
          }
        });
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
    const updatedBooking = await prisma.hallBooking.update({
      where: { id: bookingId },
      data: {
        customerName: finalCustomerName,
        email: finalEmail,
        mobile: finalMobile,
        hallId: finalHallId,
        hallName: finalHallName,
        hallAddress: finalHallAddress,
        eventDate: finalEventDate,
        eventSession: finalEventSession,
        startTime: finalStartTime,
        endTime: finalEndTime,
        eventType: finalEventType,
        guestsCount: Number(finalGuestsCount),
        foodItems: JSON.stringify(finalFoodItems),
        totalAmount: Number(finalTotalAmount),
        paymentStatus: finalPaymentStatus,
        status: finalStatus,
        specialNotes: finalSpecialNotes
      }
    });

    return res.status(200).json({
      message: 'Booking updated successfully',
      booking: mapBookingResponse(updatedBooking)
    });
  } catch (error: any) {
    console.error('Update booking details error:', error);
    return res.status(500).json({ message: 'Internal server error while updating booking details' });
  }
});

// GET Booking Change History Audit Trail
app.get('/api/bookings/hall/:bookingId/history', async (req: Request, res: Response) => {
  const { bookingId } = req.params as { bookingId: string };
  try {
    const history = await prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' }
    });
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
    const enquiry = await prisma.contactMessage.create({
      data: {
        id,
        userId: userId || null,
        name,
        email,
        mobile,
        subject,
        message,
        status: 'Pending'
      }
    });

    return res.status(201).json({
      message: 'Message sent successfully!',
      enquiry
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
    const request = await prisma.supportRequest.create({
      data: {
        id,
        userId: userId || null,
        name,
        email,
        mobile,
        category,
        message,
        status: 'Pending'
      }
    });

    return res.status(201).json({
      message: 'Support request submitted successfully!',
      request
    });
  } catch (error: any) {
    console.error('Support request submit error:', error);
    return res.status(500).json({ message: 'Internal server error during support request submission' });
  }
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Start Server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
