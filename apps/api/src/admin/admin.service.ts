import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, MentorshipApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewMentorshipApplicationDto } from './dto/review-mentorship-application.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listMentorshipApplications(status?: string) {
    const allowed = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'WITHDRAWN'];
    if (status && !allowed.includes(status)) {
      throw new BadRequestException('Unsupported application status filter');
    }
    return this.prisma.mentorshipApplication.findMany({
      where: status ? { status: status as MentorshipApplicationStatus } : {},
      include: {
        assignedMentor: { select: { id: true, displayName: true, email: true } },
        studentProfile: {
          select: {
            professionalYear: true,
            university: true,
            preferredLanguage: true,
            college: { select: { id: true, name: true, state: true } },
            user: { select: { id: true, displayName: true, email: true, createdAt: true } },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      take: 200,
    });
  }

  async listMentors() {
    return this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        roles: { some: { role: { key: 'FACULTY' } } },
        facultyProfile: { isNot: null },
      },
      select: {
        id: true, displayName: true, email: true,
        facultyProfile: { select: { qualifications: true, specialties: true } },
      },
      orderBy: { displayName: 'asc' },
      take: 200,
    });
  }

  async assignMentor(applicationId: string, actorId: string, mentorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.mentorshipApplication.findUnique({
        where: { id: applicationId },
        select: { id: true, status: true, assignedMentorId: true },
      });
      if (!application) throw new NotFoundException('Mentorship application not found');
      const mentor = await tx.user.findFirst({
        where: {
          id: mentorUserId,
          status: 'ACTIVE',
          roles: { some: { role: { key: 'FACULTY' } } },
          facultyProfile: { isNot: null },
        },
        select: { id: true },
      });
      if (!mentor) throw new BadRequestException('Select an active user with a faculty profile and FACULTY role');
      if (!['PENDING', 'UNDER_REVIEW'].includes(application.status)) {
        throw new BadRequestException('Only pending or under-review applications can be assigned');
      }

      const updatedCount = await tx.mentorshipApplication.updateMany({
        where: { id: applicationId, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
        data: { assignedMentorId: mentor.id, assignedAt: new Date() },
      });
      if (!updatedCount.count) throw new BadRequestException('Application status changed; refresh and try again');

      const updated = await tx.mentorshipApplication.findUniqueOrThrow({
        where: { id: applicationId },
        select: {
          id: true, status: true, assignedMentorId: true, assignedAt: true,
          assignedMentor: { select: { id: true, displayName: true, email: true } },
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId,
          action: 'MENTORSHIP_MENTOR_ASSIGNED',
          resource: 'MentorshipApplication',
          resourceId: applicationId,
          metadata: {
            previousMentorId: application.assignedMentorId,
            newMentorId: mentor.id,
          } as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
  }

  async reviewMentorshipApplication(applicationId: string, actorId: string, input: ReviewMentorshipApplicationDto) {
    const existing = await this.prisma.mentorshipApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Mentorship application not found');
    const transitions: Record<string, string[]> = {
      PENDING: ['UNDER_REVIEW', 'APPROVED', 'DECLINED'],
      UNDER_REVIEW: ['APPROVED', 'DECLINED'],
      APPROVED: [],
      DECLINED: [],
      WITHDRAWN: [],
    };
    if (!transitions[existing.status]?.includes(input.status)) {
      throw new BadRequestException(`Cannot change application from ${existing.status} to ${input.status}`);
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.mentorshipApplication.update({
          where: { id: applicationId },
          data: { status: input.status },
          include: {
            studentProfile: {
              select: {
                professionalYear: true,
                university: true,
                college: { select: { name: true, state: true } },
                user: { select: { id: true, displayName: true, email: true } },
              },
            },
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId,
            action: 'MENTORSHIP_APPLICATION_REVIEWED',
            resource: 'MentorshipApplication',
            resourceId: applicationId,
            metadata: {
              previousStatus: existing.status,
              newStatus: input.status,
              reviewNote: input.reviewNote?.trim() || null,
            } as Prisma.InputJsonValue,
          },
        });
        return updated;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Mentorship application not found');
      }
      throw error;
    }
  }
}
