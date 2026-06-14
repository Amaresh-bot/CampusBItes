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
    { id: 'stationery', name: 'Stationery', icon: '📚', searchQuery: '', categoryName: 'Stationery' },
    { id: 'printouts', name: 'Printouts', icon: '🖨️', searchQuery: '', categoryName: 'Stationery' },
    { id: 'lab_materials', name: 'Lab Materials', icon: '🔬', searchQuery: '', categoryName: 'Stationery' },
  ];

  // Removed popularStores

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] antialiased font-sans flex flex-col justify-between selection:bg-[#4CAF50]/20 selection:text-[#1B4D3E]">
      
      {/* 1. Global Announcement / College Trust Ribbon */}
      <div className="bg-[#1B4D3E] text-[#FFFFFF] text-[11px] font-sans font-bold py-2 px-4 text-center flex justify-center items-center gap-1.5 select-none tracking-wider">
        <span className="inline-flex h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse shrink-0"></span>
        <span className="uppercase text-slate-100">Sphoorthy Engineering College Ecosystem Smart Hub (N8 Portal)</span>
        <span className="hidden sm:inline text-slate-300/40">•</span>
        <span className="hidden sm:inline text-[#E8F5E9] font-medium">Canteen Orders & Bookstore Reservation Active</span>
      </div>

      {/* 2. Swiggy-Inspired Seamless Unified Hero Section (with absolute Transparent Navbar Overlay) */}
      <section 
        id="hero" 
        className="relative text-white overflow-hidden min-h-screen flex flex-col justify-center pt-32 pb-20 selection:bg-[#4CAF50]/30"
        style={{
          background: 'rgba(27, 77, 62, 0.9)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Glowing glassmorphism & background gradients behind content but inside section */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#4CAF50]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/5 right-1/10 w-80 h-80 bg-[#E8F5E9]/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Transparent Absolute Navbar Overlay inside Hero */}
        <nav className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-0 min-h-[72px] sm:h-24 flex items-center justify-between gap-2">
            
            {/* Logo Brand Identity with White-Text Contrast (Swiggy Logo Style) - SMALL */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl shrink-0 p-1 shadow-md bg-white"
              />
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display font-black text-base sm:text-xl tracking-tight text-white uppercase leading-none">
                    CampusBites
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-mono font-bold bg-white/10 text-white px-1 py-0.5 rounded border border-white/20 shrink-0">
                    SPHN
                  </span>
                </div>
                <span className="text-[7px] sm:text-[8px] text-white/70 font-bold tracking-wider uppercase hidden sm:block truncate mt-0.5">Sphoorthy Engineering</span>
              </div>
            </div>

            {/* Right Area Controls with high contrasts - Lighter main color button */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={onSignOut}
                    className="text-[11px] sm:text-xs font-black text-white/90 hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-sans shrink-0"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={onEnterApp}
                    className="text-[11px] sm:text-xs font-extrabold bg-[#2E7D5A] hover:bg-[#245B49] hover:scale-[1.02] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-[10px] sm:rounded-[15px] cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Go to Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white hidden xs:block" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    className="text-[11px] sm:text-xs font-black text-white/90 hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-sans shrink-0"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignIn}
                    className="text-[11px] sm:text-xs font-extrabold bg-[#2E7D5A] hover:bg-[#245B49] hover:scale-[1.02] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-[10px] sm:rounded-[15px] cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white hidden xs:block" />
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Hero Left Content Accent Block */}
            <div className="col-span-1 lg:col-span-12 space-y-6 text-center lg:text-left flex flex-col justify-center max-w-5xl mx-auto w-full">
              
              {/* Mega Heavy Premium Headings */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-[72px] font-display font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.08]">
                  Order Food & Essentials.
                </h1>
                
                <p className="text-xs sm:text-base md:text-lg text-slate-200 mt-2 font-semibold max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Everything students need inside campus. Fresh meals, snacks, stationery, printouts, and essentials.
                </p>
                {/* Swiggy-like Item Search Container */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mt-8 relative z-30">
                <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white focus-within:text-[#1E293B] rounded-2xl border border-white/20 focus-within:border-white/40 shadow-lg backdrop-blur-md transition-all duration-300 overflow-hidden">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-5 h-5 text-[#4CAF50] absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder="Search food, snacks, stationery, stores..."
                      className="w-full pl-12 pr-12 py-4 bg-transparent text-white focus:text-[#1E293B] placeholder:text-slate-355 focus:placeholder:text-slate-400 focus:outline-none text-sm sm:text-base font-semibold border-none"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 text-[#E8F5E9] focus-within:text-[#1E293B]/80 hover:text-white shrink-0 p-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 text-[#4CAF50] hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 w-full">
                
                {/* Card 1: Food Delivery */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => isLoggedIn ? onEnterApp('', 'All') : onSignIn('', 'All')}
                  className="cursor-pointer bg-white rounded-[32px] p-6 shadow-md flex flex-col justify-between h-[280px] border border-slate-100 hover:border-[#4CAF50]/20 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-6 -bottom-6 text-[120px] sm:text-[150px] lg:text-[180px] leading-none select-none transition-transform duration-300 ease-out group-hover:scale-108 origin-bottom-right drop-shadow-lg z-0">
                    🍔
                  </div>
                  
                  <div className="space-y-2 relative z-10 max-w-[65%]">
                    <span className="text-[9px] font-black uppercase text-[#1B4D3E] tracking-wider bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      Fresh & Hot
                    </span>
                    <h3 className="font-extrabold text-[#1B4D3E] text-xl sm:text-2xl tracking-tight leading-tight uppercase mt-2">
                      Food Delivery
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-normal">
                      Fresh meals from campus canteens
                    </p>
                  </div>

                  <div className="relative z-10 w-10 h-10 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Card 2: Campus Store */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => isLoggedIn ? onEnterApp('', 'Stationery') : onSignIn('', 'Stationery')}
                  className="cursor-pointer bg-white rounded-[32px] p-6 shadow-md flex flex-col justify-between h-[280px] border border-slate-100 hover:border-[#4CAF50]/20 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-6 -bottom-6 text-[120px] sm:text-[150px] lg:text-[180px] leading-none select-none transition-transform duration-300 ease-out group-hover:scale-108 origin-bottom-right drop-shadow-lg z-0">
                    🛒
                  </div>

                  <div className="space-y-2 relative z-10 max-w-[65%]">
                    <span className="text-[9px] font-black uppercase text-[#1B4D3E] tracking-wider bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      Student Rates
                    </span>
                    <h3 className="font-extrabold text-[#1B4D3E] text-xl sm:text-2xl tracking-tight leading-tight uppercase mt-2">
                      Campus Store
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-normal">
                      Stationery and daily essentials
                    </p>
                  </div>

                  <div className="relative z-10 w-10 h-10 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Card 3: Print & Services */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => isLoggedIn ? onEnterApp('', 'Stationery') : onSignIn('', 'Stationery')}
                  className="cursor-pointer bg-white rounded-[32px] p-6 shadow-md flex flex-col justify-between h-[280px] border border-slate-100 hover:border-[#4CAF50]/20 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-6 -bottom-6 text-[120px] sm:text-[150px] lg:text-[180px] leading-none select-none transition-transform duration-300 ease-out group-hover:scale-108 origin-bottom-right drop-shadow-lg z-0">
                    🖨️
                  </div>

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
                </motion.div>
              </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. Featured SPHN Categories (Swiggy food options circular slider layout) */}
      <section 
        className="py-16 w-full rounded-t-[32px] sm:rounded-t-[48px] -mt-6 relative z-20 border-t border-slate-100 select-none overflow-hidden"
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
                className="group flex flex-col items-center select-none cursor-pointer shrink-0 w-16 sm:w-24 text-center"
              >
                {/* Circular background card */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white border border-slate-100/80 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-1">
                  <span className="text-3xl sm:text-5xl select-none leading-none">{cat.icon}</span>
                </div>
                <h4 className="mt-3 text-[10px] sm:text-xs font-extrabold text-slate-700 tracking-tight leading-tight group-hover:text-[#1B4D3E] transition-colors w-full truncate">
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
            <div className="flex justify-center space-x-6">
              <button onClick={onContactUs} className="hover:underline hover:text-white font-bold cursor-pointer">Support Desk</button>
              <span className="text-[#A2C2B9]/30">|</span>
              <button onClick={onSignIn} className="hover:underline hover:text-white font-bold cursor-pointer">Student Access</button>
              <span className="text-[#A2C2B9]/30">|</span>
              <button onClick={onSignIn} className="hover:underline hover:text-white font-bold cursor-pointer">Canteen & Books Management</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
