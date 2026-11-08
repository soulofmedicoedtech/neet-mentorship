import { IsString, MinLength } from 'class-validator';

export class SubmitQuestionAttemptDto {
  @IsString()
  @MinLength(1)
  selectedOptionId!: string;
}
