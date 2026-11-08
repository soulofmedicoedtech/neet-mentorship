import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { ReviewContentDto } from './dto/review-content.dto';
import { UpdateLectureProgressDto } from './dto/update-lecture-progress.dto';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}




  async enrollStudentInCourse(userId: string, courseId: string) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundException('Student profile not found');
    const course = await this.prisma.course.findFirst({ where: { id: courseId, active: true }, select: { id: true } });
    if (!course) throw new NotFoundException('Active course not found');
    return this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.courseEnrollment.upsert({
        where: { studentProfileId_courseId: { studentProfileId: profile.id, courseId } },
        create: { studentProfileId: profile.id, courseId },
        update: {},
        select: { id: true, courseId: true, enrolledAt: true, completedAt: true },
      });
      await tx.auditEvent.create({ data: { actorId: userId, action: 'STUDENT_COURSE_ENROLLED', resource: 'CourseEnrollment', resourceId: enrollment.id, metadata: { courseId } as Prisma.InputJsonValue } });
      return enrollment;
    });
  }

  async listMyEnrollments(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return this.prisma.courseEnrollment.findMany({
      where: { studentProfileId: profile.id, course: { active: true } },
      select: {
        id: true, courseId: true, enrolledAt: true, completedAt: true,
        course: { select: {
          id: true, code: true, title: true, description: true,
          subject: { select: { id: true, code: true, name: true } },
          lectures: { where: { status: 'PUBLISHED' }, select: {
            id: true, title: true, description: true, videoUrl: true, videoType: true, durationSec: true, sortOrder: true,
            resources: { where: { status: 'PUBLISHED' }, select: { id: true, title: true, type: true, url: true, description: true }, orderBy: { sortOrder: 'asc' } },
            progress: { where: { studentProfileId: profile.id }, select: { watchedSeconds: true, completedAt: true, lastViewedAt: true } },
          }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateStudentLectureProgress(userId: string, lectureId: string, input: UpdateLectureProgressDto) {
    if (input.watchedSeconds === undefined && input.completed === undefined) throw new ConflictException('Provide watchedSeconds or completed');
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundException('Student profile not found');
    const lecture = await this.prisma.lecture.findFirst({
      where: { id: lectureId, status: 'PUBLISHED', course: { active: true } },
      select: { id: true, courseId: true },
    });
    if (!lecture) throw new NotFoundException('Published lecture not found');
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { studentProfileId_courseId: { studentProfileId: profile.id, courseId: lecture.courseId } },
      select: { id: true },
    });
    if (!enrollment) throw new ForbiddenException('Enroll in this course before recording lecture progress');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lectureProgress.findUnique({
        where: { studentProfileId_lectureId: { studentProfileId: profile.id, lectureId } },
        select: { id: true, watchedSeconds: true, completedAt: true },
      });
      const now = new Date();
      const watchedSeconds = Math.max(existing?.watchedSeconds ?? 0, input.watchedSeconds ?? 0);
      const completedAt = input.completed ? (existing?.completedAt ?? now) : existing?.completedAt ?? null;
      const progress = await tx.lectureProgress.upsert({
        where: { studentProfileId_lectureId: { studentProfileId: profile.id, lectureId } },
        create: { studentProfileId: profile.id, lectureId, watchedSeconds, completedAt, lastViewedAt: now },
        update: { watchedSeconds, completedAt, lastViewedAt: now },
        select: { id: true, lectureId: true, watchedSeconds: true, completedAt: true, lastViewedAt: true },
      });
      const publishedCount = await tx.lecture.count({ where: { courseId: lecture.courseId, status: 'PUBLISHED' } });
      const completedCount = await tx.lectureProgress.count({
        where: { studentProfileId: profile.id, completedAt: { not: null }, lecture: { courseId: lecture.courseId, status: 'PUBLISHED' } },
      });
      if (publishedCount > 0 && completedCount >= publishedCount) {
        await tx.courseEnrollment.update({ where: { id: enrollment.id }, data: { completedAt: now } });
      }
      return progress;
    });
  }

  listPublishedLectures(courseId: string) {
    return this.prisma.lecture.findMany({
      where: { courseId, status: 'PUBLISHED', course: { active: true } },
      select: {
        id: true, title: true, description: true, videoUrl: true, videoType: true,
        durationSec: true, sortOrder: true, topic: { select: { id: true, title: true } },
        resources: { where: { status: 'PUBLISHED' }, select: { id: true, title: true, type: true, url: true, description: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listMyLectures(authorId: string) {
    return this.prisma.lecture.findMany({
      where: { authorId },
      select: { id: true, courseId: true, title: true, status: true, reviewNote: true, videoUrl: true, videoType: true, resources: { select: { id: true, title: true, type: true, url: true, status: true, reviewNote: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createLecture(actorId: string, courseId: string, input: CreateLectureDto, isPrivileged: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true, subjectId: true, active: true } });
    if (!course || !course.active) throw new NotFoundException('Active course not found');
    if (!isPrivileged) {
      const assignment = await this.prisma.courseFacultyAssignment.findUnique({ where: { courseId_facultyId: { courseId, facultyId: actorId } }, select: { id: true } });
      if (!assignment) throw new NotFoundException('Course assignment not found for this faculty account');
    }
    if (input.topicId) {
      const topic = await this.prisma.topic.findFirst({ where: { id: input.topicId, chapter: { unit: { subjectId: course.subjectId } } }, select: { id: true } });
      if (!topic) throw new NotFoundException('Topic does not belong to the course subject');
    }
    return this.prisma.$transaction(async (tx) => {
      const lecture = await tx.lecture.create({
        data: { courseId, authorId: actorId, topicId: input.topicId, title: input.title.trim(), description: input.description?.trim(), videoUrl: input.videoUrl, videoType: input.videoType, durationSec: input.durationSec, sortOrder: input.sortOrder ?? 0 },
      });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_LECTURE_CREATED', resource: 'Lecture', resourceId: lecture.id, metadata: { courseId, topicId: input.topicId ?? null } as Prisma.InputJsonValue } });
      return lecture;
    });
  }

  async createLearningResource(actorId: string, lectureId: string, input: CreateLearningResourceDto, isPrivileged: boolean) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: lectureId }, select: { id: true, authorId: true, status: true } });
    if (!lecture || (!isPrivileged && lecture.authorId !== actorId)) throw new NotFoundException('Lecture not found');
    if (!['DRAFT', 'REJECTED'].includes(lecture.status)) throw new ConflictException('Resources can only be added to draft or rejected lectures');
    return this.prisma.$transaction(async (tx) => {
      const resource = await tx.learningResource.create({
        data: { lectureId, authorId: actorId, title: input.title.trim(), type: input.type, url: input.url, description: input.description?.trim(), sortOrder: input.sortOrder ?? 0 },
      });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_RESOURCE_CREATED', resource: 'LearningResource', resourceId: resource.id, metadata: { lectureId, type: input.type } as Prisma.InputJsonValue } });
      return resource;
    });
  }

  async submitLecture(actorId: string, lectureId: string, isPrivileged: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const lecture = await tx.lecture.findUnique({ where: { id: lectureId }, select: { id: true, authorId: true, status: true } });
      if (!lecture || (!isPrivileged && lecture.authorId !== actorId)) throw new NotFoundException('Lecture not found');
      if (!['DRAFT', 'REJECTED'].includes(lecture.status)) throw new ConflictException('Only draft or rejected lectures can be submitted');
      const updated = await tx.lecture.update({ where: { id: lectureId }, data: { status: 'SUBMITTED', submittedAt: new Date(), reviewNote: null }, select: { id: true, status: true, submittedAt: true } });
      await tx.learningResource.updateMany({ where: { lectureId, status: { in: ['DRAFT', 'REJECTED'] } }, data: { status: 'SUBMITTED', submittedAt: new Date(), reviewNote: null } });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_LECTURE_SUBMITTED', resource: 'Lecture', resourceId: lectureId } });
      return updated;
    });
  }

  listContentReviewQueue() {
    return this.prisma.lecture.findMany({
      where: { status: { in: ['SUBMITTED', 'APPROVED'] } },
      select: { id: true, title: true, description: true, videoUrl: true, status: true, submittedAt: true, course: { select: { code: true, title: true } }, author: { select: { id: true, displayName: true, email: true } }, resources: { select: { id: true, title: true, type: true, url: true, status: true } } },
      orderBy: { submittedAt: 'asc' },
      take: 100,
    });
  }

  async reviewLecture(actorId: string, lectureId: string, input: ReviewContentDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.lecture.findUnique({ where: { id: lectureId }, select: { id: true, status: true } });
      if (!current) throw new NotFoundException('Lecture not found');
      const allowed = current.status === 'SUBMITTED' ? ['APPROVED', 'REJECTED'] : current.status === 'APPROVED' ? ['PUBLISHED'] : [];
      if (!allowed.includes(input.status)) throw new ConflictException('Invalid content review transition');
      const now = new Date();
      const lecture = await tx.lecture.update({ where: { id: lectureId }, data: { status: input.status, reviewNote: input.reviewNote?.trim() ?? null, reviewedAt: now, publishedAt: input.status === 'PUBLISHED' ? now : null } });
      if (input.status === 'PUBLISHED') await tx.learningResource.updateMany({ where: { lectureId, status: 'APPROVED' }, data: { status: 'PUBLISHED', publishedAt: now } });
      if (input.status === 'REJECTED') await tx.learningResource.updateMany({ where: { lectureId, status: 'SUBMITTED' }, data: { status: 'REJECTED', reviewNote: input.reviewNote?.trim() ?? null, reviewedAt: now } });
      if (input.status === 'APPROVED') await tx.learningResource.updateMany({ where: { lectureId, status: 'SUBMITTED' }, data: { status: 'APPROVED', reviewNote: null, reviewedAt: now } });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_LECTURE_REVIEWED', resource: 'Lecture', resourceId: lectureId, metadata: { previousStatus: current.status, status: input.status } as Prisma.InputJsonValue } });
      return lecture;
    });
  }

  listCourses() {
    return this.prisma.course.findMany({
      where: { active: true },
      select: { id: true, code: true, title: true, description: true, subject: { select: { id: true, code: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }

  listMyCourses(facultyId: string) {
    return this.prisma.courseFacultyAssignment.findMany({
      where: { facultyId, course: { active: true } },
      select: { createdAt: true, course: { select: { id: true, code: true, title: true, description: true, subject: { select: { id: true, code: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCourse(actorId: string, input: CreateCourseDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.findUnique({ where: { id: input.subjectId }, select: { id: true } });
        if (!subject) throw new NotFoundException('Subject not found');
        const course = await tx.course.create({
          data: { code: input.code, title: input.title.trim(), description: input.description?.trim(), subjectId: input.subjectId },
          select: { id: true, code: true, title: true, description: true, subjectId: true },
        });
        await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_COURSE_CREATED', resource: 'Course', resourceId: course.id, metadata: { code: course.code, subjectId: course.subjectId } as Prisma.InputJsonValue } });
        return course;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A course with this code already exists');
      throw error;
    }
  }

  async assignFaculty(actorId: string, courseId: string, facultyId: string) {
    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({ where: { id: courseId }, select: { id: true, code: true } });
      if (!course) throw new NotFoundException('Course not found');
      const faculty = await tx.user.findFirst({
        where: { id: facultyId, status: 'ACTIVE', facultyProfile: { isNot: null }, roles: { some: { role: { key: 'FACULTY' } } } },
        select: { id: true },
      });
      if (!faculty) throw new NotFoundException('Active faculty account with a faculty profile not found');
      const assignment = await tx.courseFacultyAssignment.upsert({
        where: { courseId_facultyId: { courseId, facultyId } },
        create: { courseId, facultyId, assignedBy: actorId },
        update: { assignedBy: actorId },
        select: { id: true, courseId: true, facultyId: true, createdAt: true },
      });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_COURSE_FACULTY_ASSIGNED', resource: 'Course', resourceId: courseId, metadata: { facultyId, courseCode: course.code } as Prisma.InputJsonValue } });
      return assignment;
    });
  }

  listCurriculum() {
    return this.prisma.subject.findMany({
      where: { active: true },
      select: {
        id: true, code: true, name: true, description: true, sortOrder: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true, title: true, sortOrder: true,
            chapters: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true, title: true, sortOrder: true,
                topics: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, sortOrder: true } },
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createSubject(actorId: string, input: CreateSubjectDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.create({
          data: { code: input.code, name: input.name.trim(), description: input.description?.trim(), sortOrder: input.sortOrder ?? 0 },
        });
        await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_SUBJECT_CREATED', resource: 'Subject', resourceId: subject.id, metadata: { code: subject.code } as Prisma.InputJsonValue } });
        return subject;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A subject with this code already exists');
      throw error;
    }
  }

  async createUnit(actorId: string, subjectId: string, input: CreateUnitDto) {
    return this.prisma.$transaction(async (tx) => {
      const parent = await tx.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
      if (!parent) throw new NotFoundException('Subject not found');
      const unit = await tx.unit.create({ data: { subjectId, title: input.title.trim(), sortOrder: input.sortOrder ?? 0 } });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_UNIT_CREATED', resource: 'Unit', resourceId: unit.id, metadata: { subjectId } as Prisma.InputJsonValue } });
      return unit;
    });
  }

  async createChapter(actorId: string, unitId: string, input: CreateChapterDto) {
    return this.prisma.$transaction(async (tx) => {
      const parent = await tx.unit.findUnique({ where: { id: unitId }, select: { id: true } });
      if (!parent) throw new NotFoundException('Unit not found');
      const chapter = await tx.chapter.create({ data: { unitId, title: input.title.trim(), sortOrder: input.sortOrder ?? 0 } });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_CHAPTER_CREATED', resource: 'Chapter', resourceId: chapter.id, metadata: { unitId } as Prisma.InputJsonValue } });
      return chapter;
    });
  }

  async createTopic(actorId: string, chapterId: string, input: CreateTopicDto) {
    return this.prisma.$transaction(async (tx) => {
      const parent = await tx.chapter.findUnique({ where: { id: chapterId }, select: { id: true } });
      if (!parent) throw new NotFoundException('Chapter not found');
      const topic = await tx.topic.create({ data: { chapterId, title: input.title.trim(), sortOrder: input.sortOrder ?? 0 } });
      await tx.auditEvent.create({ data: { actorId, action: 'ACADEMIC_TOPIC_CREATED', resource: 'Topic', resourceId: topic.id, metadata: { chapterId } as Prisma.InputJsonValue } });
      return topic;
    });
  }
}
