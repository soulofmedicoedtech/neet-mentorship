import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CollegesController, StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({ imports: [AuthModule], controllers: [CollegesController, StudentsController], providers: [StudentsService, JwtAuthGuard] })
export class StudentsModule {}
