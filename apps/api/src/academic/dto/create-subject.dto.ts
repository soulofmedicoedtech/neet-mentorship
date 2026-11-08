import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsString() @Length(2, 30) @Matches(/^[A-Z0-9_-]+$/)
  code!: string;

  @IsString() @Length(2, 120)
  name!: string;

  @IsOptional() @IsString() @Length(0, 500)
  description?: string;

  @IsOptional() @IsInt() @Min(0) @Max(10000)
  sortOrder?: number;
}
