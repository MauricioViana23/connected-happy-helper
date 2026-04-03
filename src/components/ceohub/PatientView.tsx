import React, { useEffect, useState } from 'react';
import { Patient } from '@/types/ceohub';
import { EnergyRing } from '@/components/ceohub/EnergyRing';
import { DriverBar } from '@/components/ceohub/DriverBar';
import { Plus, RefreshCcw } from 'lucide-react';
import { getModeColor } from '@/constants/ceohub';
import { api } from '@/lib/api';

interface PatientViewProps {
  patientId: string;
  onLogDose: () => void;
}

export const PatientView: React.FC<PatientViewProps> = ({ patientId, onLogDose }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const data = await api.getPatient(patientId);
      if (data) setPatient(data);
    } catch (e) {
      console.error("Failed to fetch patient", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#3DDC97]"></div>
      </div>
    );
  }

  if (!patient) return <div className="text-white text-center mt-20">Patient not found</div>;

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
  const modeColor = getModeColor(patient.metrics.mode);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white pb-24 max-w-md mx-auto relative border-x border-zinc-900/30 overflow-hidden font-sans">

      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1F1F25]/20 to-transparent pointer-events-none" />

      <header className="px-8 pt-10 pb-4 flex flex-col items-center animate-fade-in relative z-10">
        <h2 className="text-[10px] font-medium text-zinc-500 tracking-[0.3em] mb-2 uppercase">Today</h2>
        <h1 className="text-sm font-light tracking-[0.1em] text-zinc-400">{today}</h1>
        <button onClick={fetchPatient} className="absolute right-8 top-12 text-zinc-600 hover:text-white transition-colors">
          <RefreshCcw size={14} />
        </button>
      </header>

      <section className="relative px-4 py-4 flex flex-col items-center animate-slide-up">
        <div className="rounded-full transition-all duration-1000">
          <EnergyRing energy={patient.metrics.energy} stress={patient.metrics.stress} />
        </div>

        <div className="mt-[-20px] z-10 flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Operational Mode</span>
          <div
            className="px-6 py-2 rounded-full border border-zinc-800 bg-[#141419]/80 backdrop-blur"
            style={{ borderColor: `${modeColor}40` }}
          >
            <span className="text-sm font-medium tracking-[0.15em] uppercase" style={{ color: modeColor }}>
              {patient.metrics.mode}
            </span>
          </div>
        </div>
      </section>

      <section className="px-8 mt-6 mb-10 flex justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-4 text-xs font-light text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3DDC97]"></div>
            <span>Capacity: <span className="text-white">{patient.metrics.energy}%</span></span>
          </div>
          <div className="w-px h-3 bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C5C]"></div>
            <span>Load: <span className="text-white">{patient.metrics.stress}%</span></span>
          </div>
        </div>
      </section>

      <section className="px-6 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="bg-[#141419] p-6 rounded-none border-l-[2px] relative overflow-hidden group" style={{ borderColor: modeColor }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h3 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-3 uppercase">Strategic Intelligence</h3>
          <p className="text-base font-light text-zinc-200 leading-relaxed tracking-wide">
            {patient.recommendation.action}
          </p>
        </div>
      </section>

      <section className="px-8 mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h4 className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] mb-6 uppercase">System Drivers</h4>
        <div className="space-y-4">
          {patient.drivers.map((driver, idx) => (
            <DriverBar key={idx} driver={driver} showDetail={false} />
          ))}
        </div>
      </section>

      <section className="pl-8 mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h4 className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] mb-5 uppercase">Context</h4>
        <div className="flex overflow-x-auto gap-4 pb-8 pr-6 no-scrollbar">
          {patient.context.map((ctx, idx) => (
            <div key={idx} className="min-w-[200px] bg-[#141419] p-5 border border-zinc-800/50 shadow-lg flex flex-col justify-between h-32 relative transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{ctx.title}</span>
                <div className={`w-1 h-1 rounded-full ${ctx.status === 'attention' ? 'bg-[#F5B942]' : 'bg-[#3DDC97]'}`} />
              </div>
              <div>
                <div className="text-sm font-light text-white mb-1 tracking-wide">{ctx.subtitle}</div>
                <div className="text-xs text-zinc-500 font-light">{ctx.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
        <button
          onClick={onLogDose}
          className="group h-14 w-14 bg-transparent border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/5 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300 text-zinc-300 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};
