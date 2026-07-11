import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserSessionsService } from 'src/user-sessions/user-sessions.service';

@Injectable()
export class TaskService {
  logger = new Logger(TaskService.name);

  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredUserSessions() {
    const result = await this.userSessionsService.cleanExpiredUserSessions();
    this.logger.log(`Cleaned ${result.count} expired user sessions.`);
  }
}
