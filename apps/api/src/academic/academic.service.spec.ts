import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { LearningResourceInputType } from './dto/create-learning-resource.dto';

describe('AcademicService', () => {
  const tx = {
    subject: { create: jest.fn(), findUnique: jest.fn() },
    unit: { create: jest.fn(), findUnique: jest.fn() },
    chapter: { create: jest.fn(), findUnique: jest.fn() },
    topic: { create: jest.fn() },
    course: { create: jest.fn(), findUnique: jest.fn() },
    lecture: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    learningResource: { create: jest.fn(), updateMany: jest.fn() },
    user: { findFirst: jest.fn() },
    courseFacultyAssignment: { upsert: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    courseEnrollment: { upsert: jest.fn(), update: jest.fn() },
    lectureProgress: { findUnique: jest.fn(), upsert: jest.fn(), count: jest.fn() },
    lecture: { count: jest.fn() },
    auditEvent: { create: jest.fn() },
  };
  const prisma = {
    subject: { findMany: jest.fn() },
    course: { findMany: jest.fn(), findUnique: jest.fn() },
    courseFacultyAssignment: { findMany: jest.fn(), findUnique: jest.fn() },
    lecture: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
    studentProfile: { findUnique: jest.fn() },
    courseEnrollment: { findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  };
  let service: AcademicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AcademicService(prisma as never);
    tx.auditEvent.create.mockResolvedValue({});
  });




  it('enrolls a student idempotently and records an audit event', async () => {
    prisma.studentProfile.findUnique.mockResolvedValue({ id: 'profile1' });
    prisma.course.findFirst.mockResolvedValue({ id: 'course1' });
    tx.courseEnrollment.upsert.mockResolvedValue({ id: 'enrol1', courseId: 'course1' });
    await expect(service.enrollStudentInCourse('student1', 'course1')).resolves.toMatchObject({ id: 'enrol1' });
    expect(tx.courseEnrollment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { studentProfileId_courseId: { studentProfileId: 'profile1', courseId: 'course1' } },
    }));
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'STUDENT_COURSE_ENROLLED' }) }));
  });

  it('does not enroll a student in an inactive or missing course', async () => {
    prisma.studentProfile.findUnique.mockResolvedValue({ id: 'profile1' });
    prisma.course.findFirst.mockResolvedValue(null);
    await expect(service.enrollStudentInCourse('student1', 'course1')).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.courseEnrollment.upsert).not.toHaveBeenCalled();
  });

  it('lists only the signed-in student profile enrollments and published lectures', async () => {
    prisma.studentProfile.findUnique.mockResolvedValue({ id: 'profile1' });
    prisma.courseEnrollment.findMany.mockResolvedValue([]);
    await expect(service.listMyEnrollments('student1')).resolves.toEqual([]);
    expect(prisma.courseEnrollment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { studentProfileId: 'profile1', course: { active: true } },
    }));
  });

  it('requires course enrollment before recording lecture progress', async () => {
    prisma.studentProfile.findUnique.mockResolvedValue({ id: 'profile1' });
    prisma.lecture.findFirst.mockResolvedValue({ id: 'lecture1', courseId: 'course1' });
    prisma.courseEnrollment.findUnique.mockResolvedValue(null);
    await expect(service.updateStudentLectureProgress('student1', 'lecture1', { completed: true })).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.lectureProgress.upsert).not.toHaveBeenCalled();
  });

  it('stores lecture progress and marks the course complete when all published lectures are complete', async () => {
    prisma.studentProfile.findUnique.mockResolvedValue({ id: 'profile1' });
    prisma.lecture.findFirst.mockResolvedValue({ id: 'lecture1', courseId: 'course1' });
    prisma.courseEnrollment.findUnique.mockResolvedValue({ id: 'enrol1' });
    tx.lectureProgress.findUnique.mockResolvedValue(null);
    tx.lectureProgress.upsert.mockResolvedValue({ id: 'progress1', lectureId: 'lecture1', watchedSeconds: 90, completedAt: new Date() });
    tx.lecture.count.mockResolvedValue(1);
    tx.lectureProgress.count.mockResolvedValue(1);
    await expect(service.updateStudentLectureProgress('student1', 'lecture1', { watchedSeconds: 90, completed: true })).resolves.toMatchObject({ id: 'progress1' });
    expect(tx.courseEnrollment.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'enrol1' }, data: expect.objectContaining({ completedAt: expect.any(Date) }) }));
  });

  it('lists only published lectures and published learning resources for students', async () => {
    prisma.lecture.findMany.mockResolvedValue([]);
    await service.listPublishedLectures('course1');
    expect(prisma.lecture.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { courseId: 'course1', status: 'PUBLISHED', course: { active: true } },
      select: expect.objectContaining({ resources: expect.objectContaining({ where: { status: 'PUBLISHED' } }) }),
    }));
  });

  it('requires a faculty course assignment before creating a lecture', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course1', subjectId: 'subject1', active: true });
    prisma.courseFacultyAssignment.findUnique.mockResolvedValue(null);
    await expect(service.createLecture('faculty1', 'course1', { title: 'Cell structure' }, false)).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.lecture.create).not.toHaveBeenCalled();
  });

  it('creates a lecture and audit record for assigned faculty', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course1', subjectId: 'subject1', active: true });
    prisma.courseFacultyAssignment.findUnique.mockResolvedValue({ id: 'assignment1' });
    tx.lecture.create.mockResolvedValue({ id: 'lecture1', title: 'Cell structure', status: 'DRAFT' });
    await expect(service.createLecture('faculty1', 'course1', { title: 'Cell structure' }, false)).resolves.toMatchObject({ id: 'lecture1' });
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'ACADEMIC_LECTURE_CREATED' }) }));
  });


  it('rejects lecture creation for inactive courses', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course1', subjectId: 'subject1', active: false });
    await expect(service.createLecture('admin1', 'course1', { title: 'Inactive course lecture' }, true)).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.lecture.create).not.toHaveBeenCalled();
  });

  it('prevents adding resources after a lecture has been submitted', async () => {
    prisma.lecture.findUnique.mockResolvedValue({ id: 'lecture1', authorId: 'faculty1', status: 'SUBMITTED' });
    await expect(service.createLearningResource('faculty1', 'lecture1', { title: 'Notes', type: LearningResourceInputType.PDF, url: 'https://files.example.org/notes.pdf' }, false)).rejects.toBeInstanceOf(ConflictException);
    expect(tx.learningResource.create).not.toHaveBeenCalled();
  });

  it('creates a PDF resource only for the lecture author or privileged editor', async () => {
    prisma.lecture.findUnique.mockResolvedValue({ id: 'lecture1', authorId: 'faculty1', status: 'DRAFT' });
    tx.learningResource.create.mockResolvedValue({ id: 'resource1', type: LearningResourceInputType.PDF });
    await expect(service.createLearningResource('faculty1', 'lecture1', { title: 'Lecture notes', type: LearningResourceInputType.PDF, url: 'https://files.example.org/notes.pdf' }, false)).resolves.toMatchObject({ id: 'resource1' });
    await expect(service.createLearningResource('faculty2', 'lecture1', { title: 'Lecture notes', type: LearningResourceInputType.PDF, url: 'https://files.example.org/notes.pdf' }, false)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('submits a lecture and its draft resources for academic review', async () => {
    tx.lecture.findUnique.mockResolvedValue({ id: 'lecture1', authorId: 'faculty1', status: 'DRAFT' });
    tx.lecture.update.mockResolvedValue({ id: 'lecture1', status: 'SUBMITTED' });
    await expect(service.submitLecture('faculty1', 'lecture1', false)).resolves.toMatchObject({ status: 'SUBMITTED' });
    expect(tx.learningResource.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ lectureId: 'lecture1' }) }));
  });

  it('prevents publishing a lecture before it has been approved', async () => {
    tx.lecture.findUnique.mockResolvedValue({ id: 'lecture1', status: 'SUBMITTED' });
    await expect(service.reviewLecture('admin1', 'lecture1', { status: 'PUBLISHED' })).rejects.toBeInstanceOf(ConflictException);
    expect(tx.lecture.update).not.toHaveBeenCalled();
  });

  it('approves submitted lectures and audits the reviewer action', async () => {
    tx.lecture.findUnique.mockResolvedValue({ id: 'lecture1', status: 'SUBMITTED' });
    tx.lecture.update.mockResolvedValue({ id: 'lecture1', status: 'APPROVED' });
    await expect(service.reviewLecture('admin1', 'lecture1', { status: 'APPROVED' })).resolves.toMatchObject({ status: 'APPROVED' });
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'ACADEMIC_LECTURE_REVIEWED' }) }));
  });

  it('lists active courses without exposing faculty account details', async () => {
    prisma.course.findMany.mockResolvedValue([{ id: 'course1', code: 'ANAT-01' }]);
    await expect(service.listCourses()).resolves.toHaveLength(1);
    expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true } }));
  });

  it('creates a course under an existing subject and audits it', async () => {
    tx.subject.findUnique.mockResolvedValue({ id: 's1' });
    tx.course.create.mockResolvedValue({ id: 'course1', code: 'ANAT-01', subjectId: 's1' });
    await expect(service.createCourse('admin1', { code: 'ANAT-01', title: 'Anatomy Core', subjectId: 's1' })).resolves.toMatchObject({ id: 'course1' });
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'ACADEMIC_COURSE_CREATED' }) }));
  });

  it('rejects course creation when the subject does not exist', async () => {
    tx.subject.findUnique.mockResolvedValue(null);
    await expect(service.createCourse('admin1', { code: 'ANAT-01', title: 'Anatomy Core', subjectId: 'missing' })).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.course.create).not.toHaveBeenCalled();
  });

  it('assigns only active, verified faculty accounts and audits the assignment', async () => {
    tx.course.findUnique.mockResolvedValue({ id: 'course1', code: 'ANAT-01' });
    tx.user.findFirst.mockResolvedValue({ id: 'faculty1' });
    tx.courseFacultyAssignment.upsert.mockResolvedValue({ id: 'assignment1', courseId: 'course1', facultyId: 'faculty1' });
    await expect(service.assignFaculty('admin1', 'course1', 'faculty1')).resolves.toMatchObject({ id: 'assignment1' });
    expect(tx.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) }));
    expect(tx.auditEvent.create).toHaveBeenCalled();
  });

  it('returns only the authenticated faculty member course assignments', async () => {
    prisma.courseFacultyAssignment.findMany.mockResolvedValue([{ course: { id: 'course1' } }]);
    await expect(service.listMyCourses('faculty1')).resolves.toHaveLength(1);
    expect(prisma.courseFacultyAssignment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { facultyId: 'faculty1', course: { active: true } } }));
  });

  it('returns active curriculum in hierarchy order', async () => {
    prisma.subject.findMany.mockResolvedValue([{ id: 's1', units: [] }]);
    await expect(service.listCurriculum()).resolves.toHaveLength(1);
    expect(prisma.subject.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true } }));
  });

  it('creates a subject and records an audit event in one transaction', async () => {
    tx.subject.create.mockResolvedValue({ id: 's1', code: 'ANAT', name: 'Anatomy' });
    await expect(service.createSubject('admin1', { code: 'ANAT', name: 'Anatomy' })).resolves.toMatchObject({ id: 's1' });
    expect(tx.auditEvent.create).toHaveBeenCalled();
  });

  it('rejects a duplicate subject code', async () => {
    const { Prisma } = await import('@prisma/client');
    const known = new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' });
    prisma.$transaction.mockRejectedValueOnce(known as never);
    await expect(service.createSubject('admin1', { code: 'ANAT', name: 'Anatomy' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not create a unit when its subject does not exist', async () => {
    tx.subject.findUnique.mockResolvedValue(null);
    await expect(service.createUnit('faculty1', 'missing', { title: 'General Anatomy' })).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.unit.create).not.toHaveBeenCalled();
  });

  it('creates a chapter only under an existing unit', async () => {
    tx.unit.findUnique.mockResolvedValue({ id: 'u1' });
    tx.chapter.create.mockResolvedValue({ id: 'c1', unitId: 'u1', title: 'Introduction' });
    await expect(service.createChapter('faculty1', 'u1', { title: 'Introduction' })).resolves.toMatchObject({ id: 'c1' });
  });

  it('creates a topic only under an existing chapter', async () => {
    tx.chapter.findUnique.mockResolvedValue({ id: 'c1' });
    tx.topic.create.mockResolvedValue({ id: 't1', chapterId: 'c1', title: 'Anatomical position' });
    await expect(service.createTopic('faculty1', 'c1', { title: 'Anatomical position' })).resolves.toMatchObject({ id: 't1' });
  });
});
