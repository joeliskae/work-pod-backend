import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Edustaa käyttäjää järjestelmässä.
 * Sisältää käyttäjän nimen, sähköpostin (uniikki) ja roolin.
 */
@Entity()
export class User {
  /** Yksilöllinen UUID-tunniste käyttäjälle */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /** Käyttäjän koko nimi */
  @Column()
  name!: string;

  /** Käyttäjän sähköpostiosoite (uniikki, toimii usein kirjautumistunnuksena) */
  @Column({ unique: true })
  email!: string;

  /** Käyttäjän rooli järjestelmässä, joka määrittää käyttöoikeudet */
  @Column()
  role!: "superadmin" | "admin" | "user";
}
