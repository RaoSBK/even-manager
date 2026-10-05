import { PrismaClient, HallStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Hash passwords
  const adminHash = await bcrypt.hash('admin123', 10);
  const employeeHash = await bcrypt.hash('employee123', 10);
  const customerHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  console.log('Seeding Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gkevents.com' },
    update: {},
    create: {
      id: 'admin-seed',
      name: 'Admin',
      email: 'admin@gkevents.com',
      mobile: '9999999999',
      password: adminHash,
      role: 'Admin',
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@gkevents.com' },
    update: {},
    create: {
      id: 'employee-seed',
      name: 'Employee',
      email: 'employee@gkevents.com',
      mobile: '8888888888',
      password: employeeHash,
      role: 'Employee',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@gkevents.com' },
    update: {},
    create: {
      id: 'customer-seed',
      name: 'Rao SBK',
      email: 'customer@gkevents.com',
      mobile: '9876543210',
      password: customerHash,
      role: 'Customer',
    },
  });

  // 3. Create Profiles (Customer & Employee)
  console.log('Seeding Customer & Employee Profiles...');
  const customerProfile = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      id: 'customer-profile-seed',
      userId: customerUser.id,
      fullName: 'Rao SBK',
      email: 'customer@gkevents.com',
      phone: '9876543210',
      address: '123 Luxury Avenue',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      postalCode: '520001',
    },
  });

  const employeeProfile = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      id: 'employee-profile-seed',
      userId: employeeUser.id,
      employeeCode: 'EMP001',
      department: 'Events Planning',
      designation: 'Senior Event Coordinator',
      status: 'ACTIVE',
    },
  });

  // 4. Create Halls
  console.log('Seeding Halls...');
  const hallsToSeed = [
    {
      id: 'hall-seed',
      hallCode: 'HALL-A',
      name: 'Taj Mahal Grand Ballroom',
      description: 'Luxury ballroom with high ceilings and premium chandeliers',
      location: 'A-Block, Ground Floor',
      capacity: 500,
      basePrice: 75000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      id: 'hall-b-seed',
      hallCode: 'T-LGA',
      name: 'Luxury Grand Arena',
      description: 'Spacious arena suitable for large conventions and receptions',
      location: 'B-Block, First Floor',
      capacity: 1000,
      basePrice: 120000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      id: 'gk-grand-convention',
      hallCode: 'GK-GCH',
      name: 'GK Grand Convention Hall',
      description: 'A luxurious convention center designed for grand wedding celebrations and premium events.',
      location: 'NH-44 Bypass Road, Jadcherla',
      capacity: 1500,
      basePrice: 150000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      id: 'royal-palace-function',
      hallCode: 'RP-FH',
      name: 'Royal Palace Function Hall',
      description: 'An elegant palace-style function hall perfect for royalty-themed weddings and massive gatherings.',
      location: 'Kollapur Road, Nagarkurnool',
      capacity: 2000,
      basePrice: 200000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      id: 'sri-lakshmi-function',
      hallCode: 'SL-FH',
      name: 'Sri Lakshmi Function Hall',
      description: 'A pocket-friendly venue for birthdays, engagements, and medium-sized family celebrations.',
      location: 'Station Road, Wanaparthy',
      capacity: 800,
      basePrice: 80000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      id: 'golden-banquet-hall',
      hallCode: 'GB-H',
      name: 'Golden Banquet Hall',
      description: 'An indoor banquet hall crafted for premium corporate meetups, intimate gatherings, and sangeet celebrations.',
      location: 'Raichur Road, Gadwal',
      capacity: 500,
      basePrice: 60000.00,
      status: HallStatus.AVAILABLE,
    }
  ];

  for (const h of hallsToSeed) {
    await prisma.hall.upsert({
      where: { hallCode: h.hallCode },
      update: {
        name: h.name,
        description: h.description,
        location: h.location,
        capacity: h.capacity,
        basePrice: h.basePrice,
        status: h.status,
      },
      create: h,
    });
  }


  // 5. Create Events
  console.log('Seeding Events...');
  const event = await prisma.event.upsert({
    where: { eventCode: 'EVT-2026-001' },
    update: {},
    create: {
      id: 'event-seed',
      eventCode: 'EVT-2026-001',
      customerId: customerProfile.id,
      eventName: 'Grand Wedding Banquet',
      eventType: 'WEDDING',
      description: 'Elegant grand ballroom traditional wedding party',
      eventDate: new Date('2026-10-15T12:00:00Z'),
      startTime: '09:00',
      endTime: '22:00',
      expectedGuestCount: 250,
      status: 'PLANNING',
      budget: 150000.00,
    },
  });

  // 6. Create Bookings
  console.log('Seeding Bookings...');
  await prisma.booking.upsert({
    where: { bookingNumber: 'BKG-2026-001' },
    update: {},
    create: {
      id: 'booking-seed',
      bookingNumber: 'BKG-2026-001',
      eventId: event.id,
      customerId: customerProfile.id,
      status: 'CONFIRMED',
      totalAmount: 150000.00,
      advanceAmount: 50000.00,
      balanceAmount: 100000.00,
    },
  });

  // 7. Create Legacy Hall Bookings
  console.log('Seeding Legacy Hall Bookings...');
  await prisma.hallBooking.upsert({
    where: { id: 'hall-booking-seed' },
    update: {},
    create: {
      id: 'hall-booking-seed',
      userId: customerUser.id,
      customerName: 'Rao SBK',
      email: 'customer@gkevents.com',
      mobile: '9876543210',
      state: 'Andhra Pradesh',
      district: 'Krishna',
      mandal: 'Vijayawada',
      hallId: 'hall-seed',
      hallName: 'Taj Mahal Grand Ballroom',
      hallAddress: 'A-Block, Ground Floor',
      eventDate: '2026-10-15',
      bookingDate: new Date().toISOString().split('T')[0],
      costPerDay: 75000.00,
      totalAmount: 75000.00,
      status: 'Confirmed',
      eventId: event.id,
      eventType: 'General Event',
      guestsCount: 250,
      eventSession: 'Full Day',
      foodItems: '[]',
    },
  });

  // 8. Create Tasks
  console.log('Seeding Tasks...');
  await prisma.task.upsert({
    where: { id: 'task-seed' },
    update: {},
    create: {
      id: 'task-seed',
      eventId: event.id,
      assignedTo: employeeProfile.id,
      title: 'Confirm Catering Menu',
      description: 'Verify final food items and taste approval with the customer',
      priority: 'HIGH',
      status: 'TODO',
    },
  });

  // 9. Create Vendors & Services
  console.log('Seeding Vendors & Services...');
  const vendor = await prisma.vendor.upsert({
    where: { vendorCode: 'VND001' },
    update: {},
    create: {
      id: 'vendor-seed',
      vendorCode: 'VND001',
      name: 'Star Decoration Services',
      companyName: 'Star Decor Ltd',
      status: 'ACTIVE',
    },
  });

  await prisma.vendorService.upsert({
    where: { id: 'vendor-service-seed' },
    update: {},
    create: {
      id: 'vendor-service-seed',
      vendorId: vendor.id,
      name: 'Floral Backdrop Decoration',
      description: 'Elegant flowers backdrop setup',
      basePrice: 25000.00,
    },
  });

  // 10. Create Inventory Items
  console.log('Seeding Inventory Items...');
  await prisma.inventoryItem.upsert({
    where: { itemCode: 'INV-CHAIR-01' },
    update: {},
    create: {
      id: 'inventory-seed',
      itemCode: 'INV-CHAIR-01',
      name: 'Premium Banqueting Chairs',
      category: 'Furniture',
      quantity: 200,
      unit: 'pieces',
      minimumStock: 20,
      unitCost: 150.00,
      status: 'ACTIVE',
    },
  });

  // 11. Create Quotations
  console.log('Seeding Quotations...');
  await prisma.quotation.upsert({
    where: { quotationNumber: 'QTN-2026-001' },
    update: {},
    create: {
      id: 'quotation-seed',
      quotationNumber: 'QTN-2026-001',
      eventId: event.id,
      customerId: customerProfile.id,
      subtotal: 120000.00,
      totalAmount: 120000.00,
      status: 'DRAFT',
    },
  });

  // 12. Seed Food Items
  console.log('Seeding Food Items...');
  const foodItems = [
    { name: 'Paneer Butter Masala', category: 'VEG', price: 180 },
    { name: 'Veg Biryani', category: 'VEG', price: 160 },
    { name: 'Dal Tadka', category: 'VEG', price: 100 },
    { name: 'Chicken Biryani', category: 'NON-VEG', price: 220 },
    { name: 'Chicken Curry', category: 'NON-VEG', price: 220 },
    { name: 'Mutton Curry', category: 'NON-VEG', price: 300 },
    { name: 'Paneer Tikka', category: 'VEG', price: 180 },
    { name: 'Hara Bhara Kebab', category: 'VEG', price: 140 },
    { name: 'Veg Manchurian', category: 'VEG', price: 130 },
    { name: 'Gobi 65', category: 'VEG', price: 120 },
    { name: 'Baby Corn Manchurian', category: 'VEG', price: 140 },
    { name: 'Crispy Corn', category: 'VEG', price: 130 },
    { name: 'Kadai Paneer', category: 'VEG', price: 180 },
    { name: 'Palak Paneer', category: 'VEG', price: 170 },
    { name: 'Mix Veg Curry', category: 'VEG', price: 140 },
    { name: 'Veg Kolhapuri', category: 'VEG', price: 150 },
    { name: 'Dal Makhani', category: 'VEG', price: 130 },
    { name: 'Chole Masala', category: 'VEG', price: 110 },
    { name: 'Aloo Gobi', category: 'VEG', price: 100 },
    { name: 'Jeera Rice', category: 'VEG', price: 90 },
    { name: 'Veg Pulao', category: 'VEG', price: 120 },
    { name: 'Plain Rice', category: 'VEG', price: 70 },
    { name: 'Butter Naan', category: 'VEG', price: 50 },
    { name: 'Tandoori Roti', category: 'VEG', price: 35 },
    { name: 'Butter Roti', category: 'VEG', price: 40 },
    { name: 'Plain Naan', category: 'VEG', price: 45 },
    { name: 'Veg Raita', category: 'VEG', price: 70 },
    { name: 'Boondi Raita', category: 'VEG', price: 70 },
    { name: 'Green Salad', category: 'VEG', price: 60 },
    { name: 'Papad', category: 'VEG', price: 30 },
    { name: 'Pickle', category: 'VEG', price: 20 },
    { name: 'Gulab Jamun', category: 'VEG', price: 80 },
    { name: 'Rasmalai', category: 'VEG', price: 100 },
    { name: 'Gajar Halwa', category: 'VEG', price: 90 },
    { name: 'Ice Cream', category: 'VEG', price: 100 },
    { name: 'Kheer', category: 'VEG', price: 80 },
    { name: 'Chicken 65', category: 'NON-VEG', price: 200 },
    { name: 'Chicken Tikka', category: 'NON-VEG', price: 220 },
    { name: 'Chicken Manchurian', category: 'NON-VEG', price: 200 },
    { name: 'Chicken Seekh Kebab', category: 'NON-VEG', price: 220 },
    { name: 'Chicken Lollipop', category: 'NON-VEG', price: 230 },
    { name: 'Fish Fry', category: 'NON-VEG', price: 250 },
    { name: 'Butter Chicken', category: 'NON-VEG', price: 240 },
    { name: 'Chicken Tikka Masala', category: 'NON-VEG', price: 240 },
    { name: 'Kadai Chicken', category: 'NON-VEG', price: 230 },
    { name: 'Andhra Chicken Curry', category: 'NON-VEG', price: 220 },
    { name: 'Mutton Rogan Josh', category: 'NON-VEG', price: 320 },
    { name: 'Fish Curry', category: 'NON-VEG', price: 260 },
    { name: 'Mutton Biryani', category: 'NON-VEG', price: 320 },
    { name: 'Chicken Pulao', category: 'NON-VEG', price: 200 },
    { name: 'Egg Biryani', category: 'NON-VEG', price: 170 },
    { name: 'Egg Fried Rice', category: 'NON-VEG', price: 150 },
    { name: 'Egg Curry', category: 'NON-VEG', price: 130 },
    { name: 'Egg Masala', category: 'NON-VEG', price: 120 },
    { name: 'Egg Bhurji', category: 'NON-VEG', price: 100 }
  ];

  for (const item of foodItems) {
    await prisma.foodItem.upsert({
      where: { name: item.name },
      update: {
        price: item.price,
        category: item.category,
      },
      create: {
        name: item.name,
        category: item.category,
        price: item.price,
        active: 1,
      },
    });
  }

  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
