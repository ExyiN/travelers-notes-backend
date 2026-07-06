import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getLocations(@Query('search') search?: string) {
    if (!search) {
      return this.locationsService.getLocations();
    }
    return this.locationsService.getFilteredLocations(search);
  }
}
