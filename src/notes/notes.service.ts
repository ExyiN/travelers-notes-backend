import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Note } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async getUserNotes(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
      include: {
        locations: true,
      },
    });
  }

  async createNote(dto: CreateNoteDto, userId: number): Promise<Note> {
    return this.prisma.note.create({
      data: {
        comment: dto.comment,
        user: {
          connect: {
            id: userId,
          },
        },
        locations:
          dto.locationIds && dto.locationIds.length > 0
            ? {
                connect: dto.locationIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });
  }

  async updateNote(
    id: number,
    dto: UpdateNoteDto,
    userId: number,
  ): Promise<Note> {
    await this.verifyNoteUserId(id, userId);
    return this.prisma.note.update({
      where: { id },
      data: {
        comment: dto.comment,
        locations: dto.locationIds
          ? { set: dto.locationIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async deleteNote(id: number, userId: number): Promise<Note> {
    await this.verifyNoteUserId(id, userId);
    return this.prisma.note.delete({ where: { id } });
  }

  private async verifyNoteUserId(id: number, userId: number) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundException('Note not found.');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException();
    }
  }
}
