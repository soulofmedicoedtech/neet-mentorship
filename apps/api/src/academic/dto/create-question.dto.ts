import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { QuestionDifficulty, QuestionExamTrack } from '@prisma/client';

export class CreateQuestionOptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  sortOrder?: number;

  @IsOptional()
  isCorrect?: boolean;
}

export class CreateQuestionDto {
  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsEnum(QuestionExamTrack)
  examTrack!: QuestionExamTrack;

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsString()
  @MinLength(5)
  @MaxLength(10000)
  questionText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearAsked?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  marks?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceReference?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options!: CreateQuestionOptionDto[];
}
