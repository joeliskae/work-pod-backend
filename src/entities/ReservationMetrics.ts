import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'reservation_metrics' }) // vastaa olemassa olevaa taulua
export class ReservationMetric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: 'created' | 'deleted';

  @Column({ name: 'calendar_id' })
  calendarId!: string;

  @Column({ name: 'event_start' })
  eventStart!: string;  // tallennetaan ISO date stringinä

  @Column({ name: 'event_end' })
  eventEnd!: string;    // tallennetaan ISO date stringinä
}
