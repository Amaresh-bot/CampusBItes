import React from 'react';
import { ChefHat } from 'lucide-react';

interface AppFooterProps {
  onPolicyClick?: (key: 'terms' | 'privacy' | 'refund' | 'contact') => void;
  className?: string;
}

const POLICY_LINKS: { label: string; key: 'terms' | 'privacy' | 'refund' | 'contact' }[] = [
  { label: 'Terms & Conditions', key: 'terms' },
  { label: 'Privacy Policy',     key: 'privacy' },
  { label: 'Refund Policy',      key: 'refund' },
  { label: 'Contact Us',         key: 'contact' },
];

export function AppFooter({ onPolicyClick, className = '' }: AppFooterProps) {
  return (
    <footer className={`w-full shrink-0 bg-[#1B4D3E] ${className}`}>
      {/* Main body – centered brand + links */}
      <div className="py-8 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center gap-4">

          {/* Brand wordmark */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-md mb-1.5">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">CampusBites</h2>
            <p className="text-[10px] font-bold text-white/60 tracking-[0.25em] uppercase">
              Sphoorthy Engineering College
            </p>
          </div>

          {/* Divider */}
          <div className="w-14 h-px rounded-full bg-white/20" />

          {/* Policy links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {POLICY_LINKS.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => onPolicyClick?.(key)}
                className="text-xs font-medium text-white/75 hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright strip */}
      <div className="border-t border-white/10 py-2.5 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center">
          <p className="text-[10px] text-white/50 font-medium">
            © 2025 CampusBites Hub · Sphoorthy Engineering College
          </p>
          <p className="text-[10px] text-white/35">
            Powered by Razorpay · Secure PCI-DSS Checkout
          </p>
        </div>
      </div>
    </footer>
  );
}
