import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto'
import { RequirePermission } from '../common/decorators/permission.decorator'

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @RequirePermission('role:create')
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto)
  }

  @Get()
  @RequirePermission('role:read')
  findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  @RequirePermission('role:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('role:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('role:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id)
  }
}
