import { useEffect, useState } from 'react';
import { IcSparkle } from '@/icons';

const MESSAGES = [
  'Verificando a despensa…',
  'Contando os ovos…',
  'Perguntando à Nonna…',
  'Imaginando o sabor…',
  'Combinando ingredientes…',
  'Quase pronto…',
];

export function AILoading() {
  const [dots, setDots] = useState(0);
  const [msg, setMsg]   = useState(0);

  useEffect(() => {
    const i1 = setInterval(() => setDots((d) => (d + 1) % 4), 300);
    const i2 = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 700);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-10 text-center text-white"
      style={{
        background: 'linear-gradient(135deg, var(--c-accent) 0%, color-mix(in srgb, var(--c-accent) 60%, white) 50%, #ff7eb9 100%)',
      }}
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white"
        style={{
          background:     'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(8px)',
          animation:      'nonnaPulse 1.6s ease-in-out infinite',
          boxShadow:      '0 0 0 12px rgba(255,255,255,0.08), 0 0 0 24px rgba(255,255,255,0.04)',
        }}
      >
        <IcSparkle size={42} />
      </div>
      <div>
        <div className="text-[22px] font-extrabold mb-2.5 tracking-[-0.4px]">
          Preparando a receita{'.'.repeat(dots)}
        </div>
        <div className="text-sm opacity-90 min-h-[22px]">{MESSAGES[msg]}</div>
      </div>
    </div>
  );
}
