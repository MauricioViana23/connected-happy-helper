import { StatusLevel, ExecutiveMode } from '@/types/ceohub';

export const getStatusLevel = (energy: number): StatusLevel => {
  if (energy >= 70) return StatusLevel.READY;
  if (energy >= 40) return StatusLevel.SELECTIVE;
  return StatusLevel.RECOVERY;
};

export const getColorForStatus = (status: StatusLevel): string => {
  switch (status) {
    case StatusLevel.READY: return '#3DDC97';
    case StatusLevel.SELECTIVE: return '#F5B942';
    case StatusLevel.RECOVERY: return '#FF5C5C';
    default: return '#71717a';
  }
};

export const getModeColor = (mode: ExecutiveMode): string => {
  switch (mode) {
    case ExecutiveMode.PEAK: return '#3DDC97';
    case ExecutiveMode.TACTICAL: return '#F5B942';
    case ExecutiveMode.NORMAL: return '#3DDC97';
    case ExecutiveMode.SELECTIVE: return '#F5B942';
    case ExecutiveMode.LIGHT: return '#A1A1AA';
    case ExecutiveMode.RECOVERY: return '#FF5C5C';
  }
};
