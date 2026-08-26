import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { User } from '../users/users.types';
import { UserRole } from './roles';

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

@ObjectType()
export class AuthProvider {
  @Field()
  name!: string;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class AuthOverview {
  @Field()
  message!: string;

  @Field(() => [AuthProvider])
  providers!: AuthProvider[];
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(1)
  password!: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @MinLength(1)
  name!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  password!: string;
}

@ObjectType()
export class AuthSession {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}

@ObjectType()
export class AuthMessage {
  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  devLink?: string | null;
}

@InputType()
export class RequestEmailInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @MinLength(1)
  token!: string;

  @Field()
  @MinLength(8)
  password!: string;
}
