import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  const prisma = {
    college: { findMany: jest.fn(), findFirst: jest.fn() },
    studentProfile: { findUnique: jest.fn(), upsert: jest.fn() },
    mentorshipApplication: { create: jest.fn(), findMany: jest.fn() },
  } as unknown as PrismaService;
  let service: StudentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StudentsService(prisma);
  });

  it('lists only active college catalogue records and applies a name search', async () => {
    const rows = [{ id: 'college-1', name: 'Example Medical College', state: 'Tamil Nadu' }];
    jest.mocked(prisma.college.findMany).mockResolvedValue(rows as never);
    await expect(service.listColleges('Example')).resolves.toEqual(rows);
    expect(prisma.college.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { active: true, name: { contains: 'Example', mode: 'insensitive' } },
      take: 100,
    }));
  });

  it('retrieves only the profile belonging to the authenticated user', async () => {
    const profile = { id: 'profile-1', userId: 'user-1', college: null };
    jest.mocked(prisma.studentProfile.findUnique).mockResolvedValue(profile as never);
    await expect(service.getProfile('user-1')).resolves.toEqual(profile);
    expect(prisma.studentProfile.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user-1' },
    }));
  });

  it('rejects a college ID that is not in the active catalogue', async () => {
    jest.mocked(prisma.college.findFirst).mockResolvedValue(null);
    await expect(service.updateProfile('user-1', { collegeId: 'unknown' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.studentProfile.upsert).not.toHaveBeenCalled();
  });

  it('creates mentorship applications against the authenticated student profile', async () => {
    jest.mocked(prisma.studentProfile.findUnique).mockResolvedValue({ id: 'profile-1' } as never);
    const created = { id: 'application-1', status: 'PENDING' };
    jest.mocked(prisma.mentorshipApplication.create).mockResolvedValue(created as never);
    await expect(service.createMentorshipApplication('user-1', {
      goal: 'Build a consistent postgraduate entrance preparation plan.',
    })).resolves.toEqual(created);
    expect(prisma.mentorshipApplication.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ studentProfileId: 'profile-1', goal: 'Build a consistent postgraduate entrance preparation plan.' }),
    }));
  });

  it('returns only applications associated with the authenticated student profile', async () => {
    jest.mocked(prisma.studentProfile.findUnique).mockResolvedValue({ id: 'profile-2' } as never);
    jest.mocked(prisma.mentorshipApplication.findMany).mockResolvedValue([] as never);
    await service.listMyApplications('user-2');
    expect(prisma.mentorshipApplication.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { studentProfileId: 'profile-2' },
    }));
  });
});
