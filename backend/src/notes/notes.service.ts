import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async getNotes(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getOne(id: string, userId: string) {
    return this.prisma.note.findFirst({
      where: { id, userId },
    });
  }

  async createNote(userId: string, title: string, content: string) {
    return this.prisma.note.create({
      data: { userId, title, content },
    });
  }

  async updateNote(id: string, userId: string, title: string, content: string) {
    return this.prisma.note.update({
      where: { id, userId },
      data: { title, content },
    });
  }

  async deleteNote(id: string, userId: string) {
    return this.prisma.note.delete({
      where: { id, userId },
    });
  }
}
