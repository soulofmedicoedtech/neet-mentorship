import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';

@Module({
  imports: [AuthModule],
  controllers: [MentorsController],
  providers: [MentorsService, JwtAuthGuard, RolesGuard],
})
export class MentorsModule {}
