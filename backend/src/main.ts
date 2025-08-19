import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS with env-driven allowed origins
  const config = app.get(ConfigService);
  const origins = (config.get<string>('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => !!o);
  if (origins.length === 0) {
    app.enableCors({ origin: true, credentials: true });
  } else {
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || origins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS blocked'), false);
      },
      credentials: true,
    });
  }

  // Global API prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Worker Vitals backend is running on port ${port} (base path: /api/v1)`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});
