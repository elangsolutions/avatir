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

  @Field({ nullable: true })
  notes?: string | null;

  @Field({ nullable: true })
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

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  ownerId?: string;
}

@InputType()
export class UpdateAgreementInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  clientName?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  ownerId?: string;
}
