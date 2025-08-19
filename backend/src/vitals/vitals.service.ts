import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSign } from './entities/vital-sign.entity';
import { CreateVitalDto } from './dto/create-vital.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VitalsService {
  private readonly defaultWorkerId: string;

  constructor(
    @InjectRepository(VitalSign)
    private readonly vitalRepo: Repository<VitalSign>,
    private readonly config: ConfigService,
  ) {
    this.defaultWorkerId = this.config.get<string>('DEFAULT_WORKER_ID', 'worker-123');
  }

  async create(dto: CreateVitalDto): Promise<VitalSign> {
    const workerId = dto.workerId?.trim() || this.defaultWorkerId;
    const vital = this.vitalRepo.create({
      workerId,
      heartRate: dto.heartRate,
      temperature: dto.temperature,
    });
    return this.vitalRepo.save(vital);
  }

  async findLatestForWorker(workerId: string, limit = 10): Promise<VitalSign[]> {
    const take = Math.max(1, Math.min(100, limit));
    return this.vitalRepo.find({
      where: { workerId },
      order: { timestamp: 'DESC' },
      take,
    });
  }
}
