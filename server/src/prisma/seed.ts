import { PrismaClient, HallStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Production Database Seeding ---');

  // 1. Ensure Super Admin Account exists
  console.log('Ensuring Admin user...');
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'Admin' }
  });

  if (!existingAdmin) {
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'GK Admin',
        email: 'rishiadmin@gkbooking.in',
        mobile: '7842884158',
        password: adminHash,
        role: 'Admin',
      },
    });
    console.log('Created default admin: rishiadmin@gkbooking.in');
  } else {
    console.log(`Admin account already exists: ${existingAdmin.email}`);
  }

  // 2. Ensure Function Halls Master Catalog
  console.log('Seeding Function Halls Catalog...');
  const hallsToSeed = [
    {
      hallCode: 'GK-GCH',
      name: 'GK Grand Convention Hall',
      description: 'A luxurious convention center designed for grand wedding celebrations and premium events.',
      location: 'NH-44 Bypass Road, Jadcherla, Telangana',
      state: 'Telangana',
      district: 'Mahabubnagar',
      mandal: 'Jadcherla',
      capacity: 1500,
      basePrice: 150000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      hallCode: 'RP-FH',
      name: 'Royal Palace Function Hall',
      description: 'An elegant palace-style function hall perfect for royalty-themed weddings and massive gatherings.',
      location: 'Kollapur Road, Nagarkurnool, Telangana',
      state: 'Telangana',
      district: 'Nagarkurnool',
      mandal: 'Nagarkurnool',
      capacity: 2000,
      basePrice: 200000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      hallCode: 'SL-FH',
      name: 'Sri Lakshmi Function Hall',
      description: 'A pocket-friendly venue for birthdays, engagements, and medium-sized family celebrations.',
      location: 'Station Road, Wanaparthy, Telangana',
      state: 'Telangana',
      district: 'Wanaparthy',
      mandal: 'Wanaparthy',
      capacity: 800,
      basePrice: 80000.00,
      status: HallStatus.AVAILABLE,
    },
    {
      hallCode: 'GB-H',
      name: 'Golden Banquet Hall',
      description: 'An indoor banquet hall crafted for premium corporate meetups, intimate gatherings, and sangeet celebrations.',
      location: 'Raichur Road, Gadwal, Telangana',
      state: 'Telangana',
      district: 'Jogulamba Gadwal',
      mandal: 'Gadwal',
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
        state: h.state,
        district: h.district,
        mandal: h.mandal,
        capacity: h.capacity,
        basePrice: h.basePrice,
        status: h.status,
      },
      create: h,
    });
  }

  // 3. Ensure Food Items Master Catalog
  console.log('Seeding Catering Food Items Catalog...');
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

  console.log('--- Production Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
