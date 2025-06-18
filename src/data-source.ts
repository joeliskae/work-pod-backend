import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReservationMetric } from './entities/ReservationMetrics';
import { Calendar } from './entities/Calendar';
import { Tablet } from './entities/TabletEntity';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: '/app/data/usage.sqlite',
  entities: [ReservationMetric, Calendar, Tablet, User],
  synchronize: true,   // TODO: käytä vain kehityksessä
  logging: false,
});

export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}