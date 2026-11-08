import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewContentDto {
  @IsIn(['APPROVED', 'REJECTED', 'PUBLISHED'])
  status!: 'APPROVED' | 'REJECTED' | 'PUBLISHED';

  @IsOptional() @IsString() @MaxLength(2000)
  reviewNote?: string;
}
