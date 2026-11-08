import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const professionalYears = ['1st Professional', '2nd Professional', '3rd Professional Part I', '3rd Professional Part II', 'Internship', 'Graduate'];
const examinations = ['NEET PG', 'INI-CET', 'MBBS University Exams'];
const languages = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'];

export class UpdateStudentProfileDto {
  @IsOptional() @IsString() @IsIn(professionalYears)
  professionalYear?: string;

  @IsOptional() @IsString() @MaxLength(150)
  university?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(3) @IsIn(examinations, { each: true })
  targetExaminations?: string[];

  @IsOptional() @IsString() @IsIn(languages)
  preferredLanguage?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(64)
  collegeId?: string | null;
}
