import type { ReactNode } from 'react';
import { PhoneFrame } from './PhoneFrame';

export interface PhoneLayoutProps {
  children: ReactNode;
  label?: string;
}

export function PhoneLayout({ children, label }: PhoneLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center py-12 px-6" style={{ background: '#ece6f7' }}>
      <PhoneFrame label={label}>{children}</PhoneFrame>
    </div>
  );
}
