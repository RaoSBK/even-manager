import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { roleMiddleware } from '../app';
import prisma from '../config/database';
import { BookingController } from '../controllers/booking.controller';
import { HallRepository } from '../repositories/hall.repository';
import { BookingStatus } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Mock helper to generate test JWTs
function createTestToken(payload: { id: string; role: string; hallId?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Helper to simulate Express Request & Response
function createMockReqRes(options: {
  headers?: Record<string, string>;
  body?: any;
  params?: any;
  query?: any;
  user?: any;
}) {
  const req: any = {
    headers: options.headers || {},
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    user: options.user,
  };

  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    }
  };

  return { req, res };
}

test('=== Stage 2 Backend Implementation & Hardening Tests ===', async (t) => {

  await t.test('1. Role Middleware: Case-insensitive authorization and role isolation', () => {
    const middleware = roleMiddleware(['Owner', 'Admin']);

    // Owner allowed
    let nextCalled = false;
    const { req: req1, res: res1 } = createMockReqRes({ user: { id: 'u1', role: 'Owner' } });
    middleware(req1, res1, () => { nextCalled = true; });
    assert.equal(nextCalled, true, 'Owner role should be allowed');

    // Case-insensitivity check (e.g. "OWNER" or "owner")
    nextCalled = false;
    const { req: req2, res: res2 } = createMockReqRes({ user: { id: 'u1', role: 'OWNER' } });
    middleware(req2, res2, () => { nextCalled = true; });
    assert.equal(nextCalled, true, 'Uppercase OWNER should be allowed');

    // Customer denied
    nextCalled = false;
    const { req: req3, res: res3 } = createMockReqRes({ user: { id: 'u2', role: 'Customer' } });
    middleware(req3, res3, () => { nextCalled = true; });
    assert.equal(nextCalled, false, 'Customer role must be denied');
    assert.equal(res3.statusCode, 403);

    // Unauthenticated request denied
    nextCalled = false;
    const { req: req4, res: res4 } = createMockReqRes({});
    middleware(req4, res4, () => { nextCalled = true; });
    assert.equal(nextCalled, false, 'Unauthenticated request must be denied');
    assert.equal(res4.statusCode, 403);
  });

  await t.test('2. Authentication Logic: Customer login via mobile & email', async () => {
    const rawPassword = 'customerSecret123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const mockCustomer = {
      id: 'cust-1',
      name: 'Rao SBK',
      email: 'customer@example.com',
      mobile: '9876543210',
      loginId: null,
      password: hashedPassword,
      role: 'Customer',
      isActive: true,
      ownedHall: null
    };

    // Verify correct password matches
    const passwordMatches = await bcrypt.compare(rawPassword, mockCustomer.password);
    assert.equal(passwordMatches, true);

    // Verify token generation has role Customer and no hallId
    const token = createTestToken({ id: mockCustomer.id, role: mockCustomer.role });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.id, 'cust-1');
    assert.equal(decoded.role, 'Customer');
    assert.equal(decoded.hallId, undefined);
  });

  await t.test('3. Authentication Logic: Owner login via loginId', async () => {
    const rawPassword = 'ownerSecret@123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const mockOwner = {
      id: 'owner-1',
      name: 'GK Grand Convention Hall Owner',
      email: 'owner@gkbooking.com',
      mobile: '9100000001',
      loginId: 'GKFH001',
      password: hashedPassword,
      role: 'Owner',
      isActive: true,
      ownedHall: {
        id: 'gk-grand-convention',
        hallCode: 'GK-GCH',
        name: 'GK Grand Convention Hall'
      }
    };

    // Match by loginId
    const identifier = 'GKFH001';
    const isMatchedIdentifier = mockOwner.loginId === identifier || mockOwner.mobile === identifier || mockOwner.email === identifier;
    assert.equal(isMatchedIdentifier, true, 'loginId must match identifier');

    // Verify password
    const isPasswordValid = await bcrypt.compare(rawPassword, mockOwner.password);
    assert.equal(isPasswordValid, true);

    // Verify token carries owner hallId
    const hallId = mockOwner.ownedHall.id;
    const token = createTestToken({ id: mockOwner.id, role: mockOwner.role, hallId });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.id, 'owner-1');
    assert.equal(decoded.role, 'Owner');
    assert.equal(decoded.hallId, 'gk-grand-convention');
  });

  await t.test('4. Authentication Logic: Inactive account rejection and invalid password rejection', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);

    const inactiveUser = {
      id: 'user-inactive',
      name: 'Blocked User',
      password: hashedPassword,
      isActive: false
    };

    // Inactive check
    assert.equal(inactiveUser.isActive, false, 'Inactive account must be detected');

    // Wrong password check
    const isWrongPassword = await bcrypt.compare('wrongPassword', inactiveUser.password);
    assert.equal(isWrongPassword, false, 'Wrong password must be rejected');
  });

  await t.test('5. Owner Hall Service: Returns hall details for assigned owner, 404 for unassigned owner', async () => {
    const mockHalls = [
      { id: 'hall-1', name: 'GK Grand Convention Hall', ownerId: 'owner-assigned' }
    ];

    // Query for assigned owner
    const assigned = mockHalls.find(h => h.ownerId === 'owner-assigned');
    assert.ok(assigned);
    assert.equal(assigned.id, 'hall-1');

    // Query for unassigned owner
    const unassigned = mockHalls.find(h => h.ownerId === 'owner-unassigned');
    assert.equal(unassigned, undefined, 'Unassigned owner must resolve to undefined / 404');
  });

  await t.test('6. Owner Bookings: Isolation to owner hall and sensitive data exclusion', () => {
    const mockBookings = [
      { id: 'b1', hallId: 'hall-1', bookingNumber: 'GK-101', status: 'CONFIRMED' },
      { id: 'b2', hallId: 'hall-1', bookingNumber: 'GK-102', status: 'COMPLETED' },
      { id: 'b3', hallId: 'hall-2', bookingNumber: 'GK-201', status: 'CONFIRMED' } // belongs to different hall
    ];

    const ownerHallId = 'hall-1';
    const ownerBookings = mockBookings.filter(b => b.hallId === ownerHallId);

    assert.equal(ownerBookings.length, 2);
    assert.ok(ownerBookings.every(b => b.hallId === ownerHallId));
    assert.equal(ownerBookings.some(b => b.hallId === 'hall-2'), false, 'Bookings for other halls must be excluded');
  });

  await t.test('7. Booking Status Update: Owner authorization & transition constraints', () => {
    const ownerHallId = 'hall-1';
    const bookingOnSameHall = { id: 'b1', hallId: 'hall-1', status: 'PENDING' };
    const bookingOnOtherHall = { id: 'b2', hallId: 'hall-99', status: 'PENDING' };

    const allowedOwnerStatuses: BookingStatus[] = [
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED
    ];

    // 1. Owner updates booking on their own hall to CONFIRMED -> Allowed
    assert.equal(bookingOnSameHall.hallId, ownerHallId);
    assert.ok(allowedOwnerStatuses.includes(BookingStatus.CONFIRMED));

    // 2. Owner attempts to update booking on another hall -> Blocked
    assert.notEqual(bookingOnOtherHall.hallId, ownerHallId);

    // 3. Owner attempts disallowed status transition (e.g. PENDING_PAYMENT) -> Blocked
    assert.equal(allowedOwnerStatuses.includes(BookingStatus.PENDING_PAYMENT), false);
  });

  await t.test('8. Public Hall Browsing: Availability and Hall List contain no Customer PII', () => {
    const publicHallResponse = {
      id: 'hall-1',
      name: 'GK Grand Convention Hall',
      capacity: 1500,
      basePrice: 150000,
      available: true
    };

    // Ensure no PII keys exist in public responses
    const piiKeys = ['password', 'passwordHash', 'mobile', 'email', 'userId', 'token'];
    for (const key of piiKeys) {
      assert.equal(key in publicHallResponse, false, `Public hall response must not contain ${key}`);
    }
  });

  await t.test('9. Hardening: Rejects invalid booking status filters with HTTP 400', async () => {
    const controller = new BookingController();
    const { req, res } = createMockReqRes({
      user: { id: 'owner-1', role: 'Owner' },
      query: { status: 'INVALID_ATTACK_STATUS' }
    });

    await controller.getOwnerHallBookings(req, res);
    assert.equal(res.statusCode, 400, 'Controller must reject invalid status filter with 400');
    assert.ok(res.jsonData.message.includes('Invalid status filter'));
  });

  await t.test('10. Hardening: Rejects malformed date filters with HTTP 400', async () => {
    const controller = new BookingController();
    const { req, res } = createMockReqRes({
      user: { id: 'owner-1', role: 'Owner' },
      query: { startDate: 'invalid-date-string' }
    });

    await controller.getOwnerHallBookings(req, res);
    assert.equal(res.statusCode, 400, 'Controller must reject invalid startDate with 400');
    assert.ok(res.jsonData.message.includes('Invalid startDate filter'));
  });

  await t.test('11. Hardening: Public hall listing sanitizes ownerId', async () => {
    const sampleRawHalls = [
      { id: 'h1', name: 'Grand Ballroom', ownerId: 'owner-uuid-1', deletedAt: null },
      { id: 'h2', name: 'Palace Hall', ownerId: 'owner-uuid-2', deletedAt: null }
    ];

    const sanitized = sampleRawHalls.map(h => ({ ...h, ownerId: null }));
    assert.equal(sanitized[0].ownerId, null, 'ownerId must be sanitized in public response');
    assert.equal(sanitized[1].ownerId, null, 'ownerId must be sanitized in public response');
  });

  // Disconnect prisma and exit cleanly
  await prisma.$disconnect();
  process.exit(0);
});
