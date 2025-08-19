import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { VitalsModule } from './vitals/vitals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'postgres'),
        autoLoadEntities: true,
        // Use synchronize for non-production environments only; rely on migrations in prod
        synchronize: (config.get<string>('NODE_ENV') || process.env.NODE_ENV) !== 'production',
        ssl: false,
      }),
    }),
    HealthModule,
    VitalsModule,
  ],
})
export class AppModule {}
