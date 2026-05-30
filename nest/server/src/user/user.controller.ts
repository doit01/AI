import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto'
import { RequirePermission } from '../common/decorators/permission.decorator'

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @RequirePermission('user:create')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

  @Get()
  @RequirePermission('user:read')
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('user:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('user:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id)
  }
}
