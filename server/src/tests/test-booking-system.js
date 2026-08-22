const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:5050/api';

async function runTests() {
  console.log('=== Starting Event Booking System Integration Tests ===\n');

  try {
    // 1. Authenticate Customer
    console.log('1. Authenticating customer...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Failed to log in as customer: ${loginData.message}`);
    }
    const customerToken = loginData.token;
    console.log('Customer authenticated successfully.\n');

    // 2. Ensure Test Hall exists in the database
    console.log('2. Preparing test hall in PostgreSQL...');
    let hall = await prisma.hall.findUnique({ where: { hallCode: 'T-LGA' } });
    if (!hall) {
      hall = await prisma.hall.create({
        data: {
          hallCode: 'T-LGA',
          name: 'Luxury Grand Arena',
          description: 'A grand luxury arena for events',
          location: 'Hyderabad',
          capacity: 500,
          basePrice: 15000,
          status: 'AVAILABLE'
        }
      });
      console.log('Test hall created.');
    } else {
      console.log('Test hall already exists.');
    }
    console.log(`Hall ID: ${hall.id}, Base Price: ${hall.basePrice}\n`);

    // Clean up test bookings to make the test idempotent
    console.log('Cleaning up existing bookings for test hall on test dates...');
    const d25 = new Date('2026-08-25');
    d25.setUTCHours(0, 0, 0, 0);
    const d26 = new Date('2026-08-26');
    d26.setUTCHours(0, 0, 0, 0);
    await prisma.booking.deleteMany({
      where: {
        hallId: hall.id,
        eventDate: {
          in: [d25, d26]
        }
      }
    });
    console.log('Cleanup complete.\n');

    // 3. Verify Hall Availability initially
    console.log('3. Checking initial availability for 2026-08-25...');
    const availRes = await fetch(`${API_BASE}/halls/availability?date=2026-08-25`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const availData = await availRes.json();
    const testHallAvail = availData.halls.find(h => h.id === hall.id);
    console.log(`Available state: ${testHallAvail ? testHallAvail.available : 'NOT FOUND'}`);
    if (!testHallAvail || !testHallAvail.available) {
      throw new Error('Test hall should be available initially.');
    }
    console.log('Initial availability check passed.\n');

    // 4. Customer A books the hall
    console.log('4. Creating booking for Customer A on 2026-08-25 (09:00 - 18:00)...');
    const bookRes1 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hallId: hall.id,
        eventType: 'Wedding Ceremony',
        eventDate: '2026-08-25',
        startTime: '09:00',
        endTime: '18:00',
        guestCount: 250,
        notes: 'High-profile luxury wedding setup'
      })
    });
    const bookData1 = await bookRes1.json();
    if (!bookRes1.ok) {
      throw new Error(`Booking failed: ${bookData1.message}`);
    }
    const bookingId1 = bookData1.booking.id;
    console.log(`Booking created successfully! ID: ${bookingId1}`);
    console.log(`Secured Total Amount: ${bookData1.booking.totalAmount} (expected 15000)\n`);

    // 5. Verify Hall is now unavailable
    console.log('5. Verifying hall is now unavailable...');
    const availRes2 = await fetch(`${API_BASE}/halls/availability?date=2026-08-25`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const availData2 = await availRes2.json();
    const testHallAvail2 = availData2.halls.find(h => h.id === hall.id);
    console.log(`Available state: ${testHallAvail2 ? testHallAvail2.available : 'NOT FOUND'}`);
    if (testHallAvail2 && testHallAvail2.available) {
      throw new Error('Test hall should be unavailable after booking.');
    }
    console.log('Availability change verified.\n');

    // 6. Customer B attempts to book overlapping slot (10:00 - 14:00)
    console.log('6. Attempting double-booking (overlapping slot 10:00 - 14:00)...');
    const bookRes2 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hallId: hall.id,
        eventType: 'Engagement Ceremony',
        eventDate: '2026-08-25',
        startTime: '10:00',
        endTime: '14:00',
        guestCount: 100,
        notes: 'Overlapping attempt'
      })
    });
    const bookData2 = await bookRes2.json();
    console.log(`Response Code: ${bookRes2.status}`);
    console.log(`Response JSON:`, JSON.stringify(bookData2));
    if (bookRes2.status !== 409) {
      throw new Error(`Expected HTTP 409 but got ${bookRes2.status}`);
    }
    if (bookData2.success !== false || !bookData2.message.includes('already been booked')) {
      throw new Error('Invalid error response message on double booking.');
    }
    console.log('Double booking rejected correctly with 409 Conflict!\n');

    // 7. Test simultaneous bookings (Concurrency)
    console.log('7. Testing concurrency: sending 5 simultaneous bookings for 2026-08-26 (09:00 - 18:00)...');
    const concurrentRequests = Array.from({ length: 5 }).map(() =>
      fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          hallId: hall.id,
          eventType: 'Birthday Party',
          eventDate: '2026-08-26',
          startTime: '09:00',
          endTime: '18:00',
          guestCount: 50
        })
      })
    );

    const responses = await Promise.all(concurrentRequests);
    const results = await Promise.all(responses.map(r => r.json().then(data => ({ status: r.status, data }))));

    const successes = results.filter(r => r.status === 201);
    const conflicts = results.filter(r => r.status === 409);

    console.log(`Success count: ${successes.length}`);
    console.log(`Conflict (409) count: ${conflicts.length}`);

    if (successes.length !== 1 || conflicts.length !== 4) {
      throw new Error(`Concurrency check failed: Expected exactly 1 success and 4 conflicts, but got ${successes.length} successes and ${conflicts.length} conflicts.`);
    }
    console.log('Concurrency check passed: Transaction locking successfully prevented double-booking!\n');

    // 8. Cancel Customer A's booking
    console.log(`8. Cancelling Customer A's booking (ID: ${bookingId1})...`);
    const cancelRes = await fetch(`${API_BASE}/bookings/${bookingId1}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const cancelData = await cancelRes.json();
    if (!cancelRes.ok) {
      throw new Error(`Failed to cancel booking: ${cancelData.message}`);
    }
    console.log('Booking cancelled successfully.\n');

    // 9. Verify availability is restored
    console.log('9. Checking availability for 2026-08-25 after cancellation...');
    const availRes3 = await fetch(`${API_BASE}/halls/availability?date=2026-08-25`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const availData3 = await availRes3.json();
    const testHallAvail3 = availData3.halls.find(h => h.id === hall.id);
    console.log(`Available state: ${testHallAvail3 ? testHallAvail3.available : 'NOT FOUND'}`);
    if (!testHallAvail3 || !testHallAvail3.available) {
      throw new Error('Test hall should be available after booking is cancelled.');
    }
    console.log('Availability restore check passed.\n');

    // 10. Customer B books hall now
    console.log('10. Creating booking for Customer B on 2026-08-25 (now that it is cancelled)...');
    const bookRes3 = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hallId: hall.id,
        eventType: 'Engagement Ceremony',
        eventDate: '2026-08-25',
        startTime: '10:00',
        endTime: '14:00',
        guestCount: 100,
        notes: 'Retry after cancellation'
      })
    });
    const bookData3 = await bookRes3.json();
    if (!bookRes3.ok) {
      throw new Error(`Booking failed: ${bookData3.message}`);
    }
    console.log(`Booking for Customer B created successfully! ID: ${bookData3.booking.id}\n`);

    console.log('=== All Event Booking Integration Tests Passed Successfully! ===');
  } catch (error) {
    console.error('=== TEST FAILURE ===');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
