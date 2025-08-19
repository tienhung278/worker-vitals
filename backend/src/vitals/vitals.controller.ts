import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { CreateVitalDto } from './dto/create-vital.dto';
import { GetVitalsQueryDto } from './dto/get-vitals.dto';

@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  create(@Body() dto: CreateVitalDto) {
    return this.vitalsService.create(dto);
  }

  @Get(':workerId')
  findLatest(@Param('workerId') workerId: string, @Query() query: GetVitalsQueryDto) {
    const limit = query.limit ?? 10;
    return this.vitalsService.findLatestForWorker(workerId, limit);
  }
}
