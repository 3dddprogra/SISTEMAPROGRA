import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';

export const healthController = {
  async checkHealth(_req: Request, res: Response): Promise<void> {
    const dbStatus = await checkDatabaseConnection();

    const isHealthy = dbStatus.ok;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: isHealthy,
      status: isHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: dbStatus.ok,
        latencyMs: dbStatus.latencyMs,
        error: dbStatus.error || null,
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        environment: process.env.NODE_ENV || 'development',
      },
    });
  },
};
