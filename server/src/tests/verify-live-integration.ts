import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BookingService } from '../services/booking.service';
import { HallService } from '../services/hall.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

async function runLiveVerification() {
  console.log('=== Running Live End-to-End Database Integration Verification ===\n');

  try {
    // 1. Verify Owner record in PostgreSQL
    console.log('1. Checking Owner user record in Supabase...');
    const owner = await prisma.user.findFirst({
      where: { loginId: 'GKFH001' },
      include: { ownedHall: true }
    });

    if (!owner) throw new Error('Owner record GKFH001 not found');
    console.log(`Found Owner: ${owner.name} (Role: ${owner.role})`);
    console.log(`Linked Hall: ${owner.ownedHall?.name} (Code: ${owner.ownedHall?.hallCode}, ID: ${owner.ownedHall?.id})\n`);

    // 2. Verify Password Match
    console.log('2. Verifying password check logic...');
    const isPasswordValid = await bcrypt.compare('GK@12345', owner.password);
    if (!isPasswordValid) throw new Error('Password hash does not match GK@12345');
    console.log('Password verified successfully.\n');

    // 3. Issue Token
    console.log('3. Generating JWT token for owner...');
    const token = jwt.sign(
      { id: owner.id, role: owner.role, hallId: owner.ownedHall?.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('JWT generated successfully.\n');

    // 4. Test HallService.getMyHall
    console.log('4. Testing HallService.getMyHall...');
    const hallService = new HallService();
    const myHall = await hallService.getMyHall(owner.id);
    if (!myHall || myHall.id !== owner.ownedHall?.id) {
      throw new Error('HallService.getMyHall failed to return the correct hall');
    }
    console.log(`HallService returned: ${myHall.name} (${myHall.hallCode})\n`);

    // 5. Test BookingService.getOwnerHallBookings
    console.log('5. Testing BookingService.getOwnerHallBookings...');
    const bookingService = new BookingService();
    const ownerBookingsResult = await bookingService.getOwnerHallBookings(owner.id);
    console.log(`Total Bookings for this hall: ${ownerBookingsResult.total}`);
    console.log(`Hall metadata: ${ownerBookingsResult.hall.name} (${ownerBookingsResult.hall.hallCode})\n`);

    // 6. Test Creating a Booking and Updating Status
    console.log('6. Creating test booking for GK Grand Convention Hall...');
    // Find customer to own the booking
    let customerUser = await prisma.user.findFirst({ where: { role: 'Customer' } });
    if (!customerUser) {
      customerUser = await prisma.user.findFirst();
    }

    const testEventDate = new Date();
    testEventDate.setDate(testEventDate.getDate() + 45); // 45 days in future
    testEventDate.setUTCHours(0, 0, 0, 0);

    // Clean up any test booking on that test date
    await prisma.booking.deleteMany({
      where: {
        hallId: myHall.id,
        eventDate: testEventDate
      }
    });

    const booking = await bookingService.create(customerUser!.id, {
      hallId: myHall.id,
      eventType: 'Live Integration Test Reception',
      eventDate: testEventDate.toISOString(),
      startTime: '10:00',
      endTime: '16:00',
      guestCount: 300,
      notes: 'End-to-end integration verification booking'
    });

    console.log(`Created Booking: Number: ${booking.bookingNumber}, ID: ${booking.id}, Status: ${booking.status}`);

    // Verify it appears in Owner bookings feed
    const updatedOwnerBookings = await bookingService.getOwnerHallBookings(owner.id);
    const found = updatedOwnerBookings.bookings.find(b => b.id === booking.id);
    if (!found) throw new Error('Created booking does not appear in owner bookings feed');
    console.log('Newly created booking verified in Owner Bookings feed.\n');

    // 7. Owner updates booking status to CONFIRMED
    console.log('7. Testing Owner Status Update to CONFIRMED...');
    const updatedBooking = await bookingService.updateStatus(booking.id, 'CONFIRMED', owner.id, 'Owner');
    if (updatedBooking.status !== 'CONFIRMED') {
      throw new Error(`Expected status CONFIRMED, got ${updatedBooking.status}`);
    }
    console.log(`Booking status successfully updated by Owner to: ${updatedBooking.status}\n`);

    // Clean up test booking
    await prisma.booking.delete({ where: { id: booking.id } });
    console.log('Test booking cleaned up cleanly.\n');

    console.log('=== All Live End-to-End Verifications PASSED! ===');

  } catch (err) {
    console.error('Live Verification Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runLiveVerification();
