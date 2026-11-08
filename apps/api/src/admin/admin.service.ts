import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, MentorshipApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewMentorshipApplicationDto } from './dto/review-mentorship-application.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listMentorshipApplications(status?: string) {
    const allowed = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'WITHDRAWN'];
    if (status && !allowed.includes(status)) {
      return [];
    }
    return this.prisma.mentorshipApplication.findMany({
      where: status ? { status: status as MentorshipApplicationStatus } : {},
      include: {
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

  async reviewMentorshipApplication(applicationId: string, actorId: string, input: ReviewMentorshipApplicationDto) {
    const existing = await this.prisma.mentorshipApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Mentorship application not found');
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
