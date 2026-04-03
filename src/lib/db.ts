import { Patient, ExecutiveMode, RawHealthInput, DailyMetrics, HealthBaselines } from '@/types/ceohub';
import { processDailyBiometrics, normalizeContinuous, calculateActivityLoad } from '@/utils/engine';

let PATIENTS_DB: Record<string, Patient> = {};

const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const generatePatientHistory = (
  id: string,
  name: string,
  role: string,
  baselines: HealthBaselines,
  profile: 'CRITICAL' | 'PEAK' | 'TACTICAL'
): Patient => {
  const history: DailyMetrics[] = [];
  const days = 30;

  for (let i = days; i >= 0; i--) {
    let dailyHRV = baselines.hrv * getRandom(0.9, 1.1);
    let dailyRHR = baselines.rhr * getRandom(0.95, 1.05);
    let dailySleep = baselines.sleep * getRandom(0.9, 1.1);
    let activeCalories = 500 * getRandom(0.8, 1.2);

    if (profile === 'CRITICAL') {
      dailyHRV *= 0.7;
      dailyRHR *= 1.15;
      dailySleep *= 0.8;
      activeCalories = 300;
    } else if (profile === 'TACTICAL') {
      activeCalories = 1200;
      dailyRHR *= 1.05;
    }

    if (i === 0) {
      if (profile === 'CRITICAL') { dailyHRV = 22; dailyRHR = 68; dailySleep = 5.5; activeCalories = 800; }
      if (profile === 'PEAK') { dailyHRV = 65; dailyRHR = 52; dailySleep = 7.8; activeCalories = 450; }
      if (profile === 'TACTICAL') { dailyHRV = 50; dailyRHR = 62; dailySleep = 7.0; activeCalories = 1350; }
    }

    const engineInput = { hrv: dailyHRV, rhr: dailyRHR, sleep: dailySleep, activeCalories };
    const result = processDailyBiometrics(engineInput, history);

    history.push({
      date: generateDate(i),
      energy: result.energy,
      stress: result.stress,
      mode: result.mode,
      debug: result.debug,
      sleepDuration: parseFloat(dailySleep.toFixed(1)),
      hrv: Math.round(dailyHRV),
      rhr: Math.round(dailyRHR),
      activeCalories: Math.round(activeCalories),
      activityStrain: calculateActivityLoad(activeCalories),
      weight: profile === 'PEAK' ? 62 : profile === 'CRITICAL' ? 84 : 90,
      weightChange7d: profile === 'PEAK' ? -0.8 : -0.2,
      lastMedicationDate: generateDate(profile === 'CRITICAL' ? 3 : profile === 'PEAK' ? 0 : 5)
    });
  }

  const todayMetrics = history[history.length - 1];

  const drivers = [
    {
      name: 'Sleep Quality',
      value: normalizeContinuous(todayMetrics.sleepDuration, baselines.sleep, 'HIGHER_IS_BETTER'),
      raw: `${todayMetrics.sleepDuration}h`,
      baselineDiff: todayMetrics.debug?.sleepEMA ? `${((todayMetrics.debug.sleepEMA - baselines.sleep)/baselines.sleep * 100).toFixed(0)}%` : '0%',
      status: normalizeContinuous(todayMetrics.sleepDuration, baselines.sleep, 'HIGHER_IS_BETTER') > 80 ? 'good' : 'poor'
    },
    {
      name: 'HRV Status',
      value: normalizeContinuous(todayMetrics.hrv, baselines.hrv, 'HIGHER_IS_BETTER'),
      raw: `${todayMetrics.hrv}ms`,
      baselineDiff: todayMetrics.debug?.hrvZScore.toString() + ' σ',
      status: normalizeContinuous(todayMetrics.hrv, baselines.hrv, 'HIGHER_IS_BETTER') > 80 ? 'good' : 'poor'
    },
    {
      name: 'Resting HR',
      value: normalizeContinuous(todayMetrics.rhr, baselines.rhr, 'LOWER_IS_BETTER'),
      raw: `${todayMetrics.rhr}bpm`,
      baselineDiff: todayMetrics.debug?.rhrZScore.toString() + ' σ',
      status: normalizeContinuous(todayMetrics.rhr, baselines.rhr, 'LOWER_IS_BETTER') > 80 ? 'good' : 'average'
    },
    {
      name: 'Activity Load',
      value: todayMetrics.activityStrain * 10,
      raw: `${todayMetrics.activeCalories} kcal`,
      baselineDiff: 'N/A',
      status: todayMetrics.activityStrain < 8 ? 'good' : 'poor'
    },
  ] as any;

  let recTitle = "";
  let recAction = "";
  const mode = todayMetrics.mode;
  if (mode === ExecutiveMode.PEAK) {
    recTitle = "Peak Performance";
    recAction = "Physiological capacity optimal (High HRV, Stable RHR). Green light for high-impact negotiations.";
  } else if (mode === ExecutiveMode.TACTICAL) {
    recTitle = "Tactical Execution";
    recAction = "High capacity but system load is elevated. Prioritize execution over new strategy. Avoid late hours.";
  } else if (mode === ExecutiveMode.RECOVERY) {
    recTitle = "Deep Recovery";
    recAction = "Multiple markers suppressed (HRV -2σ). Defer critical decisions. Protocol: Sleep + Hydration.";
  } else if (mode === ExecutiveMode.SELECTIVE) {
    recTitle = "Selective Action";
    recAction = "Moderate capacity. Limit meetings to 45 mins. Delegate operational overhead.";
  } else {
    recTitle = "Sustained Output";
    recAction = "Metrics within standard deviation. Maintain rhythm. Good day for routine operational review.";
  }

  return {
    id, name, role,
    metrics: todayMetrics,
    baselines,
    drivers,
    context: [
      { title: 'Medication', subtitle: 'Mounjaro', detail: `Last dose: ${profile === 'PEAK' ? 'Today' : '3 days ago'}`, status: profile === 'PEAK' ? 'on-track' : 'neutral' },
      { title: 'Weight', subtitle: 'Trending', detail: '-0.5kg (7d)', status: 'on-track' }
    ],
    weeklyEnergy: history.slice(-7).map(d => d.energy),
    adherence: profile === 'PEAK' ? 98 : profile === 'CRITICAL' ? 82 : 65,
    history,
    recommendation: { title: recTitle, action: recAction }
  };
};

