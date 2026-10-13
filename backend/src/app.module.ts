import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from './vehicles/vehicle.module.js';
import { IssueModule } from './issues/issue.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5431),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        entities: [join(import.meta.dirname, '**/*.entity.js')],
        migrations: [join(import.meta.dirname, 'migrations/*.js')],
        synchronize: false, // never auto-change tables; use migrations
        migrationsRun: true, // apply pending migrations when the app starts
      }),
    }),
    VehicleModule,
    IssueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
