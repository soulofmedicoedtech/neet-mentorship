import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubmitMentorReviewDto } from './dto/submit-mentor-review.dto';
import { MentorsService } from './mentors.service';

@Controller('mentors/me/mentorship-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('FACULTY')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.mentors.listMyApplications(request.user.sub);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SubmitMentorReviewDto,
  ) {
    return this.mentors.submitReview(request.user.sub, id, body);
  }
}
