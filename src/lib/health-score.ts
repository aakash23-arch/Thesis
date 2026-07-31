export type HealthStatus = 'healthy' | 'caution' | 'broken';

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  healthy: '#1A6B4A',
  caution: '#C8922A',
  broken: '#B83A2E',
};

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'caution';
  return 'broken';
}

export function getHealthColor(score: number): string {
  return HEALTH_COLORS[getHealthStatus(score)];
}
