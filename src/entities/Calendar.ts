import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'calendars' })
export class Calendar {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  alias!: string;

  @Column()
  calendarId!: string;
}
