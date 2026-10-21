import prisma from '../config/database';
import { HallService } from '../services/hall.service';
import { BookingService } from '../services/booking.service';
import bcrypt from 'bcryptjs';

async function run() {
  console.log('=== Starting End-to-End Functional Hall Manager Verification ===\n');

  const hallService = new HallService();
  const bookingService = new BookingService();

  // 1. Find or create a test hall
  let hall = await prisma.hall.findFirst({
    where: { deletedAt: null }
  });

  if (!hall) {
    console.log('Creating a test hall...');
    hall = await hallService.createHall({
      name: 'Verification Grand Arena',
      capacity: 600,
      basePrice: 85000,
      location: 'Main Highway, Cyberabad',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Serilingampally'
    });
  }
  console.log(`[PASS] Using Hall: ${hall.name} (${hall.hallCode}, ID: ${hall.id})`);

  // Unlink any previous owner to start clean
  await prisma.hall.update({
    where: { id: hall.id },
    data: { ownerId: null }
  });

  // 2. Test Admin Overview: hall should show manager: null
  const overviewBefore = await hallService.getAdminOverview();
  const targetInOverview = overviewBefore.find(h => h.id === hall!.id);
  if (targetInOverview && targetInOverview.manager !== null) {
    throw new Error('Expected hall manager to be null before assignment');
  }
  console.log('[PASS] Admin overview correctly shows unmanaged hall');

  // 3. Test Admin Assigning / Creating new manager credentials
  const testLoginId = 'mgr_test_' + Math.random().toString(36).substr(2, 6);
  const testPassword = 'Password@123';
  const testEmail = `${testLoginId}@gkevent.test`;
  const testMobile = '99' + Math.floor(10000000 + Math.random() * 90000000).toString();

  console.log(`Assigning new manager with Login ID: ${testLoginId}...`);
  const assignedManager = await hallService.assignManager(hall.id, {
    name: 'Test Manager Suresh',
    loginId: testLoginId,
    email: testEmail,
    mobile: testMobile,
    password: testPassword
  });

  if (!assignedManager || assignedManager.loginId !== testLoginId) {
    throw new Error('Manager assignment failed or returned incorrect loginId');
  }
  console.log(`[PASS] Manager assigned successfully: ${assignedManager.name} (${assignedManager.id})`);

  // 4. Test Manager Login Credentials (bcrypt comparison)
  const userInDb = await prisma.user.findUnique({
    where: { id: assignedManager.id },
    include: { ownedHall: true }
  });

  if (!userInDb || !userInDb.ownedHall || userInDb.ownedHall.id !== hall.id) {
    throw new Error('Hall relation to user was not properly established in DB');
  }

  const passValid = await bcrypt.compare(testPassword, userInDb.password);
  if (!passValid) {
    throw new Error('Password hash does not match original password');
  }
  console.log('[PASS] Manager login credentials and hall association verified');

  // 5. Test HallService.getMyHall for manager
  const myHall = await hallService.getMyHall(assignedManager.id);
  if (!myHall || myHall.id !== hall.id) {
    throw new Error('getMyHall did not return the assigned hall');
  }
  console.log(`[PASS] Manager getMyHall verified: ${myHall.name}`);

  // 6. Test Admin Overview now includes manager
  const overviewAfter = await hallService.getAdminOverview();
  const targetAfter = overviewAfter.find(h => h.id === hall!.id);
  if (!targetAfter || !targetAfter.manager || targetAfter.manager.loginId !== testLoginId) {
    throw new Error('Admin overview did not include the new manager');
  }
  console.log('[PASS] Admin overview correctly includes assigned manager profile');

  // 7. Test Admin Reset Manager Password
  const newPassword = 'NewSecretPassword@456';
  console.log('Resetting manager password...');
  await hallService.resetManagerPassword(hall.id, newPassword);

  const updatedUser = await prisma.user.findUnique({ where: { id: assignedManager.id } });
  const oldPassMatches = await bcrypt.compare(testPassword, updatedUser!.password);
  const newPassMatches = await bcrypt.compare(newPassword, updatedUser!.password);

  if (oldPassMatches || !newPassMatches) {
    throw new Error('Password reset failed');
  }
  console.log('[PASS] Manager password reset verified (old password rejected, new password verified)');

  // 8. Test Admin Toggle Manager Active / Deactivate
  console.log('Deactivating manager account...');
  const activeStatus1 = await hallService.toggleManagerActive(hall.id, false);
  if (activeStatus1 !== false) {
    throw new Error('Deactivating manager failed');
  }

  const userDeactivated = await prisma.user.findUnique({ where: { id: assignedManager.id } });
  if (userDeactivated?.isActive !== false) {
    throw new Error('Database isActive flag was not set to false');
  }
  console.log('[PASS] Manager account successfully deactivated');

  console.log('Re-activating manager account...');
  const activeStatus2 = await hallService.toggleManagerActive(hall.id, true);
  if (activeStatus2 !== true) {
    throw new Error('Re-activating manager failed');
  }
  console.log('[PASS] Manager account successfully re-activated');

  // 9. Test Booking Flow & Status Update by Manager
  let testBooking = await prisma.booking.findFirst({
    where: { hallId: hall.id }
  });

  if (!testBooking) {
    // Create a mock booking for testing status transition
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    testBooking = await prisma.booking.create({
      data: {
        id: 'b-test-' + Math.random().toString(36).substr(2, 8),
        bookingNumber: 'BK-TEST-' + Math.floor(1000 + Math.random() * 9000),
        hallId: hall.id,
        eventDate: tomorrow,
        startTime: '10:00',
        endTime: '16:00',
        totalAmount: 85000,
        status: 'PENDING',
        paymentStatus: 'PAID'
      }
    });
  }

  console.log(`Testing manager status update on booking ${testBooking.bookingNumber}...`);
  const updatedBooking = await bookingService.updateStatus(
    testBooking.id,
    'CONFIRMED',
    assignedManager.id,
    'Hall_Manager'
  );
  if (updatedBooking.status !== 'CONFIRMED') {
    throw new Error('Manager could not update booking status to CONFIRMED');
  }
  console.log('[PASS] Manager successfully updated booking status to CONFIRMED');

  // 10. Test Admin Revoke Manager Assignment
  console.log('Revoking manager assignment...');
  await hallService.revokeManager(hall.id);

  const hallUnassigned = await prisma.hall.findUnique({ where: { id: hall.id } });
  if (hallUnassigned?.ownerId !== null) {
    throw new Error('Revoking manager did not clear hall.ownerId');
  }
  console.log('[PASS] Manager assignment revoked successfully');

  // Clean up test data
  if (testBooking.id.startsWith('b-test-')) {
    await prisma.booking.delete({ where: { id: testBooking.id } });
  }
  await prisma.user.delete({ where: { id: assignedManager.id } });

  console.log('\n=== ALL 10 INTEGRATION CHECKS PASSED WITH ZERO ERRORS ===');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('\nVerification failed:', err);
  prisma.$disconnect().then(() => process.exit(1));
});
