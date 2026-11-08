import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';

export enum LearningResourceInputType {
  PDF = 'PDF',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export class CreateLearningResourceDto {
  @IsString() @Length(2, 180)
  title!: string;

  @IsEnum(LearningResourceInputType)
  type!: LearningResourceInputType;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @IsOptional() @IsString() @Length(1, 1000)
  description?: string;

  @IsOptional() @IsInt() @Min(0) @Max(100000)
  sortOrder?: number;
}
