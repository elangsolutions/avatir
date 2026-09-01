import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '../auth/roles';
import { Roles } from '../auth/roles.decorator';
import { User, CreateUserInput, UpdateUserInput } from './users.types';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Query(() => [User], { name: 'users' })
  users() {
    return this.usersService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Query(() => [User], { name: 'clients' })
  clients() {
    return this.usersService.findClients();
  }

  @Roles(UserRole.ADMIN)
  @Query(() => User, { name: 'user' })
  user(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => User, { name: 'createUser' })
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => User, { name: 'updateUser' })
  updateUser(@Args('id') id: string, @Args('input') input: UpdateUserInput) {
    return this.usersService.update(id, input);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean, { name: 'deleteUser' })
  deleteUser(@Args('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.remove(id, actor.id);
  }

  @ResolveField(() => Boolean)
  emailVerified(@Parent() user: { emailVerifiedAt?: Date | null }) {
    return Boolean(user.emailVerifiedAt);
  }
}
