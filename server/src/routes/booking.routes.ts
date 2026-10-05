import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new BookingController();

// Create pending booking & Razorpay Order
router.post('/create-pending', authMiddleware, (req, res) => controller.createPendingBooking(req, res));

// Create standard booking
router.post('/', authMiddleware, roleMiddleware(['Customer', 'Admin']), (req, res) => controller.createBooking(req, res));

// Get my bookings (Customer)
router.get('/my-bookings', authMiddleware, (req, res) => controller.getMyBookings(req, res));

// Get booking by ID (Customer / Admin / Employee)
router.get('/:id', authMiddleware, (req, res) => controller.getBookingById(req, res));

// Get all bookings (Admin / Employee)
router.get('/', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getAllBookings(req, res));

// Update booking status (Admin / Employee)
router.patch('/:id/status', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.updateBookingStatus(req, res));

// Cancel booking (Customer/Admin/Employee)
router.patch('/:id/cancel', authMiddleware, (req, res) => controller.cancelBooking(req, res));

export default router;
