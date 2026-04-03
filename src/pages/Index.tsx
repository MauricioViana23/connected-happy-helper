import React, { useState } from 'react';
import { PatientView } from '@/components/ceohub/PatientView';
import { DoctorDashboard } from '@/components/ceohub/DoctorDashboard';
import { Smartphone, LayoutGrid } from 'lucide-react';
import { SplashScreen } from '@/components/ceohub/SplashScreen';

const Index: React.FC = () => {
  const [view, setView] = useState<'patient' | 'doctor'>('doctor');
  const [currentPatientId, setCurrentPatientId] = useState('p2');
  const [showSplash, setShowSplash] = useState(true);

  const patientIds = ['p1', 'p2', 'p3'];

  const handleLogDose = () => {
    alert("Log Dose Flow: Camera/Timestamp capture would open here.");
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="bg-[#0B0B0F] min-h-screen font-sans selection:bg-[#3DDC97]/30 text-white">

      {showSplash && view === 'patient' && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="fixed bottom-4 left-4 z-[100] flex gap-2 bg-[#141419]/90 backdrop-blur border border-zinc-800 p-1 rounded-full shadow-2xl transition-opacity duration-500 opacity-20 hover:opacity-100">
        <button
          onClick={() => {
            setView('patient');
            setShowSplash(true);
          }}
          className={`p-2 rounded-full transition-all ${view === 'patient' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}
          title="Patient View (Mobile)"
        >
          <Smartphone size={16} />
        </button>
        <button
          onClick={() => setView('doctor')}
          className={`p-2 rounded-full transition-all ${view === 'doctor' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}
          title="Doctor View (Dashboard)"
        >
          <LayoutGrid size={16} />
        </button>

        {view === 'patient' && (
          <div className="border-l border-zinc-700 pl-2 ml-1 flex items-center gap-1">
            {patientIds.map((id, i) => (
              <button
                key={id}
                onClick={() => setCurrentPatientId(id)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border ${currentPatientId === id ? 'bg-[#3DDC97] border-[#3DDC97] text-black' : 'bg-black border-zinc-700 text-zinc-500'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'patient' ? (
        <PatientView patientId={currentPatientId} onLogDose={handleLogDose} />
      ) : (
        <DoctorDashboard />
      )}
    </div>
  );
};

export default Index;
