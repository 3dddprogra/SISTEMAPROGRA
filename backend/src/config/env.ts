import dotenv from 'dotenv';
import path from 'path';

// Cargar variables desde config.env en la raíz del proyecto o desde .env local
dotenv.config({ path: path.resolve(__dirname, '../../../config.env') });
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}. Copia .env.example a config.env y complétala.`);
  return v;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.BACKEND_PORT || '3000', 10),
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'foodtech_user',
  DB_PASSWORD: required('DB_PASSWORD'),
  DB_NAME: process.env.DB_NAME || 'unicen_app',
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
