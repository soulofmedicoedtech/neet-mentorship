import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMentorshipApplicationDto } from './dto/create-mentorship-application.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentsService } from './students.service';

@Controller('colleges')
export class CollegesController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  list(@Query('search') search?: string) { return this.students.listColleges(search); }
}

@Controller('students/me')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get('profile')
  getProfile(@Req() request: AuthenticatedRequest) { return this.students.getProfile(request.user.sub); }

  @Patch('profile')
  updateProfile(@Req() request: AuthenticatedRequest, @Body() body: UpdateStudentProfileDto) {
    return this.students.updateProfile(request.user.sub, body);
  }

  @Post('mentorship-applications')
  createApplication(@Req() request: AuthenticatedRequest, @Body() body: CreateMentorshipApplicationDto) {
    return this.students.createMentorshipApplication(request.user.sub, body);
  }

  @Get('mentorship-applications')
  listApplications(@Req() request: AuthenticatedRequest) { return this.students.listMyApplications(request.user.sub); }
}
