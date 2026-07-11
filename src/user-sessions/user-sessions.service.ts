import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserSession } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserSessionsService {
  constructor(private prisma: PrismaService) {}

  async getUserUserSessions(userId: number): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async getUserUserSessionByToken(
    userId: number,
    token: string,
  ): Promise<UserSession | null> {
    const userSessions = await this.getUserUserSessions(userId);
    let session: UserSession | null = null;
    for (const userSession of userSessions) {
      const isMatch = await bcrypt.compare(token, userSession.token);
      if (isMatch) {
        session = userSession;
        break;
      }
    }
    return session;
  }

  async createUserSession(
    token: string,
    expiresAt: Date,
    userId: number,
  ): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        token,
        expiresAt,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async updateUserSession(
    id: number,
    expiresAt: Date,
    token: string,
  ): Promise<UserSession> {
    return this.prisma.userSession.update({
      where: {
        id,
      },
      data: {
        token,
        expiresAt,
      },
    });
  }

  async deleteUserSession(id: number): Promise<UserSession> {
    return this.prisma.userSession.delete({
      where: {
        id,
      },
    });
  }
}
