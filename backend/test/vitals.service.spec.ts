import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { VitalsService } from '../src/vitals/vitals.service';
import { VitalSign } from '../src/vitals/entities/vital-sign.entity';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Helper to sleep for ordering differences if needed
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('VitalsService (real DB)', () => {
  let app: INestApplication;
  let service: VitalsService;
  let repo: Repository<VitalSign>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    service = app.get(VitalsService);
    repo = app.get<Repository<VitalSign>>(getRepositoryToken(VitalSign));
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    // Clean table between tests
    await repo.clear();
  });

  it('creates a vital record and persists to DB', async () => {
    const created = await service.create({ heartRate: 80, temperature: 36.6 });

    expect(created.id).toBeDefined();
    expect(created.heartRate).toBe(80);
    expect(created.temperature).toBe(36.6);
    expect(typeof created.workerId).toBe('string');

    const inDb = await repo.findOne({ where: { id: created.id } });
    expect(inDb).toBeTruthy();
    expect(inDb!.heartRate).toBe(80);
  });

  it('finds latest vitals for a worker with correct ordering and limit', async () => {
    const worker = 'worker-x';

    await service.create({ workerId: worker, heartRate: 70, temperature: 36.5 });
    await sleep(5);
    await service.create({ workerId: worker, heartRate: 75, temperature: 36.7 });
    await sleep(5);
    await service.create({ workerId: worker, heartRate: 78, temperature: 36.8 });

    const latestTwo = await service.findLatestForWorker(worker, 2);
    expect(latestTwo.length).toBe(2);
    // Should be ordered by timestamp DESC: last inserted first
    expect(latestTwo[0].heartRate).toBe(78);
    expect(latestTwo[1].heartRate).toBe(75);

    const all = await service.findLatestForWorker(worker, 10);
    expect(all.map((v) => v.heartRate)).toEqual([78, 75, 70]);
  });
});
