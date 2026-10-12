import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('vin_specs')
export class VinSpec {
  @PrimaryColumn({ type: 'varchar', length: 17 })
  vin: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  trim: string;

  @Column({ name: 'model_year', type: 'int' })
  modelYear: number;

  @Column({ name: 'battery_kwh', type: 'int' })
  batteryKwh: number;

  @Column({ name: 'list_price', type: 'int' })
  listPrice: number;

  @Column({ name: 'equipment_specs', type: 'jsonb', default: () => "'[]'" })
  equipmentSpecs: string[];
}
