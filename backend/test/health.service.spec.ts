import { Test } from '@nestjs/testing';
import { HealthModule } from '../src/health/health.module';
import { HealthService } from '../src/health/health.service';

describe('HealthService (DB-backed harness smoke test)', () => {
  it('should return ok status with timestamp', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    const service = moduleRef.get<HealthService>(HealthService);
    const res = service.check();

    expect(res).toHaveProperty('status', 'ok');
    expect(typeof res.timestamp).toBe('string');
    expect(() => new Date(res.timestamp)).not.toThrow();

    await moduleRef.close();
  });
});
