import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import * as databaseModule from '../src/config/database';

describe('Endpoint Health Check (GET /api/v1/health)', () => {
  it('debe responder con estado UP y datos del sistema cuando la base de datos está conectada', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseConnection').mockResolvedValueOnce({
      ok: true,
      latencyMs: 4,
    });

    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('UP');
    expect(res.body.database.connected).toBe(true);
    expect(res.body.system.nodeVersion).toBeDefined();
  });

  it('debe responder con estado DOWN y código 503 cuando la base de datos no responde', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseConnection').mockResolvedValueOnce({
      ok: false,
      latencyMs: 120,
      error: 'ECONNREFUSED 192.168.56.10:3306',
    });

    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.status).toBe('DOWN');
    expect(res.body.database.connected).toBe(false);
  });
});
