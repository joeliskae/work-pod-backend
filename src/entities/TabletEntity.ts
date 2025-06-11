import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tablet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column()
  calendarId!: string;

  @Column()
  ipAddress!: string;

}
