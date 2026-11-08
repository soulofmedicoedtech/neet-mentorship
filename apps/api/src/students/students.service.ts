import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorshipApplicationDto } from './dto/create-mentorship-application.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listColleges(search?: string) {
    return this.prisma.college.findMany({
      where: { active: true, ...(search?.trim() ? { name: { contains: search.trim(), mode: 'insensitive' } } : {}) },
      select: { id: true, name: true, state: true, university: true, collegeType: true },
      orderBy: [{ state: 'asc' }, { name: 'asc' }],
      take: 100,
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: { college: { select: { id: true, name: true, state: true, university: true, collegeType: true } } },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async updateProfile(userId: string, input: UpdateStudentProfileDto) {
    if (input.collegeId) {
      const college = await this.prisma.college.findFirst({ where: { id: input.collegeId, active: true }, select: { id: true } });
      if (!college) throw new NotFoundException('Active college not found');
    }
    return this.prisma.studentProfile.upsert({
      where: { userId },
      update: input,
      create: { ...input, user: { connect: { id: userId } } },
      include: { college: { select: { id: true, name: true, state: true, university: true, collegeType: true } } },
    });
  }

  async createMentorshipApplication(userId: string, input: CreateMentorshipApplicationDto) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return this.prisma.mentorshipApplication.create({
      data: { studentProfileId: profile.id, goal: input.goal.trim(), challenge: input.challenge?.trim(), preferredContact: input.preferredContact?.trim() },
      select: { id: true, goal: true, challenge: true, preferredContact: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async listMyApplications(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return this.prisma.mentorshipApplication.findMany({
      where: { studentProfileId: profile.id },
      select: { id: true, goal: true, challenge: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
