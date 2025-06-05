import { AppDataSource } from '../data-source';
import { Calendar } from '../entities/Calendar';

export async function getAllCalendars() {
  const repo = AppDataSource.getRepository(Calendar);
  return repo.find();
}
