import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column({ name: 'vin' })
  VIN: string;

  @Column()
  model: string;

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

  @Column({ name: 'equipments', type: 'varchar', nullable: true })
  equipments: string | null;
}
