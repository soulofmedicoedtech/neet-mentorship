import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}


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
