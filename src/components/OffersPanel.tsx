import React from 'react';
import { Tag, Check, Percent, Sparkles, Award, ShieldCheck, HelpCircle, Utensils } from 'lucide-react';

interface Promo {
  discount: string;
  badge: string;
  title: string;
  description: string;
  terms: string;
}

export function OffersPanel() {
  const promos: Promo[] = [
    {
      discount: 'FRESH SPECIALS',
      badge: 'DAILY',
      title: 'Swiggy Redesign Dining Options',
      description: 'Get freshly prepared canteen food items, Samosas, Dosas, or snacks directly from our active kitchens.',
      terms: 'Applicable on both individual items & combo meal baskets.'
    },
    {
      discount: 'FREE BEVERAGES',
      badge: 'STUDY AID',
      title: 'Freshman Study Brew Perk',
      description: 'Enjoy steaming Filter Coffee or dynamic Masala Chai to keep you alert and energized during your class hours.',
      terms: 'Ask for current beverage selections at the counter.'
    },
    {
      discount: 'STATIONERY PLUS',
      badge: 'LAB ONLY',
      title: 'Official Lab Record Materials',
      description: 'Canteen stationery departments stock official lab materials, records, and notebooks for direct collection.',
      terms: 'Applies to active academic year stationery items category only.'
    }
  ];

  return (
    <div id="offers-panel" className="space-y-8 text-left max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-r from-[#1B4D3E] to-[#2E7D5A] text-white p-8 rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Floating background circle details */}
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/5 rounded-full filter blur-xl" />
        
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <span className="bg-[#E8F5E9] text-[#1B4D3E] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            College Food Dining
          </span>
          <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight leading-none text-white">SPHN Campus Meal Perks</h3>
          <p className="text-xs text-slate-100 max-w-xl font-medium leading-relaxed">Enjoy direct food ordering, digital Token queues, and instant UPI checking using our streamlined CampusBites system.</p>
        </div>

        <div className="bg-white/10 border border-white/20 p-5 rounded-2xl text-center shrink-0 w-full md:w-auto">
          <span className="block text-[10px] font-bold text-slate-200 font-mono uppercase tracking-widest">Kitchen Status</span>
          <strong className="text-xl font-mono text-[#4CAF50] block mt-1 tracking-wider uppercase">Online</strong>
        </div>
      </div>

      {/* 2. List of Promo Cards */}
      <div className="space-y-5">
        <h4 className="font-display font-black text-slate-800 text-lg md:text-xl tracking-tight">Active SPHN Campus Benefits</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo, idx) => {
            return (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#E8F5E9] p-1.5 rounded-lg text-[#1B4D3E]">
                        <Utensils className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-xs font-mono font-black text-[#1B4D3E] uppercase">{promo.discount}</span>
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

                {/* Bottom details */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-5">
                  <div className="text-[10px] text-slate-400 font-semibold leading-snug">
                    ℹ️ {promo.terms}
                  </div>
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
          <strong className="text-slate-800 font-bold block mb-0.5">Secure Razorpay Sandbox Account Integration</strong>
          <p className="text-slate-450 leading-relaxed font-semibold">Our campus checkouts settling via Razorpay sandbox automatically process your requests. Place orders in your tray and keep track of live kitchen states in real time.</p>
        </div>
      </div>

    </div>
  );
}
