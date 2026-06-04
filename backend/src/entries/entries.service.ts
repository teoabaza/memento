import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async getEntries(userId: string) {
    return this.prisma.entry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getOne(id: string, userId: string) {
    return this.prisma.entry.findFirst({
      where: { id, userId },
    });
  }

  async createEntry(userId: string, text: string, imageUrl?: string) {
    return this.prisma.entry.create({
      data: { userId, text, imageUrl },
    });
  }

  async updateEntry(id: string, userId: string, text: string, imageUrl?: string) {
    return this.prisma.entry.update({
      where: { id, userId },
      data: { text, imageUrl },
    });
  }

  async deleteEntry(id: string, userId: string) {
    return this.prisma.entry.delete({
      where: { id, userId },
    });
  }
}