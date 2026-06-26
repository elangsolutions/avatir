import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AppInfo {
  @Field()
  name!: string;

  @Field()
  tagline!: string;

  @Field()
  status!: string;
}
