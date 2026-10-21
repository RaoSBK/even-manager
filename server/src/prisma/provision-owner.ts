import { PrismaClient, HallStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load server .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function provisionOwner() {
  console.log('--- Provisioning Function Hall Owner ---');

  const loginId = process.env.OWNER_BOOTSTRAP_LOGIN_ID || 'GKFH001';
  const password = process.env.OWNER_BOOTSTRAP_PASSWORD || 'GK@12345';
  const email = process.env.OWNER_BOOTSTRAP_EMAIL || 'owner.gkfh001@gkbooking.com';
  const mobile = process.env.OWNER_BOOTSTRAP_MOBILE || '9100000001';
  const targetHallCode = process.env.OWNER_TARGET_HALL_CODE || 'GK-GCH';

  try {
    // 1. Locate or create target hall
    let hall = await prisma.hall.findFirst({
      where: {
        OR: [
          { hallCode: targetHallCode },
          { name: { contains: 'GK Grand', mode: 'insensitive' } },
          { name: { contains: 'GK Function', mode: 'insensitive' } }
        ]
      }
    });

    if (!hall) {
      console.log(`Target hall '${targetHallCode}' not found. Creating GK Grand Convention Hall...`);
      hall = await prisma.hall.create({
        data: {
          id: 'gk-grand-convention',
          hallCode: 'GK-GCH',
          name: 'GK Grand Convention Hall',
          description: 'A luxurious convention center designed for grand wedding celebrations and premium events.',
          location: 'NH-44 Bypass Road, Jadcherla, Telangana',
          capacity: 1500,
          basePrice: 150000.00,
          status: HallStatus.AVAILABLE
        }
      });
      console.log(`Created hall: ${hall.name} (${hall.id})`);
    } else {
      console.log(`Found existing hall: ${hall.name} (${hall.id})`);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Upsert owner User
    const ownerUser = await prisma.user.upsert({
      where: { loginId },
      update: {
        name: `${hall.name} Manager`,
        role: 'Owner',
        isActive: true,
        isVerified: true,
        password: hashedPassword
      },
      create: {
        id: `owner-${loginId.toLowerCase()}`,
        name: `${hall.name} Manager`,
        email,
        mobile,
        loginId,
        password: hashedPassword,
        role: 'Owner',
        isActive: true,
        isVerified: true
      }
    });

    console.log(`Upserted owner user: ${ownerUser.name} [Login ID: ${ownerUser.loginId}, Role: ${ownerUser.role}]`);

    // 4. Link hall to owner
    await prisma.hall.update({
      where: { id: hall.id },
      data: { ownerId: ownerUser.id }
    });

    console.log(`Successfully linked hall '${hall.name}' to owner '${ownerUser.loginId}'!`);
    console.log('--- Provisioning Complete ---');

  } catch (err) {
    console.error('Failed to provision owner:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

provisionOwner();
