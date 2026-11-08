import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { QuestionDifficulty, QuestionExamTrack } from '@prisma/client';

export class ListQuestionsDto {
  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsEnum(QuestionExamTrack)
  examTrack?: QuestionExamTrack;

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
