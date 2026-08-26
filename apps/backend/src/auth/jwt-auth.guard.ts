import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const user = await this.authService.userFromRequest(request);
    request.user = user ?? undefined;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || this.isIntrospection(context)) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication is required');
    }

    return true;
  }

  private getRequest(context: ExecutionContext): {
    headers?: Record<string, string | string[] | undefined>;
    user?: unknown;
  } {
    if (context.getType<'http' | 'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req;
    }

    return context.switchToHttp().getRequest();
  }

  private isIntrospection(context: ExecutionContext) {
    if (context.getType<'http' | 'graphql'>() !== 'graphql') {
      return false;
    }

    const fieldName = GqlExecutionContext.create(context).getInfo()?.fieldName;
    return fieldName === '__schema' || fieldName === '__type';
  }
}
