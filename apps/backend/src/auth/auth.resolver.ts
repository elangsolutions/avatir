import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthOverview } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => AuthOverview, { name: 'authOverview' })
  authOverview(): AuthOverview {
    return this.authService.getOverview();
  }

  @Mutation(() => AuthOverview, { name: 'startGoogleSignIn' })
  startGoogleSignIn(): AuthOverview {
    return this.authService.getOverview();
  }
}
