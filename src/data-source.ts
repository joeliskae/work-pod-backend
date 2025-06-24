import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReservationMetric } from './entities/ReservationMetrics';
import { Calendar } from './entities/Calendar';
import { Tablet } from './entities/TabletEntity';
import { User } from './entities/User';
import dotenv from 'dotenv';


// import {open} from 'sqlite';
// import sqlite3 from "sqlite3";

dotenv.config();

if (!process.env.DATABASE) {
  throw new Error("DATABASE ympäristömuuttuja puuttuu");
}

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE,
  // database: '/app/data/usage.sqlite',
  entities: [ReservationMetric, Calendar, Tablet, User],
  synchronize: true,   // TODO: käytä vain kehityksessä
  logging: false,
});

// async function showDbContents() {
//   const db = await open({
//     filename: "/app/data/usage.sqlite", // Oikea nimi ja polku
//     driver: sqlite3.Database,
//   });

//   const tables = await db.all(
//     "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
//   );

//   if (tables.length === 0) {
//     console.log("⚠️  Tietokannassa ei ole käyttäjän tauluja.");
//     return;
//   }

//   for (const { name } of tables) {
//     console.log(`\n📄 Taulu: \x1b[1m${name}\x1b[0m`);

//     const rows = await db.all(
//         `SELECT * FROM (
//         SELECT * FROM ${name} ORDER BY id DESC LIMIT 10
//         ) sub ORDER BY id ASC`
//     );
    
//     if (rows.length === 0) {
//       console.log("   (ei rivejä)");
//     } else {
//       console.table(rows);
//     }
//   }

//   await db.close();
// }

export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    // console.log('✅ Using SQLite DB at:', AppDataSource.options.database);
    // console.log('✅ DB initialized');
    // const users = await AppDataSource.getRepository(User).find();
    // console.log('👤 Users:', users);

    // showDbContents();
  }
}