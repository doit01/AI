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
import { DepartmentService } from './department.service'
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto'
import { RequirePermission } from '../common/decorators/permission.decorator'

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Post()
  @RequirePermission('dept:create')
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto)
  }

  @Get()
  @RequirePermission('dept:read')
  findAll() {
    return this.departmentService.findAll()
  }

  @Get(':id')
  @RequirePermission('dept:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('dept:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('dept:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id)
  }
}
