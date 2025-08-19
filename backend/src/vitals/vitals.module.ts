import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalSign } from './entities/vital-sign.entity';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSign])],
  providers: [VitalsService],
  controllers: [VitalsController],
  exports: [VitalsService],
})
export class VitalsModule {}