const initDB = () => {
  const p1 = generatePatientHistory('p1', 'Alexander V.', 'CEO, FinTech Global', { hrv: 45, rhr: 58, sleep: 7.0 }, 'CRITICAL');
  const p2 = generatePatientHistory('p2', 'Sarah J.', 'Founder, Retail AI', { hrv: 55, rhr: 54, sleep: 7.5 }, 'PEAK');
  const p3 = generatePatientHistory('p3', 'Marcus L.', 'Partner, Venture Capital', { hrv: 50, rhr: 55, sleep: 7.0 }, 'TACTICAL');
  PATIENTS_DB = { p1, p2, p3 };
};

initDB();

export const db_getPatient = (id: string): Patient | undefined => {
  return PATIENTS_DB[id];
};

export const db_getAllPatients = (): Patient[] => {
  return Object.values(PATIENTS_DB);
};

export const db_ingestData = (id: string, input: RawHealthInput): Patient => {
  const patient = PATIENTS_DB[id];
  if (!patient) throw new Error("Patient not found");

  const engineResult = processDailyBiometrics({
    hrv: input.hrv, rhr: input.rhr, sleep: input.sleepDuration, activeCalories: input.activeCalories
  }, patient.history);

  const newEntry: DailyMetrics = {
    date: new Date().toISOString().split('T')[0],
    energy: engineResult.energy,
    stress: engineResult.stress,
    mode: engineResult.mode,
    debug: engineResult.debug,
    sleepDuration: input.sleepDuration,
    hrv: input.hrv,
    rhr: input.rhr,
    activeCalories: input.activeCalories,
    activityStrain: calculateActivityLoad(input.activeCalories),
    weight: input.weight || patient.metrics.weight,
    weightChange7d: patient.metrics.weightChange7d,
    lastMedicationDate: patient.metrics.lastMedicationDate
  };

  patient.history.push(newEntry);
  patient.metrics = newEntry;
  patient.weeklyEnergy = patient.history.slice(-7).map(d => d.energy);

  patient.drivers = [
    {
      name: 'Sleep Quality',
      value: normalizeContinuous(input.sleepDuration, patient.baselines.sleep, 'HIGHER_IS_BETTER'),
      raw: `${input.sleepDuration}h`,
      baselineDiff: engineResult.debug?.sleepEMA ? `${((engineResult.debug.sleepEMA - patient.baselines.sleep)/patient.baselines.sleep * 100).toFixed(0)}%` : '0%',
      status: normalizeContinuous(input.sleepDuration, patient.baselines.sleep, 'HIGHER_IS_BETTER') > 80 ? 'good' : 'poor'
    },
    {
      name: 'HRV Status',
      value: normalizeContinuous(input.hrv, patient.baselines.hrv, 'HIGHER_IS_BETTER'),
      raw: `${input.hrv}ms`,
      baselineDiff: engineResult.debug?.hrvZScore.toString() + ' σ',
      status: normalizeContinuous(input.hrv, patient.baselines.hrv, 'HIGHER_IS_BETTER') > 80 ? 'good' : 'poor'
    },
    {
      name: 'Resting HR',
      value: normalizeContinuous(input.rhr, patient.baselines.rhr, 'LOWER_IS_BETTER'),
      raw: `${input.rhr}bpm`,
      baselineDiff: engineResult.debug?.rhrZScore.toString() + ' σ',
      status: normalizeContinuous(input.rhr, patient.baselines.rhr, 'LOWER_IS_BETTER') > 80 ? 'good' : 'average'
    },
    {
      name: 'Activity Load',
      value: calculateActivityLoad(input.activeCalories) * 10,
      raw: `${input.activeCalories} kcal`,
      baselineDiff: 'N/A',
      status: input.activeCalories < 1000 ? 'good' : 'poor'
    },
  ] as any;

  return patient;
};
