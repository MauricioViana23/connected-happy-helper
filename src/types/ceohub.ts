export enum StatusLevel {
  READY = 'READY',
  SELECTIVE = 'SELECTIVE',
  RECOVERY = 'RECOVERY',
}

export enum ExecutiveMode {
  PEAK = 'PEAK PERFORMANCE',
  TACTICAL = 'TACTICAL EXECUTION',
  NORMAL = 'SUSTAINED OUTPUT',
  SELECTIVE = 'SELECTIVE ACTION',
  LIGHT = 'ACTIVE RECOVERY',
  RECOVERY = 'DEEP RECOVERY',
}

export interface MetricDriver {
  name: string;
  value: number;
  raw: string;
  baselineDiff: string;
  status: 'good' | 'average' | 'poor';
}

export interface ContextCardData {
  title: string;
  subtitle: string;
  detail: string;
  status: 'on-track' | 'attention' | 'neutral';
}

export interface HealthBaselines {
  hrv: number;
  rhr: number;
  sleep: number;
}

export interface RawHealthInput {
  sleepDuration: number;
  hrv: number;
  rhr: number;
  activeCalories: number;
  weight?: number;
}

export interface HealthKitPayload {
  hrv: { value: number; startDate: string }[];
  rhr: { value: number; startDate: string }[];
  sleep: { value: 'ASLEEP' | 'INBED' | 'AWAKE'; startDate: string; endDate: string }[];
  activeEnergy: { value: number; startDate: string; unit: 'kcal' }[];
  weight?: { value: number; startDate: string; unit: 'kg' }[];
}

export interface CalculationDebug {
  hrvEMA: number;
  rhrEMA: number;
  sleepEMA: number;
  hrvBaseline: number;
  rhrBaseline: number;
  hrvZScore: number;
  rhrZScore: number;
  trendSlope7d: number;
  consistencyScore: number;
}

export interface DailyMetrics {
  energy: number;
  stress: number;
  mode: ExecutiveMode;
  sleepDuration: number;
  hrv: number;
  rhr: number;
  activityStrain: number;
  activeCalories: number;
  weight: number;
  weightChange7d: number;
  lastMedicationDate: string;
  date: string;
  debug?: CalculationDebug;
}

export interface Patient {
  id: string;
  name: string;
  role: string;
  metrics: DailyMetrics;
  baselines: HealthBaselines;
  drivers: MetricDriver[];
  context: ContextCardData[];
  weeklyEnergy: number[];
  adherence: number;
  history: DailyMetrics[];
  recommendation: {
    title: string;
    action: string;
  };
}
