import { Module } from '@nestjs/common';
import { UserSessionsService } from './user-sessions.service';

@Module({
  providers: [UserSessionsService],
  exports: [UserSessionsService],
})
export class UserSessionsModule {}
