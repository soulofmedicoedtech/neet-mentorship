import { ConflictException, NotFoundException } from '@nestjs/common';
import { AcademicService } from './academic.service';

describe('AcademicService', () => {
  const tx = {
    subject: { create: jest.fn(), findUnique: jest.fn() },
    unit: { create: jest.fn(), findUnique: jest.fn() },
    chapter: { create: jest.fn(), findUnique: jest.fn() },
    topic: { create: jest.fn() },
    course: { create: jest.fn(), findUnique: jest.fn() },
    user: { findFirst: jest.fn() },
    courseFacultyAssignment: { upsert: jest.fn(), findMany: jest.fn() },
    auditEvent: { create: jest.fn() },
  };
  const prisma = {
    subject: { findMany: jest.fn() },
    course: { findMany: jest.fn() },
    courseFacultyAssignment: { findMany: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  };
  let service: AcademicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AcademicService(prisma as never);
    tx.auditEvent.create.mockResolvedValue({});
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
