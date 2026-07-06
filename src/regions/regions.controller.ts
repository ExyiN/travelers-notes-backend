import { Controller, Get, Query } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  async getRegions(@Query('search') search?: string) {
    if (!search) {
      return this.regionsService.getRegions();
    }
    return this.regionsService.getFilteredRegions(search);
  }
}
