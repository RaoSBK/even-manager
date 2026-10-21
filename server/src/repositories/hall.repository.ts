import { PrismaClient, Hall, HallStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class HallRepository {
  async findAll(): Promise<Hall[]> {
    const halls = await prisma.hall.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    // Hardening: Sanitize ownerId from public hall listings
    return halls.map(h => ({
      ...h,
      ownerId: null
    }));
  }

  async findAllWithManager(): Promise<any[]> {
    const halls = await prisma.hall.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            loginId: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });

    return halls.map(h => ({
      ...h,
      manager: h.owner || null
    }));
  }

  async findById(id: string): Promise<Hall | null> {
    const hall = await prisma.hall.findUnique({
      where: { id },
    });
    if (!hall) return null;
    // Hardening: Sanitize ownerId from public single hall response
    return {
      ...hall,
      ownerId: null
    };
  }

  async findRawById(id: string): Promise<any | null> {
    return await prisma.hall.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            loginId: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });
  }

  async findByCode(hallCode: string): Promise<Hall | null> {
    return await prisma.hall.findUnique({
      where: { hallCode },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Hall | null> {
    return await prisma.hall.findUnique({
      where: { ownerId },
    });
  }

  async create(data: Prisma.HallUncheckedCreateInput): Promise<Hall> {
    return await prisma.hall.create({
      data,
    });
  }

  async update(id: string, data: Prisma.HallUpdateInput): Promise<Hall> {
    return await prisma.hall.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Hall> {
    return await prisma.hall.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: HallStatus.INACTIVE,
      },
    });
  }
}
