import { Controller, Get, Param, Patch, Query, Req, UseGuards, Body } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReviewMentorshipApplicationDto } from './dto/review-mentorship-application.dto';
import { AdminService } from './admin.service';

@Controller('admin/mentorship-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.admin.listMentorshipApplications(status);
  }

  @Patch(':id')
  review(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReviewMentorshipApplicationDto,
  ) {
    return this.admin.reviewMentorshipApplication(id, request.user.sub, body);
  }
}
