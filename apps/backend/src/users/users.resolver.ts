import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, CreateUserInput, UpdateUserInput } from './users.types';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  users() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  user(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User, { name: 'createUser' })
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(@Args('id') id: string, @Args('input') input: UpdateUserInput) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteUser' })
  deleteUser(@Args('id') id: string) {
    return this.usersService.remove(id);
  }
}
