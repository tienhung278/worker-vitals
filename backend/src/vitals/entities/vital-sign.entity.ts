import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vital_signs' })
@Index('idx_vital_worker_timestamp', ['workerId', 'timestamp'])
export class VitalSign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  workerId!: string;

  @Column({ type: 'int' })
  heartRate!: number;

  @Column({ type: 'float' })
  temperature!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp!: Date;
}
