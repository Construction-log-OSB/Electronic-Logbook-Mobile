/**
 * Incident severity → maritime palette mapping.
 *
 * Centralised so list cards, detail views, and filter chips stay consistent.
 */

import { DARK_COLORS, LIGHT_COLORS, type Palette } from './palette';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
};

export function incidentSeverityColor(
  severity: IncidentSeverity,
  palette: Palette
): string {
  switch (severity) {
    case 'LOW':
      return palette.success;
    case 'MEDIUM':
      return palette.warning;
    case 'HIGH':
      return palette.warning;
    case 'CRITICAL':
      return palette.danger;
  }
}

export function incidentSeveritySurface(
  severity: IncidentSeverity,
  palette: Palette
): string {
  switch (severity) {
    case 'LOW':
      return palette.successSurface;
    case 'MEDIUM':
      return palette.warningSurface;
    case 'HIGH':
      return palette.warningSurface;
    case 'CRITICAL':
      return palette.dangerSurface;
  }
}

/** Backwards-compat exports used by domain/types.ts (light theme defaults). */
export const INCIDENT_SEVERITY_COLORS_LEGACY: Record<IncidentSeverity, string> = {
  LOW: LIGHT_COLORS.success,
  MEDIUM: LIGHT_COLORS.warning,
  HIGH: LIGHT_COLORS.warning,
  CRITICAL: LIGHT_COLORS.danger,
};

export const INCIDENT_SEVERITY_COLORS_DARK_LEGACY: Record<IncidentSeverity, string> = {
  LOW: DARK_COLORS.success,
  MEDIUM: DARK_COLORS.warning,
  HIGH: DARK_COLORS.warning,
  CRITICAL: DARK_COLORS.danger,
};
