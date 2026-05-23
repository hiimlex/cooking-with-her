// src/components/molecules/Callout.tsx — info banner
import type { ReactNode } from 'react';
import { IcAlert, IcCheck, IcInfo, IcSparkle } from '@/icons';

export type CalloutTone = 'info' | 'success' | 'attention' | 'danger' | 'sponsor';

export interface CalloutProps {
  tone?: CalloutTone;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}

const tones: Record<CalloutTone, { bg: string; fg: string; Icon: typeof IcInfo }> = {
  info:      { bg: 'bg-lab-blue-bg',   fg: 'text-lab-blue-fg',   Icon: IcInfo },
  success:   { bg: 'bg-lab-green-bg',  fg: 'text-lab-green-fg',  Icon: IcCheck },
  attention: { bg: 'bg-lab-yellow-bg', fg: 'text-lab-yellow-fg', Icon: IcAlert },
  danger:    { bg: 'bg-lab-red-bg',    fg: 'text-lab-red-fg',    Icon: IcAlert },
  sponsor:   { bg: 'bg-accent-tint',   fg: 'text-accent',        Icon: IcSparkle },
};

export function Callout({ tone = 'info', title, children, icon }: CalloutProps) {
  const t = tones[tone];
  return (
    <div className={['px-3.5 py-3 rounded-2xl flex gap-2.5 text-[13px]', t.bg, t.fg].join(' ')}>
      <span className="mt-0.5 flex-shrink-0">{icon || <t.Icon size={16} />}</span>
      <div className="flex-1">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div className="leading-[1.45]">{children}</div>
      </div>
    </div>
  );
}
