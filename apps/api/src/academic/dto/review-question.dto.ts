import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum QuestionReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

export class ReviewQuestionDto {
  @IsEnum(QuestionReviewDecision)
  status!: QuestionReviewDecision;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
