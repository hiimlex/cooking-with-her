// src/components/organisms/AILoading.tsx — full-screen loader
import { useEffect, useState } from 'react';
import { IcSparkle } from '@/icons';

export function AILoading() {
  const [dots, setDots] = useState(0);
  const [msg, setMsg] = useState(0);
  const messages = ['Checking pantry…', 'Counting eggs…', 'Asking Nonna…', 'Tasting in my head…'];

  useEffect(() => {
    const i1 = setInterval(() => setDots((d) => (d + 1) % 4), 300);
    const i2 = setInterval(() => setMsg((m) => (m + 1) % messages.length), 700);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-10 text-center text-white"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #ff7eb9 100%)',
      }}
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white"
        style={{
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(8px)',
          animation: 'nonnaPulse 1.6s ease-in-out infinite',
          boxShadow: '0 0 0 12px rgba(255,255,255,0.08), 0 0 0 24px rgba(255,255,255,0.04)',
        }}
      >
        <IcSparkle size={42} />
      </div>
      <div>
        <div className="text-[22px] font-extrabold mb-2.5 tracking-[-0.4px]">
          Cooking it up{'.'.repeat(dots)}
        </div>
        <div className="text-sm opacity-90 min-h-[22px]">{messages[msg]}</div>
      </div>
    </div>
  );
}
