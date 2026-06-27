import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Agreement {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  clientName!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String, { nullable: true })
  ownerId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateAgreementInput {
  @Field()
  title!: string;

  @Field()
  clientName!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => String, { nullable: true })
  currency?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  ownerId?: string;
}

@InputType()
export class UpdateAgreementInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  clientName?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field(() => String, { nullable: true })
  currency?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  ownerId?: string;
}
