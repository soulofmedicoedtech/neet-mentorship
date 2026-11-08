import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const prisma = {
    mentorshipApplication: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  } as unknown as PrismaService;
  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(prisma);
  });

  it('lists applications with an optional status filter and student details', async () => {
    jest.mocked(prisma.mentorshipApplication.findMany).mockResolvedValue([] as never);
    await service.listMentorshipApplications('PENDING');
    expect(prisma.mentorshipApplication.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'PENDING' },
      take: 200,
    }));
  });

  it('rejects unsupported status filters', async () => {
    await expect(service.listMentorshipApplications('MADE_UP')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.mentorshipApplication.findMany).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown application', async () => {
    jest.mocked(prisma.mentorshipApplication.findUnique).mockResolvedValue(null);
    await expect(service.reviewMentorshipApplication('missing', 'admin-1', { status: 'APPROVED' }))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('updates status and writes an audit event in one transaction', async () => {
    jest.mocked(prisma.mentorshipApplication.findUnique).mockResolvedValue({ id: 'app-1', status: 'PENDING' } as never);
    const updated = { id: 'app-1', status: 'APPROVED' };
    const tx = {
      mentorshipApplication: { update: jest.fn().mockResolvedValue(updated) },
      auditEvent: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    (prisma as unknown as { $transaction: jest.Mock }).$transaction.mockImplementation((callback) => callback(tx));
    await expect(service.reviewMentorshipApplication('app-1', 'admin-1', { status: 'APPROVED' })).resolves.toEqual(updated);
    expect(tx.mentorshipApplication.update).toHaveBeenCalled();
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ actorId: 'admin-1', action: 'MENTORSHIP_APPLICATION_REVIEWED', resourceId: 'app-1' }),
    }));
  });
});
