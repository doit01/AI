import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { KnowledgeService } from './knowledge.service'

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async getCategories() {
    return this.knowledgeService.getCategories()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.knowledgeService.findOne(id)
  }
}
