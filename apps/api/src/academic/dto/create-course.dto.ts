import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString() @Matches(/^[A-Z0-9_-]{2,30}$/)
  code!: string;

  @IsString() @Length(2, 160)
  title!: string;

  @IsString() @Length(2, 64)
  subjectId!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;
}
