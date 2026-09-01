import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../users/users.types';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import {
  AuthMessage,
  AuthOverview,
  AuthSession,
  AuthenticatedUser,
  LoginInput,
  RegisterInput,
  RequestEmailInput,
  ResetPasswordInput,
} from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Query(() => AuthOverview, { name: 'authOverview' })
  authOverview(): AuthOverview {
    return this.authService.getOverview();
  }

  @Public()
  @Mutation(() => AuthOverview, { name: 'startGoogleSignIn' })
  startGoogleSignIn(): AuthOverview {
    return this.authService.getOverview();
  }

  @Public()
  @Mutation(() => AuthSession, { name: 'login' })
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => AuthMessage, { name: 'register' })
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthMessage, { name: 'requestPasswordReset' })
  requestPasswordReset(@Args('input') input: RequestEmailInput) {
    return this.authService.requestPasswordReset(input.email);
  }

  @Public()
  @Mutation(() => AuthMessage, { name: 'resetPassword' })
  resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.authService.resetPassword(input);
  }

  @Public()
  @Mutation(() => AuthSession, { name: 'verifyEmail' })
  verifyEmail(@Args('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Mutation(() => AuthMessage, { name: 'resendVerificationEmail' })
  resendVerificationEmail(@Args('input') input: RequestEmailInput) {
    return this.authService.resendVerificationEmail(input.email);
  }

  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id);
  }
}
