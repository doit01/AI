import {
  IsString,
  IsOptional,
  IsInt,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string

  @IsOptional()
  @IsString()
  realName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsInt()
  departmentId?: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[]
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  realName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsInt()
  departmentId?: number

  @IsOptional()
  status?: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[]
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsInt()
  departmentId?: number

  @IsOptional()
  @IsInt()
  status?: number

  @IsOptional()
  @IsInt()
  page?: number

  @IsOptional()
  @IsInt()
  pageSize?: number
}
