import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewMentorshipApplicationDto {
  @IsIn(['UNDER_REVIEW', 'APPROVED', 'DECLINED'])
  status!: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNote?: string;
}
