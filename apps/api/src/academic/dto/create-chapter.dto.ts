import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString() @Length(2, 160)
  title!: string;

  @IsOptional() @IsInt() @Min(0) @Max(10000)
  sortOrder?: number;
}
