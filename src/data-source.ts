import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReservationMetric } from './entities/ReservationMetrics';
import { Calendar } from './entities/Calendar';
import { Tablet } from './entities/TabletEntity';
import { User } from './entities/User';
import dotenv from 'dotenv';


dotenv.config();

if (!process.env.DATABASE) {
  throw new Error("DATABASE ympäristömuuttuja puuttuu");
}

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE,
  entities: [ReservationMetric, Calendar, Tablet, User],
  synchronize: true,   // TODO: käytä vain kehityksessä
  logging: false,
});


export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}