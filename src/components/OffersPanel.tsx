import React, { useState } from 'react';
import { Tag, Check, Copy, Percent, Sparkles, Award, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Promo {
  code: string;
  discount: string;
  title: string;
  description: string;
  terms: string;
  badge: string;
}

export function OffersPanel() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const promos: Promo[] = [
    {
      code: 'CAMPUS20',
      discount: '20% OFF',
      badge: 'POPULAR',
      title: 'Swiggy Redesign Special Offer',
      description: 'Get a flat 20% discount on any canteen food items, Samosas, Dosas or snacks today.',
      terms: 'Applicable on baskets above ₹50. Single use per student session.'
    },
    {
      code: 'WELCOME20',
      discount: 'FREE COFFEE',
      badge: 'NEW',
      title: 'Freshman Welcome Brew Card',
      description: 'Receive one free steaming Filter Coffee or dynamic Masala Chai on checking out above ₹150.',
      terms: 'Applicable on both food plates & official lab stationery books.'
    },
    {
      code: 'SPHNPRINT',
      discount: '10% CASHBACK',
      badge: 'LAB ONLY',
      title: 'Lab Record Book Incentive',
      description: 'Acquire 10% instant checkout credit on buying any official lab materials, records or notebooks.',
      terms: 'Applies on Stationery items category only. No coupon cap.'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div id="offers-panel" className="space-y-8 text-left max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-r from-[#1B4D3E] to-[#2E7D5A] text-white p-8 rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Floating background circle details */}
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/5 rounded-full filter blur-xl" />
        
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <span className="bg-[#E8F5E9] text-[#1B4D3E] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            College Food Deals
          </span>
          <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight leading-none text-white">SPHN Campus Cravings Deals</h3>
          <p className="text-xs text-slate-100 max-w-xl font-medium leading-relaxed">Combine college discounts, food-commerce, and instant UPI checking using our secure system coupon guides.</p>
        </div>

        <div className="bg-white/10 border border-white/20 p-5 rounded-2xl text-center shrink-0 w-full md:w-auto">
          <span className="block text-[10px] font-bold text-slate-200 font-mono uppercase tracking-widest">Active code today</span>
          <strong className="text-xl font-mono text-[#4CAF50] block mt-1 tracking-wider">CAMPUS20</strong>
        </div>
      </div>

      {/* 2. List of Promo Cards */}
      <div className="space-y-5">
        <h4 className="font-display font-black text-slate-800 text-lg md:text-xl tracking-tight">Active SPHN Promo Vouchers</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map(promo => {
            const isCopied = copiedCode === promo.code;
            return (
              <div
                key={promo.code}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#E8F5E9] p-1.5 rounded-lg text-[#1B4D3E]">
                        <Percent className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-lg font-mono font-black text-[#1B4D3E]">{promo.discount}</span>
                    </div>
                    
                    <span className="text-[9px] font-black bg-amber-500 text-white px-2.5 py-1 rounded-md shadow-xs font-mono uppercase tracking-wider">
                      {promo.badge}
                    </span>
                  </div>

                  {/* Promo content */}
                  <div className="space-y-1.5">
                    <h5 className="font-display font-black text-slate-800 text-base tracking-tight leading-snug">
                      {promo.title}
                    </h5>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                      {promo.description}
                    </p>
                  </div>
                </div>

                {/* Bottom details and copy prompt */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-5">
                  <div className="text-[10px] text-slate-400 font-semibold max-w-[170px] leading-snug">
                    ℹ️ {promo.terms}
                  </div>

                  <button
                    onClick={() => handleCopy(promo.code)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all duration-300 flex items-center gap-1.5 ${
                      isCopied
                        ? 'bg-[#E8F5E9] text-[#1B4D3E] border border-[#4CAF50]/20'
                        : 'bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4CAF50] stroke-[3]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code {promo.code}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Razorpay secure instructions banner */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
        <ShieldCheck className="w-8 h-8 text-[#4CAF50] shrink-0" />
        <div className="text-xs">
          <strong className="text-slate-800 font-bold block mb-0.5">Secure Razorpay Coupon Settlement</strong>
          <p className="text-slate-450 leading-relaxed font-semibold">Our campus checkouts settling via Razorpay sandbox automatically calculate and verify active discounts. Apply coupons in the sticky cart tray to see active cuts instantly.</p>
        </div>
      </div>

    </div>
  );
}
