import dotenv from 'dotenv';
import path from 'path';

// Cargar variables desde config.env en la raíz del proyecto o desde .env local
dotenv.config({ path: path.resolve(__dirname, '../../../config.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.BACKEND_PORT || '3000', 10),
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'foodtech_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'FoodTech2026!SecureRootKey',
  DB_NAME: process.env.DB_NAME || 'unicen_app',
  JWT_SECRET: process.env.JWT_SECRET || 'unicen_foodtech_jwt_secret_token_key_cochabamba_2026_innovacion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
