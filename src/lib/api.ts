import { Patient, RawHealthInput, HealthKitPayload } from '@/types/ceohub';
import { db_getAllPatients, db_getPatient, db_ingestData } from '@/lib/db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const validateSchema = (payload: any): payload is HealthKitPayload => {
  if (!payload || typeof payload !== 'object') throw new ValidationError("Payload must be an object");
  if (!Array.isArray(payload.hrv)) throw new ValidationError("Missing or invalid 'hrv' array");
  if (!Array.isArray(payload.rhr)) throw new ValidationError("Missing or invalid 'rhr' array");
  if (!Array.isArray(payload.sleep)) throw new ValidationError("Missing or invalid 'sleep' array");
  if (!Array.isArray(payload.activeEnergy)) throw new ValidationError("Missing or invalid 'activeEnergy' array");
  if (payload.hrv.length > 0 && typeof payload.hrv[0].value !== 'number') throw new ValidationError("Invalid HRV sample structure");
  if (payload.sleep.length > 0 && !['ASLEEP', 'INBED', 'AWAKE'].includes(payload.sleep[0].value)) throw new ValidationError("Invalid Sleep value enum");
  return true;
};

const transformHealthKitData = (payload: HealthKitPayload): RawHealthInput => {
  const totalSleepSeconds = payload.sleep.reduce((acc, sample) => {
    if (sample.value === 'ASLEEP') {
      const start = new Date(sample.startDate).getTime();
      const end = new Date(sample.endDate).getTime();
      return acc + (end - start) / 1000;
    }
    return acc;
  }, 0);
  const sleepDuration = parseFloat((totalSleepSeconds / 3600).toFixed(1));

  const avgHrv = payload.hrv.length > 0
    ? Math.round(payload.hrv.reduce((sum, s) => sum + s.value, 0) / payload.hrv.length)
    : 0;

  const avgRhr = payload.rhr.length > 0
    ? Math.round(payload.rhr.reduce((sum, s) => sum + s.value, 0) / payload.rhr.length)
    : 0;

  const totalKcal = Math.round(payload.activeEnergy.reduce((sum, s) => sum + s.value, 0));

  const weight = payload.weight && payload.weight.length > 0
    ? payload.weight[payload.weight.length - 1].value
    : undefined;

  return { sleepDuration, hrv: avgHrv, rhr: avgRhr, activeCalories: totalKcal, weight };
};

export const api = {
  getAllPatients: async (): Promise<Patient[]> => {
    await delay(500);
    return db_getAllPatients();
  },

  getPatient: async (id: string): Promise<Patient | undefined> => {
    await delay(300);
    return db_getPatient(id);
  },

  ingestData: async (id: string, payload: any): Promise<Patient> => {
    await delay(800);
    try {
      validateSchema(payload);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Schema Validation Failed: ${error.message}`);
      }
      throw new Error("Unknown Validation Error");
    }
    const processedData = transformHealthKitData(payload as HealthKitPayload);
    return db_ingestData(id, processedData);
  }
};
