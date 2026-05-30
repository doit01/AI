import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator'

export class CreateDepartmentDto {
  @IsString()
  name: string

  @IsOptional()
  @IsInt()
  parentId?: number

  @IsOptional()
  @IsInt()
  sort?: number
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsInt()
  parentId?: number

  @IsOptional()
  @IsInt()
  sort?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number
}
