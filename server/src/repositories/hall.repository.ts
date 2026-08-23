import { PrismaClient, Hall, HallStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class HallRepository {
  async findAll(): Promise<Hall[]> {
    return await prisma.hall.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Hall | null> {
    return await prisma.hall.findUnique({
      where: { id },
    });
  }

  async findByCode(hallCode: string): Promise<Hall | null> {
    return await prisma.hall.findUnique({
      where: { hallCode },
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
