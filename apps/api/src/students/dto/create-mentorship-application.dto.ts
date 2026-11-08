import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMentorshipApplicationDto {
  @IsString() @MinLength(20) @MaxLength(2000)
  goal!: string;

  @IsOptional() @IsString() @MaxLength(2000)
  challenge?: string;

  @IsOptional() @IsString() @MaxLength(120)
  preferredContact?: string;
}
