import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Tallentaa varausmuutosten metrikatietoja.
 * Vastaa tietokannan `reservation_metrics`-taulua.
 */
@Entity({ name: 'reservation_metrics' }) // vastaa olemassa olevaa taulua
export class ReservationMetric {
  /** Automaattisesti generoitu yksilöivä tunniste */
  @PrimaryGeneratedColumn()
  id!: number;

  /** Tapahtuman tyyppi: varauksen luonti ('created') tai poisto ('deleted') */
  @Column()
  action!: 'created' | 'deleted';

  /** Kalenterin alias tai ID, johon tapahtuma liittyy (sarakkeen nimi 'calendar_id') */
  @Column({ name: 'calendar_id' })
  calendarId!: string;

  /** Tapahtuman aloitusaika ISO 8601 -merkkijonona (sarakkeen nimi 'event_start') */
  @Column({ name: 'event_start' })
  eventStart!: string;  // tallennetaan ISO date stringinä

  /** Tapahtuman lopetusaika ISO 8601 -merkkijonona (sarakkeen nimi 'event_end') */
  @Column({ name: 'event_end' })
  eventEnd!: string;    // tallennetaan ISO date stringinä
}
