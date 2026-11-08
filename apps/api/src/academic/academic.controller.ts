import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AcademicService } from './academic.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { AssignCourseFacultyDto } from './dto/assign-course-faculty.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { ReviewContentDto } from './dto/review-content.dto';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academic: AcademicService) {}


  @Get('courses')
  listCourses() {
    return this.academic.listCourses();
  }

  @Get('faculty/me/courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FACULTY')
  listMyCourses(@Req() req: AuthenticatedRequest) {
    return this.academic.listMyCourses(req.user.sub);
  }

  @Post('courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN')
  createCourse(@Req() req: AuthenticatedRequest, @Body() body: CreateCourseDto) {
    return this.academic.createCourse(req.user.sub, body);
  }

  @Post('courses/:courseId/faculty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN')
  assignFaculty(@Req() req: AuthenticatedRequest, @Param('courseId') courseId: string, @Body() body: AssignCourseFacultyDto) {
    return this.academic.assignFaculty(req.user.sub, courseId, body.facultyId);
  }


  @Get('courses/:courseId/lectures')
  listPublishedLectures(@Param('courseId') courseId: string) {
    return this.academic.listPublishedLectures(courseId);
  }

  @Get('faculty/me/lectures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FACULTY')
  listMyLectures(@Req() req: AuthenticatedRequest) {
    return this.academic.listMyLectures(req.user.sub);
  }

  @Post('courses/:courseId/lectures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createLecture(@Req() req: AuthenticatedRequest, @Param('courseId') courseId: string, @Body() body: CreateLectureDto) {
    const privileged = (req.user.roles ?? []).some(role => ['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'CONTENT_MANAGER'].includes(role));
    return this.academic.createLecture(req.user.sub, courseId, body, privileged);
  }

  @Post('lectures/:lectureId/resources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createLearningResource(@Req() req: AuthenticatedRequest, @Param('lectureId') lectureId: string, @Body() body: CreateLearningResourceDto) {
    const privileged = (req.user.roles ?? []).some(role => ['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'CONTENT_MANAGER'].includes(role));
    return this.academic.createLearningResource(req.user.sub, lectureId, body, privileged);
  }

  @Post('lectures/:lectureId/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  submitLecture(@Req() req: AuthenticatedRequest, @Param('lectureId') lectureId: string) {
    const privileged = (req.user.roles ?? []).some(role => ['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'CONTENT_MANAGER'].includes(role));
    return this.academic.submitLecture(req.user.sub, lectureId, privileged);
  }

  @Get('content-review/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN')
  listContentReviewQueue() {
    return this.academic.listContentReviewQueue();
  }

  @Patch('lectures/:lectureId/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN')
  reviewLecture(@Req() req: AuthenticatedRequest, @Param('lectureId') lectureId: string, @Body() body: ReviewContentDto) {
    return this.academic.reviewLecture(req.user.sub, lectureId, body);
  }

  @Get('subjects')
  listCurriculum() {
    return this.academic.listCurriculum();
  }

  @Post('subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createSubject(@Req() req: AuthenticatedRequest, @Body() body: CreateSubjectDto) {
    return this.academic.createSubject(req.user.sub, body);
  }

  @Post('subjects/:subjectId/units')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createUnit(@Req() req: AuthenticatedRequest, @Param('subjectId') subjectId: string, @Body() body: CreateUnitDto) {
    return this.academic.createUnit(req.user.sub, subjectId, body);
  }

  @Post('units/:unitId/chapters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createChapter(@Req() req: AuthenticatedRequest, @Param('unitId') unitId: string, @Body() body: CreateChapterDto) {
    return this.academic.createChapter(req.user.sub, unitId, body);
  }

  @Post('chapters/:chapterId/topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER')
  createTopic(@Req() req: AuthenticatedRequest, @Param('chapterId') chapterId: string, @Body() body: CreateTopicDto) {
    return this.academic.createTopic(req.user.sub, chapterId, body);
  }
}
