import { Injectable } from '@nestjs/common';
import { UserSession } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async createUserSession(token: string, userId: number): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        token,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async updateUserSession(id: number, token: string): Promise<UserSession> {
    return this.prisma.userSession.update({
      where: {
        id,
      },
      data: {
        token,
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
