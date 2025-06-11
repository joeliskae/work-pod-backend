import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReservationMetric } from './entities/ReservationMetrics';
import { Calendar } from './entities/Calendar';
import { Tablet } from './entities/TabletEntity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './usage.sqlite',
  entities: [ReservationMetric, Calendar, Tablet],
  synchronize: true,   // TODO: käytä vain kehityksessä
  logging: false,
});

export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}