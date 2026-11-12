import http from 'http';
import { app } from './app';
import { ENV } from './config/env';
import { initSocketIO } from './sockets/socketManager';
import { checkDatabaseConnection } from './config/database';
import { logger } from './utils/logger';

const server = http.createServer(app);

// Inicializar WebSockets con Socket.io
initSocketIO(server);

// Iniciar servidor HTTP
server.listen(ENV.PORT, async () => {
  logger.info(`=======================================================`);
  logger.info(`🍽️  FOODTECH BACKEND INICIADO EN PUERTO ${ENV.PORT}`);
  logger.info(`   Ambiente: ${ENV.NODE_ENV}`);
  logger.info(`   API Endpoint: http://localhost:${ENV.PORT}/api/v1`);
  logger.info(`   Healthcheck: http://localhost:${ENV.PORT}/api/v1/health`);
  logger.info(`=======================================================`);

  // Verificar conectividad con MySQL
  try {
    const dbCheck = await checkDatabaseConnection();
    if (dbCheck.ok) {
      logger.info(`✅ Conexión con base de datos MySQL 8 ('${ENV.DB_NAME}') establecida (${dbCheck.latencyMs}ms).`);
    } else {
      logger.warn(`⚠️ MySQL no disponible de inmediato (${dbCheck.error}). El servidor sigue activo esperando conexión.`);
    }
  } catch (err) {
    logger.warn('⚠️ Error al verificar base de datos:', err);
  }
});

// Manejo de señales de terminación para apagado limpio (PM2 / Systemd)
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida. Cerrando servidor FoodTech...');
  server.close(() => {
    logger.info('Servidor HTTP cerrado exitosamente.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida (Ctrl+C). Apagando servidor...');
  server.close(() => {
    process.exit(0);
  });
});
