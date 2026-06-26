import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  role!: string;

  @Field({ nullable: true })
  avatarUrl?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}
