import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { VinSpec } from '../../vin-specs/entities/vin-spec.entity.js';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column({ name: 'vin' })
  VIN: string;

  @ManyToOne(() => VinSpec)
  @JoinColumn({ name: 'vin', referencedColumnName: 'vin' })
  vinSpec: VinSpec;

  @Column({ name: 'mileage', type: 'int' })
  mileage: number;

  @Column({ name: 'battery_health', type: 'int' })
  batteryHealth: number;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'is_sale_ready', type: 'bool' })
  isSaleReady: boolean;

  @Column({ name: 'is_available', type: 'bool' })
  isAvailable: boolean;

  @Column({ name: 'equipments' })
  equipments: string;
}
