import { DataSource } from 'typeorm';
import { Offer } from '../../domain/entities/Offer';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '12345678',
  database: process.env.DATABASE_NAME || 'affiliate_db',
  synchronize: true, // Chỉ dùng trong development
  logging: process.env.NODE_ENV === 'development',
  entities: [Offer],
  subscribers: [],
  migrations: [],
}); 