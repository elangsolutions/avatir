import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDefined,
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
  ValidateNested,
} from 'class-validator';
import { PolicyFormat, PolicyKind } from '../../generated/prisma';
import {
  IsCuit,
  optionalText,
  parseIncomingDateTime,
  requiredText,
} from './ar-formats';

/** Upper bound of the Decimal(14,2) columns backing the amount. */
export const MAX_POLICY_AMOUNT = 999_999_999_999.99;

export class PartyDto {
  @IsString()
  @Length(1, 200)
  @Transform(({ value }) => requiredText(value))
  name!: string;

  @IsCuit()
  taxId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  @Transform(({ value }) => optionalText(value))
  address?: string;
}

export class ApplicantDto extends PartyDto {
  /** Links the agreement to an existing CLIENT user when supplied. */
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => optionalText(value)?.toLowerCase())
  ownerEmail?: string;
}

export class TenderDto {
  @IsString()
  @Length(1, 60)
  @Transform(({ value }) => requiredText(value))
  processCode!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Transform(({ value }) => optionalText(value))
  fileNumber?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => parseIncomingDateTime(value))
  bidOpeningAt?: Date;

  @IsString()
  @Length(1, 2000)
  @Transform(({ value }) => requiredText(value))
  purpose!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Transform(({ value }) => optionalText(value))
  purchaseOrder?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Transform(({ value }) => optionalText(value))
  billingPeriod?: string;
}

export class CreatePolicyRequestDto {
  @IsEnum(PolicyKind)
  policyKind!: PolicyKind;

  @IsEnum(PolicyFormat)
  policyFormat!: PolicyFormat;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(MAX_POLICY_AMOUNT)
  policyAmount!: number;

  @IsOptional()
  @IsIn(['ARS', 'USD'])
  currency?: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => ApplicantDto)
  applicant!: ApplicantDto;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PartyDto)
  beneficiary!: PartyDto;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => TenderDto)
  tender!: TenderDto;

  @IsOptional()
  @IsString()
  @Length(8, 200)
  @Transform(({ value }) => optionalText(value))
  idempotencyKey?: string;
}
