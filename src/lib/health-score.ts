export type HealthStatus = 'healthy' | 'caution' | 'broken';

/** Fill colours -- gauge bands, chart series, status dots. The spec palette, verbatim. */
export const HEALTH_COLORS: Record<HealthStatus, string> = {
  healthy: '#1A6B4A',
  caution: '#C8922A',
  broken: '#B83A2E',
};

/**
 * Text colours for the same signals on light surfaces. Identical to HEALTH_COLORS
 * where the fill already clears WCAG AA; darkened where it does not (#C8922A is
 * only 2.76:1 on white).
 */
export const HEALTH_TEXT_COLORS: Record<HealthStatus, string> = {
  healthy: '#1A6B4A',
  caution: '#8A6318',
  broken: '#B83A2E',
};

/** Tinted backgrounds the text colours sit on. */
export const HEALTH_TINT_COLORS: Record<HealthStatus, string> = {
  healthy: '#E8F5EE',
  caution: '#FAF2E1',
  broken: '#FBEBE9',
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  caution: 'Caution',
  broken: 'Broken',
};

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'caution';
  return 'broken';
}

export function getHealthColor(score: number): string {
  return HEALTH_COLORS[getHealthStatus(score)];
}

export function getHealthTextColor(score: number): string {
  return HEALTH_TEXT_COLORS[getHealthStatus(score)];
}

/** Human-readable band name, for gauge captions and screen-reader descriptions. */
export function getHealthLabel(score: number): string {
  return HEALTH_LABELS[getHealthStatus(score)];
}
