import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Edustaa kalenteria tietokannassa.
 * Sisältää alias-nimen, Google Calendar -ID:n, aktiivisuustilan ja värin.
 */
@Entity({ name: "calendars" })
export class Calendar {
  /** Automaattisesti generoitu yksilöivä tunniste */
  @PrimaryGeneratedColumn()
  id!: number;

  /** Kalenterin yksilöllinen alias, esim. "C238-1" */
  @Column({ unique: true })
  alias!: string;

  /** Google Calendarin tunniste (calendarId), jota käytetään API-kutsuissa */
  @Column()
  calendarId!: string;

  /** Onko kalenteri aktiivisena käytössä (oletuksena false) */
  @Column({ default: false })
  isActive!: boolean;

  /** Väri, jolla kalenteri esitetään UI:ssa (oletus "blue") */
  @Column({ default: 'blue' })
  color!: string;
}
