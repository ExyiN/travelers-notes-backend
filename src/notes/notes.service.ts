import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Note } from 'src/generated/prisma/client';
import {
  NoteInclude,
  NoteOrderByWithRelationInput,
  NoteWhereInput,
} from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  private orderBy: NoteOrderByWithRelationInput = { updatedAt: 'desc' };
  private include: NoteInclude = {
    locations: { include: { region: true } },
    tags: true,
  };

  constructor(private prisma: PrismaService) {}

  async getUserNotes(userId: number): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: this.orderBy,
      include: this.include,
    });
  }

  async getFilteredUserNotes(
    userId: number,
    comment?: string,
    locationIds?: number[],
    tagIds?: number[],
  ): Promise<Note[]> {
    const and: NoteWhereInput[] = [{ userId }];
    if (comment) {
      and.push({ comment: { contains: comment } });
    }
    if (locationIds) {
      locationIds.forEach((id) => {
        and.push({ locations: { some: { id } } });
      });
    }
    if (tagIds) {
      tagIds.forEach((id) => {
        and.push({ tags: { some: { id } } });
      });
    }
    return this.prisma.note.findMany({
      where: {
        AND: and,
      },
      orderBy: this.orderBy,
      include: this.include,
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
        tags:
          dto.tagIds && dto.tagIds.length > 0
            ? { connect: dto.tagIds.map((id) => ({ id })) }
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
        tags: dto.tagIds
          ? { set: dto.tagIds.map((id) => ({ id })) }
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
