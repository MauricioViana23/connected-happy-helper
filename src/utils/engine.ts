import { ExecutiveMode, DailyMetrics, CalculationDebug } from '@/types/ceohub';

export const calculateEMA = (current: number, previousEMA: number | undefined, span: number = 3): number => {
  if (previousEMA === undefined) return current;
  const k = 2 / (span + 1);
  return (current * k) + (previousEMA * (1 - k));
};

export const calculateSlope = (data: number[]): number => {
  if (data.length < 2) return 0;
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return parseFloat(slope.toFixed(2));
};

export const analyzeHistory = (history: DailyMetrics[], metric: keyof DailyMetrics, days: number = 28) => {
  const window = history.slice(-days).map(d => d[metric] as number);
  if (window.length === 0) return { mean: 0, sd: 0 };
  const mean = window.reduce((a, b) => a + b, 0) / window.length;
  const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
  return { mean, sd: Math.sqrt(variance) };
};

export const normalizeContinuous = (
  current: number,
  baseline: number,
  type: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER',
  sensitivity: number = 0.3
): number => {
  if (baseline === 0) return 50;
  const diff = (current - baseline) / baseline;
  let score = 90;
  if (type === 'HIGHER_IS_BETTER') {
    score = 90 + (diff * (100 / sensitivity));
  } else {
    score = 90 - (diff * (100 / sensitivity));
  }
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const calculateActivityLoad = (kcal: number): number => {
  const load = (kcal / 1500) * 10;
  return parseFloat(Math.min(10, load).toFixed(1));
};

interface EngineInput {
  hrv: number;
  rhr: number;
  sleep: number;
  activeCalories: number;
}

interface EngineOutput {
  energy: number;
  stress: number;
  mode: ExecutiveMode;
  debug: CalculationDebug;
}

export const processDailyBiometrics = (
  today: EngineInput,
  history: DailyMetrics[]
): EngineOutput => {
  const lastEntry = history[history.length - 1];
  const hrvEMA = calculateEMA(today.hrv, lastEntry?.debug?.hrvEMA, 3);
  const rhrEMA = calculateEMA(today.rhr, lastEntry?.debug?.rhrEMA, 3);
  const sleepEMA = calculateEMA(today.sleep, lastEntry?.debug?.sleepEMA, 3);

  const hrvStats = analyzeHistory(history, 'hrv', 28);
  const rhrStats = analyzeHistory(history, 'rhr', 28);
  const sleepStats = analyzeHistory(history, 'sleepDuration', 28);

  const hrvBase = hrvStats.mean || today.hrv;
  const rhrBase = rhrStats.mean || today.rhr;
  const sleepBase = sleepStats.mean || today.sleep;

  const hrvScore = normalizeContinuous(hrvEMA, hrvBase, 'HIGHER_IS_BETTER', 0.3);
  const rhrScore = normalizeContinuous(rhrEMA, rhrBase, 'LOWER_IS_BETTER', 0.15);
  const sleepScore = normalizeContinuous(sleepEMA, sleepBase, 'HIGHER_IS_BETTER', 0.2);

  const consistency = 80;
  const energy = Math.round(
    (0.45 * hrvScore) + (0.35 * sleepScore) + (0.15 * rhrScore) + (0.05 * consistency)
  );

  const hrvStressComp = Math.max(0, 100 - hrvScore);
  const rhrStressComp = Math.max(0, 100 - rhrScore);
  const sleepStressComp = Math.max(0, 100 - sleepScore);
  const activityStrain = calculateActivityLoad(today.activeCalories);
  const activityStressComp = activityStrain * 10;

  const stress = Math.round(
    (0.35 * hrvStressComp) + (0.35 * rhrStressComp) + (0.20 * sleepStressComp) + (0.10 * activityStressComp)
  );

  let mode = ExecutiveMode.NORMAL;
  if (energy >= 70) mode = stress < 50 ? ExecutiveMode.PEAK : ExecutiveMode.TACTICAL;
  else if (energy >= 40) mode = stress < 50 ? ExecutiveMode.NORMAL : ExecutiveMode.SELECTIVE;
  else mode = stress < 50 ? ExecutiveMode.LIGHT : ExecutiveMode.RECOVERY;

  const energyTrend = history.map(h => h.energy);
  const trendSlope7d = calculateSlope(energyTrend.slice(-7));
  const hrvZ = hrvStats.sd > 0 ? (today.hrv - hrvBase) / hrvStats.sd : 0;
  const rhrZ = rhrStats.sd > 0 ? (today.rhr - rhrBase) / rhrStats.sd : 0;

  return {
    energy: Math.min(100, Math.max(0, energy)),
    stress: Math.min(100, Math.max(0, stress)),
    mode,
    debug: {
      hrvEMA: parseFloat(hrvEMA.toFixed(1)),
      rhrEMA: parseFloat(rhrEMA.toFixed(1)),
      sleepEMA: parseFloat(sleepEMA.toFixed(1)),
      hrvBaseline: parseFloat(hrvBase.toFixed(1)),
      rhrBaseline: parseFloat(rhrBase.toFixed(1)),
      hrvZScore: parseFloat(hrvZ.toFixed(2)),
      rhrZScore: parseFloat(rhrZ.toFixed(2)),
      trendSlope7d,
      consistencyScore: consistency
    }
  };
};

export const simulateScenario = (scenario: 'HIGH_CAPACITY_HIGH_LOAD' | 'LOW_CAPACITY' | 'SLEEP_DEBT' | 'RHR_SPIKE'): EngineOutput => {
  const dummyHistory: DailyMetrics[] = Array(30).fill(0).map(() => ({
    date: '2024-01-01',
    energy: 80, stress: 20, mode: ExecutiveMode.PEAK,
    sleepDuration: 7.5, hrv: 50, rhr: 55, activityStrain: 5, activeCalories: 500,
    weight: 70, weightChange7d: 0, lastMedicationDate: '2024-01-01',
    debug: { hrvEMA: 50, rhrEMA: 55, sleepEMA: 7.5, hrvBaseline: 50, rhrBaseline: 55, hrvZScore: 0, rhrZScore: 0, trendSlope7d: 0, consistencyScore: 80 }
  }));

  let input: EngineInput = { hrv: 50, rhr: 55, sleep: 7.5, activeCalories: 500 };

  switch (scenario) {
    case 'HIGH_CAPACITY_HIGH_LOAD':
      input = { hrv: 55, rhr: 65, sleep: 7.5, activeCalories: 1400 };
      break;
    case 'LOW_CAPACITY':
      input = { hrv: 30, rhr: 65, sleep: 5.0, activeCalories: 200 };
      break;
    case 'SLEEP_DEBT':
      dummyHistory.forEach(d => d.sleepDuration = 5.5);
      input = { hrv: 45, rhr: 58, sleep: 5.0, activeCalories: 400 };
      break;
    case 'RHR_SPIKE':
      input = { hrv: 48, rhr: 70, sleep: 7.0, activeCalories: 300 };
      break;
  }

  return processDailyBiometrics(input, dummyHistory);
};
