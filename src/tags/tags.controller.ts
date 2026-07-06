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
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@UseGuards(AccessJwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async getUserTags(@Req() req: Request) {
    const user = req.user as { sub: number; email: string };
    return this.tagsService.getUserTags(user.sub);
  }

  @Post()
  async createTag(@Req() req: Request, @Body() body: CreateTagDto) {
    const user = req.user as { sub: number; email: string };
    return this.tagsService.createTag(body, user.sub);
  }

  @Patch(':id')
  async updateTag(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTagDto,
  ) {
    const user = req.user as { sub: number; email: string };
    return this.tagsService.updateTag(id, body, user.sub);
  }

  @Delete(':id')
  async deleteTag(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as { sub: number; email: string };
    return this.tagsService.deleteTag(id, user.sub);
  }
}
