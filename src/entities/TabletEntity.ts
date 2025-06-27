import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Edustaa tablet-laitetta tietokannassa.
 * Sisältää laitteen nimen, sijainnin, siihen liitetyn kalenterin, IP-osoitteen ja värin.
 */
@Entity()
export class Tablet {
  /** Yksilöivä UUID-tunniste tabletille */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Tabletin nimi (esim. laiteen nimi tai tunniste) */
  @Column()
  name!: string;

  /** Tabletin fyysinen tai looginen sijainti */
  @Column()
  location!: string;

  /** Kalenterin alias tai ID, johon tämä tabletti on liitetty, esim: C238-1 */
  @Column()
  calendarId!: string;

  /** Tabletin IP-osoite, jota käytetään autentikointiin tai verkkoasetuksiin */
  @Column()
  ipAddress!: string;

  /** UI:ssa käytettävä väri tabletin tunnistamiseen (oletuksena 'red') */
  @Column({ default: 'red' })
  color!: string;
}
