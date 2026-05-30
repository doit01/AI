import { IsString, IsOptional, IsArray } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  name: string

  @IsString()
  code: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  permissions?: string[]
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  code?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  status?: number

  @IsOptional()
  @IsArray()
  permissions?: string[]
}
