import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MentorsService } from './mentors.service';

describe('MentorsService', () => {
  const prisma = {
    mentorshipApplication: { findMany: jest.fn() },
    $transaction: jest.fn(),
  } as unknown as PrismaService;
  let service: MentorsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MentorsService(prisma);
  });

  it('lists only applications assigned to the signed-in mentor', async () => {
    jest.mocked(prisma.mentorshipApplication.findMany).mockResolvedValue([] as never);
    await service.listMyApplications('mentor-1');
    expect(prisma.mentorshipApplication.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { assignedMentorId: 'mentor-1' }, take: 100,
    }));
  });

  it('does not allow a mentor to review another mentor application', async () => {
    const tx = {
      mentorshipApplication: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue({ id: 'app-1', assignedMentorId: 'mentor-2', status: 'PENDING' }),
      },
      auditEvent: { create: jest.fn() },
    };
    (prisma as unknown as { $transaction: jest.Mock }).$transaction.mockImplementation((callback) => callback(tx));
    await expect(service.submitReview('mentor-1', 'app-1', { reviewNote: 'This is a sufficiently detailed recommendation.' }))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it('returns not found for a missing application', async () => {
    const tx = {
      mentorshipApplication: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      auditEvent: { create: jest.fn() },
    };
    (prisma as unknown as { $transaction: jest.Mock }).$transaction.mockImplementation((callback) => callback(tx));
    await expect(service.submitReview('mentor-1', 'missing', { reviewNote: 'This is a sufficiently detailed recommendation.' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('saves mentor recommendation and audit event transactionally', async () => {
    const tx = {
      mentorshipApplication: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'app-1', status: 'UNDER_REVIEW', mentorReviewNote: 'Detailed recommendation text.' }),
      },
      auditEvent: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    (prisma as unknown as { $transaction: jest.Mock }).$transaction.mockImplementation((callback) => callback(tx));
    await service.submitReview('mentor-1', 'app-1', { reviewNote: '  Detailed recommendation text.  ' });
    expect(tx.mentorshipApplication.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'app-1', assignedMentorId: 'mentor-1', status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      data: { mentorReviewNote: 'Detailed recommendation text.' },
    }));
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ actorId: 'mentor-1', action: 'MENTORSHIP_MENTOR_REVIEW_SUBMITTED' }),
    }));
  });
});
