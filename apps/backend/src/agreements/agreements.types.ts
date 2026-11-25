import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AgreementStatus, PolicyFormat, PolicyKind } from '../../generated/prisma';
import { IsCuit } from '../integration/ar-formats';

const MAX_POLICY_AMOUNT = 999_999_999_999.99;

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

@ObjectType()
export class AgreementQuote {
  @Field()
  company!: string;

  @Field(() => Float)
  premium!: number;

  @Field()
  currency!: string;

  @Field(() => String, { nullable: true })
  validUntil?: string | null;
}

@ObjectType()
export class AgreementQuoteSimulation {
  @Field()
  source!: string;

  @Field()
  simulatedAt!: Date;

  @Field(() => [AgreementQuote])
  quotes!: AgreementQuote[];
}

@InputType()
export class AgreementSimulationPartyInput {
  @Field()
  @IsString()
  @Length(1, 200)
  name!: string;

  @Field()
  @IsCuit()
  taxId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  address?: string;
}

@InputType()
export class AgreementSimulationApplicantInput extends AgreementSimulationPartyInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  ownerEmail?: string;
}

@InputType()
export class AgreementSimulationTenderInput {
  @Field()
  @IsString()
  @Length(1, 60)
  processCode!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  fileNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  bidOpeningAt?: string;

  @Field()
  @IsString()
  @Length(1, 2000)
  purpose!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  purchaseOrder?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  billingPeriod?: string;
}

@InputType()
export class AgreementSimulationInput {
  @Field()
  @IsEnum(PolicyKind)
  policyKind!: PolicyKind;

  @Field()
  @IsEnum(PolicyFormat)
  policyFormat!: PolicyFormat;

  @Field(() => Float)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(MAX_POLICY_AMOUNT)
  policyAmount!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['ARS', 'USD'])
  currency?: string;

  @Field(() => AgreementSimulationApplicantInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AgreementSimulationApplicantInput)
  applicant!: AgreementSimulationApplicantInput;

  @Field(() => AgreementSimulationPartyInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AgreementSimulationPartyInput)
  beneficiary!: AgreementSimulationPartyInput;

  @Field(() => AgreementSimulationTenderInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AgreementSimulationTenderInput)
  tender!: AgreementSimulationTenderInput;
}
