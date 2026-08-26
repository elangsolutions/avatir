import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from './auth.types';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UserRole } from './roles';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || this.isIntrospection(context)) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const user = this.getUser(context);
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this action');
    }

    return true;
  }

  private getUser(context: ExecutionContext): AuthenticatedUser | undefined {
    if (context.getType<'http' | 'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req?.user;
    }

    return context.switchToHttp().getRequest().user;
  }

  private isIntrospection(context: ExecutionContext) {
    if (context.getType<'http' | 'graphql'>() !== 'graphql') {
      return false;
    }

    const fieldName = GqlExecutionContext.create(context).getInfo()?.fieldName;
    return fieldName === '__schema' || fieldName === '__type';
  }
}
