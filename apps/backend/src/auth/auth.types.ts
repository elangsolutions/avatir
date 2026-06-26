import { Field, ObjectType } from '@nestjs/graphql';

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
