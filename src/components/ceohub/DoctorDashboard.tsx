import React, { useEffect, useState } from 'react';
import { getStatusLevel, getModeColor } from '@/constants/ceohub';
import { Patient, StatusLevel, ExecutiveMode } from '@/types/ceohub';
import { EnergyRing } from '@/components/ceohub/EnergyRing';
import { Search, Bell, Filter, ChevronRight, X, MessageSquare, Calendar, Activity, TrendingUp } from 'lucide-react';
import { DriverBar } from '@/components/ceohub/DriverBar';
import { api } from '@/lib/api';

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.getAllPatients();
        setPatients(data);
      } catch (e) {
        console.error("Failed to load patients", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sorting
  const sortedPatients = [...patients].sort((a, b) => a.metrics.energy - b.metrics.energy);
  const recoveryCount = patients.filter(p => p.metrics.mode === ExecutiveMode.RECOVERY).length;
  const peakCount = patients.filter(p => p.metrics.mode === ExecutiveMode.PEAK || p.metrics.mode === ExecutiveMode.TACTICAL).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-zinc-500 uppercase tracking-widest text-xs">
        System Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-zinc-300 font-sans flex flex-col selection:bg-zinc-800 selection:text-white">
      
      {/* Top Bar - Responsive */}
      <nav className="h-16 md:h-20 border-b border-zinc-900 flex items-center justify-between px-4 md:px-10 bg-[#0B0B0F]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 md:gap-12">
            <h1 className="text-white font-light tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm whitespace-nowrap">
                ENERGY <span className="text-zinc-600">SYSTEM</span>
            </h1>
            
            {/* Stats - Hidden on Mobile */}
            <div className="hidden md:flex gap-8 text-xs tracking-widest uppercase">
                <div className="flex items-center gap-3">
                    <span className="text-zinc-500">Total</span>
                    <span className="text-white font-medium">{patients.length}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-zinc-500">Recovery Mode</span>
                    <span className="text-[#FF5C5C] font-medium">{recoveryCount}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-zinc-500">Peak/Tactical</span>
                    <span className="text-[#3DDC97] font-medium">{peakCount}</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
            <Search size={16} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
            <Bell size={16} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
            <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-zinc-400">MD</span>
            </div>
        </div>
      </nav>

      {/* Main Cockpit */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
            
            <header className="flex justify-between items-end mb-6 md:mb-8 border-b border-zinc-900 pb-4">
                <h2 className="text-xs md:text-sm text-zinc-500 font-light uppercase tracking-[0.2em]">Patient Roster</h2>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                    <Filter size={12} /> Filter
                </button>
            </header>

            {/* Cinematic List Grid - Responsive Stack */}
            <div className="grid grid-cols-1 gap-3 md:gap-2">
                {sortedPatients.map((patient) => {
                    const mode = patient.metrics.mode;
                    const modeColor = getModeColor(mode);
                    const isCritical = mode === ExecutiveMode.RECOVERY;

                    return (
                        <div 
                            key={patient.id}
                            onClick={() => setSelectedPatient(patient)}
                            className={`group relative bg-[#141419] border border-zinc-900 hover:border-zinc-700 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer transition-all duration-300 gap-6 md:gap-0 ${isCritical ? 'border-l-2 border-l-[#FF5C5C]' : 'border-l-2 border-l-zinc-800'}`}
                        >
                            {/* Patient Info */}
                            <div className="flex items-center gap-4 md:gap-8 w-full md:w-1/3">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center font-light text-white text-base md:text-lg flex-shrink-0">
                                    {patient.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-light text-base md:text-lg tracking-wide group-hover:text-[#3DDC97] transition-colors truncate">{patient.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                         <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: modeColor }}></span>
                                         <p className="text-[10px] text-zinc-500 uppercase tracking-widest truncate">{mode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics - Stack on mobile, row on desktop */}
                            <div className="flex items-center gap-8 md:gap-16 w-full md:w-1/3 justify-between md:justify-center border-t border-zinc-800/50 md:border-none pt-4 md:pt-0">
                                <div className="flex flex-col items-start md:items-center">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Capacity</span>
                                    <span className={`text-xl md:text-2xl font-thin tracking-tight text-white`}>{patient.metrics.energy}%</span>
                                </div>
                                <div className="hidden md:block w-px h-8 bg-zinc-900"></div>
                                <div className="flex flex-col items-start md:items-center">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Load</span>
                                    <span className="text-xl md:text-2xl font-thin tracking-tight text-zinc-400">{patient.metrics.stress}%</span>
                                </div>
                            </div>

                            {/* Actions/Status */}
                            <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-1/3 border-t border-zinc-800/50 md:border-none pt-4 md:pt-0">
                                <div className="text-left md:text-right block">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Adherence</div>
                                    <div className={`text-sm font-light ${patient.adherence < 80 ? 'text-[#FF5C5C]' : 'text-zinc-400'}`}>
                                        {patient.adherence}%
                                    </div>
                                </div>
                                <ChevronRight className="text-zinc-800 group-hover:text-white transition-colors" size={18} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-[900px] bg-[#0B0B0F] border-l border-zinc-800 h-full shadow-2xl overflow-y-auto animate-slide-in-right">
                
                {/* Overlay Header */}
                <div className="p-6 md:p-10 flex justify-between items-start sticky top-0 bg-[#0B0B0F]/95 backdrop-blur z-20 border-b border-zinc-900">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-thin text-white tracking-wide mb-2">{selectedPatient.name}</h2>
                        <div className="flex flex-wrap gap-3 items-center">
                             <span className="px-2 py-0.5 rounded border border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                                 {selectedPatient.metrics.mode}
                             </span>
                             <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">{selectedPatient.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedPatient(null)}
                        className="p-2 hover:bg-zinc-900 rounded-full transition-colors group"
                    >
                        <X size={24} className="text-zinc-600 group-hover:text-white" />
                    </button>
                </div>

                {/* Overlay Content */}
                <div className="p-6 md:p-10 space-y-8 md:space-y-12">
                    
                    {/* Primary Vitals Row */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-full md:w-1/2 flex justify-center">
                             <EnergyRing energy={selectedPatient.metrics.energy} stress={selectedPatient.metrics.stress} size="large" />
                        </div>
                        <div className="w-full md:w-1/2 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em] mb-4">Strategic Recommendation</h3>
                                <p className="text-lg md:text-xl font-light text-white leading-relaxed">
                                    {selectedPatient.recommendation.action}
                                </p>
                            </div>
                            
                            {/* Adherence & Trend Mini-Dash (Doctor Only) */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-[#141419] rounded border border-zinc-900">
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Adherence</div>
                                    <div className="text-xl text-white font-light">{selectedPatient.adherence}%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">7d Trend</div>
                                    <div className="flex items-end gap-1 h-6">
                                        {selectedPatient.weeklyEnergy.map((val, i) => (
                                            <div 
                                                key={i} 
                                                className={`flex-1 rounded-t-sm ${val > 80 ? 'bg-[#3DDC97]' : val > 50 ? 'bg-[#F5B942]' : 'bg-[#FF5C5C]'}`}
                                                style={{ height: `${val}%` }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 border border-white/20 text-white py-4 px-6 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                                    <MessageSquare size={14} />
                                    Message
                                </button>
                                <button className="flex-1 bg-[#1F1F25] text-white border border-transparent py-4 px-6 text-xs uppercase tracking-widest hover:border-zinc-700 transition-all flex items-center justify-center gap-2">
                                    <Calendar size={14} />
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-zinc-900" />

                     {/* ENGINE DEBUG PANEL (Scientific V1.0) */}
                     {selectedPatient.metrics.debug && (
                         <div className="bg-[#141419] border border-zinc-800 p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-10">
                                 <Activity size={100} />
                             </div>
                             <h4 className="text-[10px] font-bold text-[#3DDC97] uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                                 <TrendingUp size={12} /> Engine V1.0 Debug
                             </h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                                 <div>
                                     <div className="text-zinc-600 uppercase tracking-widest mb-1">HRV (3d EMA)</div>
                                     <div className="text-white font-mono">{selectedPatient.metrics.debug.hrvEMA} ms</div>
                                     <div className="text-zinc-500 font-mono text-[10px] mt-1">
                                         Base: {selectedPatient.metrics.debug.hrvBaseline} ms
                                     </div>
                                 </div>
                                 <div>
                                     <div className="text-zinc-600 uppercase tracking-widest mb-1">RHR (3d EMA)</div>
                                     <div className="text-white font-mono">{selectedPatient.metrics.debug.rhrEMA} bpm</div>
                                     <div className="text-zinc-500 font-mono text-[10px] mt-1">
                                         Base: {selectedPatient.metrics.debug.rhrBaseline} bpm
                                     </div>
                                 </div>
                                 <div>
                                     <div className="text-zinc-600 uppercase tracking-widest mb-1">Z-Scores (σ)</div>
                                     <div className={`font-mono ${selectedPatient.metrics.debug.hrvZScore < -1 ? 'text-[#FF5C5C]' : 'text-zinc-400'}`}>
                                         HRV: {selectedPatient.metrics.debug.hrvZScore > 0 ? '+' : ''}{selectedPatient.metrics.debug.hrvZScore}
                                     </div>
                                     <div className={`font-mono mt-1 ${selectedPatient.metrics.debug.rhrZScore > 1 ? 'text-[#FF5C5C]' : 'text-zinc-400'}`}>
                                         RHR: {selectedPatient.metrics.debug.rhrZScore > 0 ? '+' : ''}{selectedPatient.metrics.debug.rhrZScore}
                                     </div>
                                 </div>
                                 <div>
                                     <div className="text-zinc-600 uppercase tracking-widest mb-1">7d Slope</div>
                                     <div className={`font-mono text-lg ${selectedPatient.metrics.debug.trendSlope7d < 0 ? 'text-[#FF5C5C]' : 'text-[#3DDC97]'}`}>
                                         {selectedPatient.metrics.debug.trendSlope7d > 0 ? '+' : ''}{selectedPatient.metrics.debug.trendSlope7d}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}


                    {/* Drivers (Detailed for Doctor) & Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div>
                             <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em] mb-8">Physiological Drivers</h4>
                             <div className="space-y-6">
                                {selectedPatient.drivers.map((driver, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                         <div className="flex justify-between items-end text-sm text-zinc-400">
                                            <span className="font-light tracking-[0.1em] text-white text-xs uppercase opacity-80">
                                            {driver.name}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-white font-mono text-sm">{driver.raw}</div>
                                                <div className={`text-[10px] font-mono ${driver.baselineDiff.includes('-') && driver.name !== 'Resting HR' ? 'text-[#FF5C5C]' : 'text-zinc-500'}`}>
                                                    {driver.baselineDiff !== 'N/A' ? `vs Base: ${driver.baselineDiff}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <DriverBar driver={driver} showDetail={false} />
                                    </div>
                                ))}
                             </div>
                         </div>
                         
                         <div>
                             <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em] mb-8">Clinical Context</h4>
                             <div className="space-y-4">
                                 {selectedPatient.context.map((ctx, idx) => (
                                     <div key={idx} className="flex flex-col p-5 bg-[#141419] border border-zinc-900 hover:border-zinc-700 transition-colors">
                                         <div className="flex justify-between items-start mb-2">
                                             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{ctx.title}</span>
                                             <div className={`w-1 h-1 rounded-full ${ctx.status === 'attention' ? 'bg-[#F5B942]' : 'bg-[#3DDC97]'}`} />
                                         </div>
                                         <div className="text-white font-light text-sm">{ctx.subtitle}</div>
                                         <div className="text-xs text-zinc-500 mt-1">{ctx.detail}</div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
