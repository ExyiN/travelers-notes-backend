import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccessJwtAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@UseGuards(AccessJwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getUserNotes(@Req() req: Request) {
    const user = req.user as { sub: number; email: string };
    return this.notesService.getUserNotes(user.sub);
  }

  @Post()
  async createNote(@Req() req: Request, @Body() body: CreateNoteDto) {
    const user = req.user as { sub: number; email: string };
    return this.notesService.createNote(body, user.sub);
  }

  @Patch(':id')
  async updateNote(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNoteDto,
  ) {
    const user = req.user as { sub: number; email: string };
    return this.notesService.updateNote(id, body, user.sub);
  }

  @Delete(':id')
  async deleteNote(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as { sub: number; email: string };
    return this.notesService.deleteNote(id, user.sub);
  }
}
