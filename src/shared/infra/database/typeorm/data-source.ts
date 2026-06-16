import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getRequiredEnv('DATABASE_HOST'),
  port: Number(getRequiredEnv('DATABASE_PORT')),
  username: getRequiredEnv('DATABASE_USER'),
  password: getRequiredEnv('DATABASE_PASSWORD'),
  database: getRequiredEnv('DATABASE_NAME'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/shared/infra/database/typeorm/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
