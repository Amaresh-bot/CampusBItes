import React, { useState, useRef } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Clock, 
  GraduationCap, 
  CreditCard,
  ShoppingBag,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FallbackImage } from './FallbackImage';

interface LandingPageProps {
  onSignIn: (searchQuery?: string, categoryFilter?: string) => void;
  onContactUs: () => void;
  isLoggedIn: boolean;
  onEnterApp: (searchQuery?: string, categoryFilter?: string) => void;
  onSignOut: () => void;
}

export function LandingPage({ onSignIn, onContactUs, isLoggedIn, onEnterApp, onSignOut }: LandingPageProps) {
  const [selectedCollege, setSelectedCollege] = useState('Sphoorthy Engineering College (Main Campus)');
  const [searchVal, setSearchVal] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      onEnterApp(searchVal, 'All');
    } else {
      onSignIn(); // Prompts user registration/login
    }
  };

  // Modern Featured Categories mapping exact items available in canteen menu
  const categories = [
    { id: 'dosa', name: 'Crispy Dosa', icon: '🥞', searchQuery: 'Dosa', categoryName: 'Breakfast' },
    { id: 'samosa', name: 'Golden Samosa', icon: '🥟', searchQuery: 'Samosa', categoryName: 'Snacks' },
    { id: 'chai', name: 'Masala Chai', icon: '☕', searchQuery: 'Chai', categoryName: 'Beverages' },
    { id: 'paneer', name: 'Paneer Naan', icon: '🍲', searchQuery: 'Paneer', categoryName: 'Meals' },
    { id: 'chole', name: 'Chole Bhature', icon: '🍛', searchQuery: 'Chole', categoryName: 'Breakfast' },
    { id: 'noodles', name: 'Hakka Noodles', icon: '🍜', searchQuery: 'Noodles', categoryName: 'Chinese' },
    { id: 'gulab', name: 'Gulab Jamun', icon: '🍮', searchQuery: 'Jamun', categoryName: 'Desserts' },
  ];

  // Removed popularStores

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] antialiased font-sans flex flex-col justify-between selection:bg-[#4CAF50]/20 selection:text-[#1B4D3E]">
      


      <section 
        id="hero" 
        className="relative text-white overflow-hidden min-h-screen flex flex-col justify-center pt-28 pb-8 sm:pb-10 selection:bg-[#4CAF50]/30"
        style={{
          backgroundImage: 'linear-gradient(rgba(27, 77, 62, 0.3), rgba(27, 77, 62, 0.35)), url(/assets/hero_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

        {/* Transparent Absolute Navbar Overlay inside Hero */}
        <nav className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-0 min-h-[72px] sm:h-24 flex items-center justify-between gap-2">
            
            {/* Logo Brand Identity with White-Text Contrast (Swiggy Logo Style) - SMALL */}
            <div className="flex items-center gap-3 min-w-0">
              <FallbackImage
                srcs={[
                  '/assets/college_logo.png',
                  '/assets/logo.png',
                  '/logo.png',
                  '/assets/logo.jpg',
                  '/assets/logo.svg'
                ]}
                alt="Sphoorthy Engineering College CampusBites Logo"
                type="logo"
                className="w-10 h-10 object-contain rounded-xl shrink-0 p-1 shadow-md bg-white"
              />
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display font-black text-sm sm:text-xl tracking-tight text-white uppercase leading-none">
                    CampusBites
                  </span>
                  <span className="text-[8px] font-mono font-bold bg-white/10 text-white px-1 py-0.5 rounded border border-white/20 shrink-0">
                    SPHN
                  </span>
                </div>
                <span className="text-[8px] text-white/70 font-bold tracking-wider uppercase hidden sm:block truncate mt-0.5">Sphoorthy Engineering</span>
              </div>
            </div>

            {/* Right Area Controls with high contrasts - Lighter main color button */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={onSignOut}
                    className="hidden sm:inline-block text-[11px] sm:text-xs font-black text-white/90 hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-sans shrink-0"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => onEnterApp()}
                    className="text-[10px] sm:text-xs font-extrabold bg-[#2E7D5A] hover:bg-[#245B49] hover:scale-[1.02] text-white px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-[8px] sm:rounded-[15px] cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Go to Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white hidden sm:block" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onSignIn()}
                    className="hidden sm:inline-block text-[11px] sm:text-xs font-black text-white/90 hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-sans shrink-0"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onSignIn()}
                    className="text-[10px] sm:text-xs font-extrabold bg-[#2E7D5A] hover:bg-[#245B49] hover:scale-[1.02] text-white px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-[8px] sm:rounded-[15px] cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Go to Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white hidden sm:block" />
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Hero Left Content Accent Block */}
            <div className="col-span-1 lg:col-span-12 space-y-6 text-center flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
              
              {/* Mega Heavy Premium Headings */}
              <div className="space-y-4 w-full flex flex-col items-center text-center">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.08]">
                  Order <span className="text-[#4CAF50]">Food &</span> <span className="relative inline-block pb-1">Essentials.<span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#4CAF50] rounded-full" /></span>
                </h1>
                
                <p className="text-xs sm:text-sm md:text-base text-slate-200 mt-2 font-semibold max-w-xl mx-auto leading-relaxed">
                  Everything students need inside campus. Fresh meals, snacks, stationery, printouts, and essentials.
                </p>

              {/* Quick Access Cards */}
              <div className="flex sm:grid sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10 w-full overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 sm:pb-0 max-w-3xl mx-auto">
                
                {/* Card 1: Campus Canteen */}
                <div
                  onClick={() => isLoggedIn ? onEnterApp('', 'All') : onSignIn('', 'All')}
                  className="cursor-pointer bg-white rounded-[32px] p-6 shadow-xl flex flex-col justify-between h-[280px] w-[80%] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 snap-center border border-slate-100 transition-all duration-300 relative overflow-hidden group select-none text-left"
                >
                  <img 
                    src="/assets/thali.jpg" 
                    alt="Campus Canteen" 
                    className="absolute right-0 bottom-0 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] object-contain select-none transition-transform duration-500 ease-out origin-bottom-right z-0 group-hover:scale-105"
                  />
                  
                  <div className="space-y-2 relative z-10 max-w-[65%]">
                    <span className="text-[9px] font-black uppercase text-[#1B4D3E] tracking-wider bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      Fresh & Hot
                    </span>
                    <h3 className="font-extrabold text-[#1B4D3E] text-xl sm:text-2xl tracking-tight leading-tight uppercase mt-2">
                      Campus Canteen
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-normal">
                      Fresh meals from campus canteens
                    </p>
                  </div>

                  <div className="relative z-10 w-10 h-10 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 3: Print & Services */}
                <div
                  onClick={() => isLoggedIn ? onEnterApp('', 'printhub') : onSignIn('', 'printhub')}
                  className="cursor-pointer bg-white rounded-[32px] p-6 shadow-xl flex flex-col justify-between h-[280px] w-[80%] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 snap-center border border-slate-100 transition-all duration-300 relative overflow-hidden group select-none text-left"
                >
                  <img 
                    src="/assets/printer.jpg" 
                    alt="Print & Hub" 
                    className="absolute right-0 bottom-0 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] object-contain select-none transition-transform duration-500 ease-out origin-bottom-right z-0 group-hover:scale-105"
                  />

                  <div className="space-y-2 relative z-10 max-w-[65%]">
                    <span className="text-[9px] font-black uppercase text-[#1B4D3E] tracking-wider bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      Instant Copy
                    </span>
                    <h3 className="font-extrabold text-[#1B4D3E] text-xl sm:text-2xl tracking-tight leading-tight uppercase mt-2">
                      Print & Hub
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-normal">
                      Printouts, records & academic services
                    </p>
                  </div>

                  <div className="relative z-10 w-10 h-10 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. Featured SPHN Categories (Swiggy food options circular slider layout) */}
      <section 
        className="pt-8 sm:pt-10 pb-16 w-full relative z-20 border-t border-slate-100 select-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 1))'
        }}
      >
        {/* Style tag to hide scrollbars cleanly on WebKit browsers */}
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex justify-between items-end gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-[#1B4D3E] tracking-tight">
                Order our best food options
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-bold mt-1 uppercase tracking-wide">Freshly prepared in SPHN kitchens & stores</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => isLoggedIn ? onEnterApp() : onSignIn()}
                className="text-[10px] sm:text-xs font-black text-[#1B4D3E] hover:text-[#2E7D5A] hidden sm:flex items-center gap-1 cursor-pointer bg-[#E8F5E9] px-4 py-2 rounded-full transition-colors"
              >
                See All Items ({categories.length} options)
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={scrollLeft}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-xs active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
                <button 
                  onClick={scrollRight}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-xs active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Swiggy-Style Category Horizontal Slider - Two Rows */}
          <div 
            ref={scrollRef}
            className="grid grid-rows-2 grid-flow-col gap-y-6 gap-x-4 sm:gap-x-8 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth w-full select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  if (isLoggedIn) {
                    onEnterApp(cat.searchQuery, cat.categoryName);
                  } else {
                    onSignIn();
                  }
                }}
                className="group flex flex-col items-center select-none cursor-pointer shrink-0 w-24 text-center"
              >
                {/* Circular background card */}
                <div className="w-24 h-24 rounded-full bg-white border border-slate-100/80 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-1">
                  <span className="text-5xl select-none leading-none">{cat.icon}</span>
                </div>
                <h4 className="mt-3 text-xs font-extrabold text-slate-700 tracking-tight leading-tight group-hover:text-[#1B4D3E] transition-colors w-full truncate">
                  {cat.name}
                </h4>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Removed Popular Stores */}



      {/* 9. Why CampusBites (4 feature cards) */}
      <section className="bg-slate-50 py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl font-display font-black text-[#1B4D3E] tracking-tight">
              Why CampusBites?
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Optimized exclusively for Sphoorthy Engineering College academic routines</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col shadow-xs">
              <div className="h-10 w-10 bg-[#E8F5E9] text-[#1B4D3E] rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#2E7D5A]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase">No Waiting Lines</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Reserve snacks or official textbooks inside SPHN ahead of time and access pickup tokens instantaneously.
                </p>
              </div>
            </div>



            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col shadow-xs">
              <div className="h-10 w-10 bg-[#E8F5E9] text-[#1B4D3E] rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-[#2E7D5A]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase">Student-Friendly Prices</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Official college subsidized menu items, with exclusive discounts for valid registered roll numbers.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col shadow-xs">
              <div className="h-10 w-10 bg-[#E8F5E9] text-[#1B4D3E] rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#2E7D5A]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase">Digital Payments</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Checkout securely via integrated Razorpay gateways. Support prompt refund processing directly to students.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Premium Minimalist Dark Green SaaS-Style Footer */}
      <footer className="py-12 border-t border-[#143B2F]/10 bg-[#1B4D3E] text-slate-300 text-center text-xs w-full shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight text-white">
                Campus<span className="text-[#4CAF50]">Bites</span>
              </span>
              <span className="text-[8px] font-mono font-bold bg-[#E8F5E9]/15 text-[#E8F5E9] px-1.5 py-0.5 rounded uppercase">
                Sphoorthy Hub
              </span>
            </div>
            <p className="text-[11px] text-[#A2C2B9] font-medium max-w-sm sm:max-w-md sm:text-right">
              Serving premium food token management, bookstore processing, and safe OTP authorized billing inside Sphoorthy Engineering College.
            </p>
          </div>

          <div className="h-px bg-white/10 w-full" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p className="text-[#A2C2B9] font-medium">© 2026 CampusBites Consortium • Sphoorthy Engineering College. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
