import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from 'src/generated/prisma/client';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getUserTags(userId: number): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createTag(dto: CreateTagDto, userId: number): Promise<Tag> {
    return this.prisma.tag.create({
      data: {
        name: dto.name,
        color: dto.color,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async updateTag(id: number, dto: UpdateTagDto, userId: number): Promise<Tag> {
    await this.verifyTagUserId(id, userId);
    return this.prisma.tag.update({
      where: { id },
      data: {
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async deleteTag(id: number, userId: number): Promise<Tag> {
    await this.verifyTagUserId(id, userId);
    return this.prisma.tag.delete({ where: { id } });
  }

  private async verifyTagUserId(id: number, userId: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found.');
    }
    if (tag.userId !== userId) {
      throw new ForbiddenException();
    }
  }
}
