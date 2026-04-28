import { IsString, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @IsUUID()
  facultyId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
