import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { EditableField } from '../../common/editable-field.enum.js';
import { IssueStatus } from '../../common/issue-status.enum.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';

@Entity('issue')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'field_name', type: 'enum', enum: EditableField })
  fieldName: EditableField;

  @Column({ name: 'old_value', type: 'varchar', nullable: true })
  oldValue: string | null;

  @Column({ name: 'new_value' })
  newValue: string;

  @Column({ name: 'seller_message' })
  sellerMessage: string;

  @Column({ type: 'enum', enum: IssueStatus, default: IssueStatus.Pending })
  status: IssueStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;
}
