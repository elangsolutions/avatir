import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { AgreementStatus } from '../../generated/prisma';

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

  @Field(() => String, { nullable: true })
  agentId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateAgreementInput {
  @Field()
  @MinLength(1)
  title!: string;

  @Field()
  @MinLength(1)
  clientName!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  ownerId?: string;
}

@InputType()
export class UpdateAgreementInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(1)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(1)
  clientName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  ownerId?: string;
}
