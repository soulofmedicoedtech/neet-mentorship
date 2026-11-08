import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitMentorReviewDto } from './dto/submit-mentor-review.dto';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyApplications(mentorUserId: string) {
    return this.prisma.mentorshipApplication.findMany({
      where: { assignedMentorId: mentorUserId },
      select: {
        id: true, goal: true, challenge: true, preferredContact: true,
        status: true, assignedAt: true, mentorReviewNote: true, createdAt: true,
        studentProfile: {
          select: {
            professionalYear: true, university: true, preferredLanguage: true,
            college: { select: { name: true, state: true } },
            user: { select: { displayName: true, email: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 100,
    });
  }

  async submitReview(mentorUserId: string, applicationId: string, input: SubmitMentorReviewDto) {
    const existing = await this.prisma.mentorshipApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, assignedMentorId: true, status: true, mentorReviewNote: true },
    });
    if (!existing) throw new NotFoundException('Mentorship application not found');
    if (existing.assignedMentorId !== mentorUserId) {
      throw new ForbiddenException('This application is not assigned to your account');
    }
    if (!['PENDING', 'UNDER_REVIEW'].includes(existing.status)) {
      throw new ForbiddenException('This application is no longer open for mentor review');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.mentorshipApplication.update({
        where: { id: applicationId },
        data: { mentorReviewNote: input.reviewNote.trim() },
        select: { id: true, status: true, mentorReviewNote: true, updatedAt: true },
      });
      await tx.auditEvent.create({
        data: {
          actorId: mentorUserId,
          action: 'MENTORSHIP_MENTOR_REVIEW_SUBMITTED',
          resource: 'MentorshipApplication',
          resourceId: applicationId,
          metadata: {
            previousNotePresent: Boolean(existing.mentorReviewNote),
            noteLength: input.reviewNote.trim().length,
          } as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
  }
}
