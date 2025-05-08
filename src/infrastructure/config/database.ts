import { DataSource } from 'typeorm';
import { Offer } from '../../domain/entities/Offer';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '12345678',
  database: 'affiliate_db',
  synchronize: true, // Chỉ dùng trong development
  logging: false,
  entities: [Offer],
  subscribers: [],
  migrations: [],
}); 