import { IsString, MinLength } from 'class-validator';

export class AssignMentorDto {
  @IsString()
  @MinLength(1)
  mentorUserId!: string;
}
