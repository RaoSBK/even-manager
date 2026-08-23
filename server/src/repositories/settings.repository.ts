import { PrismaClient, Settings, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class SettingsRepository {
  async findAll(): Promise<Settings[]> {
    return await prisma.settings.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async findByKey(key: string): Promise<Settings | null> {
    return await prisma.settings.findUnique({
      where: { key }
    });
  }

  async upsert(key: string, value: string, type?: string, description?: string): Promise<Settings> {
    return await prisma.settings.upsert({
      where: { key },
      update: { value, type, description },
      create: { key, value, type, description }
    });
  }
}
