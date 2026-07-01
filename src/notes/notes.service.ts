import { Injectable } from '@nestjs/common';
import { Note, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async note(
    noteWhereUniqueInput: Prisma.NoteWhereUniqueInput,
  ): Promise<Note | null> {
    return this.prisma.note.findUnique({
      where: noteWhereUniqueInput,
    });
  }

  async notes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.NoteWhereUniqueInput;
    where?: Prisma.NoteWhereInput;
    orderBy?: Prisma.NoteOrderByWithRelationInput;
  }): Promise<Note[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.note.findMany({ skip, take, cursor, where, orderBy });
  }

  async createNote(data: Prisma.NoteCreateInput): Promise<Note> {
    return this.prisma.note.create({ data });
  }

  async updateNote(
    where: Prisma.NoteWhereUniqueInput,
    data: Prisma.NoteUpdateInput,
  ): Promise<Note> {
    return this.prisma.note.update({ data, where });
  }

  async deleteNote(where: Prisma.NoteWhereUniqueInput): Promise<Note> {
    return this.prisma.note.delete({ where });
  }
}
