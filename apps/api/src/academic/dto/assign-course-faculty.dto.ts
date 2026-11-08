import { IsString, Length } from 'class-validator';

export class AssignCourseFacultyDto {
  @IsString() @Length(2, 64)
  facultyId!: string;
}
