import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API service as healthy with an ISO timestamp', () => {
    const controller = new HealthController();
    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('praxis-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
