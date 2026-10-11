import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinSpec } from './entities/vin-spec.entity.js';
import { VinSpecController } from './vin-spec.controller.js';
import { VinSpecService } from './vin-spec.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([VinSpec])],
  controllers: [VinSpecController],
  providers: [VinSpecService],
  exports: [VinSpecService],
})
export class VinSpecModule {}
