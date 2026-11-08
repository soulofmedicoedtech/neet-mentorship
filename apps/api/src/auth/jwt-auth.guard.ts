import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string | null; roles?: string[] };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Bearer access token required');
    try {
      const payload = await this.jwt.verifyAsync<{ sub?: string; email?: string | null; roles?: string[] }>(token);
      if (!payload.sub) throw new UnauthorizedException('Invalid access token');
      request.user = { sub: payload.sub, email: payload.email, roles: payload.roles };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
