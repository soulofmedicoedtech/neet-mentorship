import { IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitMentorReviewDto {
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  reviewNote!: string;
}
