import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MentorsModule } from './mentors/mentors.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';

@Module({ imports: [PrismaModule, AuthModule, HealthModule, StudentsModule, AdminModule, MentorsModule] })
export class AppModule {}
