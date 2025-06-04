import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ReservationMetric } from './entities/ReservationMetrics';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './usage.sqlite',
  entities: [ReservationMetric],
  synchronize: true,   // TODO: käytä vain kehityksessä
  logging: false,
});
