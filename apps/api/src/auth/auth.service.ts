import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const studentRole = await tx.role.upsert({
          where: { key: 'STUDENT' },
          update: {},
          create: { key: 'STUDENT', description: 'Standard student account' },
        });

        return tx.user.create({
          data: {
            email,
            displayName: input.fullName.trim(),
            passwordHash,
            status: 'ACTIVE',
            roles: { create: { role: { connect: { id: studentRole.id } } } },
            studentProfile: { create: {} },
          },
          select: { id: true, email: true, displayName: true, status: true },
        });
      });

      return this.issueToken(user.id, user.email, user.displayName);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
      include: { roles: { include: { role: true } } },
    });

    if (!user?.passwordHash || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const roleKeys = user.roles.map(({ role }) => role.key);
    return this.issueToken(user.id, user.email, user.displayName, roleKeys);
  }

  private async issueToken(userId: string, email: string | null, name: string, roles = ['STUDENT']) {
    const accessToken = await this.jwt.signAsync({
      sub: userId,
      email,
      name,
      roles,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: { id: userId, email, name, roles },
    };
  }
}
