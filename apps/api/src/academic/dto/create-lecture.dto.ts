import { IsInt, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';

export class CreateLectureDto {
  @IsString() @Length(2, 180)
  title!: string;

  @IsOptional() @IsString() @Length(1, 2000)
  description?: string;

  @IsOptional() @IsString() @IsUrl({ protocols: ['https'], require_protocol: true })
  videoUrl?: string;

  @IsOptional() @IsString() @Length(2, 20)
  videoType?: string;

  @IsOptional() @IsInt() @Min(1) @Max(86400)
  durationSec?: number;

  @IsOptional() @IsString() @Length(2, 64)
  topicId?: string;

  @IsOptional() @IsInt() @Min(0) @Max(100000)
  sortOrder?: number;
}
