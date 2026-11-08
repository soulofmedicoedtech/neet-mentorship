import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateLectureProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  watchedSeconds?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
