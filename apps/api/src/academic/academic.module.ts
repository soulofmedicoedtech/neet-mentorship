import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';

@Module({
  imports: [AuthModule],
  controllers: [AcademicController],
  providers: [AcademicService, JwtAuthGuard, RolesGuard],
})
export class AcademicModule {}
