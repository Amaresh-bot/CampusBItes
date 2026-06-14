import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Clock, 
  GraduationCap, 
  CreditCard,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FallbackImage } from './FallbackImage';

interface LandingPageProps {
  onSignIn: () => void;
  onContactUs: () => void;
}

export function LandingPage({ onSignIn, onContactUs }: LandingPageProps) {
  const [selectedCollege, setSelectedCollege] = useState('Sphoorthy Engineering College (Main Campus)');
  const [searchVal, setSearchVal] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(); // Prompts user registration/login
  };

  // Modern Featured Categories
  const categories = [
    { id: 'meals', name: 'Meals', icon: '🍛', count: '12 Items' },
    { id: 'snacks', name: 'Snacks', icon: '🍟', count: '18 Items' },
    { id: 'beverages', name: 'Beverages', icon: '🥤', count: '9 Items' },
    { id: 'stationery', name: 'Stationery', icon: '📝', count: '24 Items' },
    { id: 'printouts', name: 'Printouts', icon: '🖨️', count: 'Fast Docs' },
    { id: 'lab_materials', name: 'Lab Materials', icon: '🔬', count: 'SPHN Kits' },
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
          background: `radial-gradient(circle at top left, rgba(76,175,80,0.2), transparent 40%), linear-gradient(135deg, #1B4D3E 0%, #245B49 50%, #2E7D5A 100%)`
        }}
      >
        {/* Transparent Absolute Navbar Overlay inside Hero */}
        <nav className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-0 min-h-[72px] sm:h-24 flex items-center justify-between gap-2">
            
            {/* Logo Brand Identity with White-Text Contrast */}
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
                className="w-9 h-9 sm:w-12 sm:h-12 object-contain rounded-xl shrink-0 border border-white/10 p-0.5 shadow-sm bg-white/5 backdrop-blur-md"
              />
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-white">
                    Campus<span className="text-[#4CAF50]">Bites</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#4CAF50]/20 text-[#E8F5E9] px-1 sm:px-1.5 py-0.5 rounded border border-[#4CAF50]/30 shrink-0">
                    SPHN
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-[#A2C2B9] font-bold tracking-wider uppercase hidden sm:block truncate">Sphoorthy Engineering</span>
              </div>
            </div>

            {/* Center Navigation Links - Soft green text with white hover effect */}
            <div className="hidden md:flex items-center gap-10 font-bold text-xs tracking-wider uppercase text-[#E8F5E9]">
              <a href="#hero" className="hover:text-white transition-colors relative group py-2">
                Home
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </a>
              <button onClick={onSignIn} className="hover:text-white cursor-pointer transition-colors relative group py-2">
                Stores
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </button>
              <button onClick={onSignIn} className="hover:text-white cursor-pointer transition-colors relative group py-2">
                Categories
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </button>
              <button onClick={onContactUs} className="hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors relative group py-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                Contact
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </button>
            </div>

            {/* Right Area Controls with high contrasts */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              <button
                onClick={onSignIn}
                className="text-[11px] sm:text-xs font-black text-[#E8F5E9] hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-sans shrink-0"
              >
                Sign In
              </button>
              
              <button
                onClick={onSignIn}
                className="text-[11px] sm:text-xs font-extrabold bg-[#1B4D3E] hover:bg-[#12352B] hover:scale-[1.02] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-[10px] sm:rounded-[15px] cursor-pointer shadow-lg shadow-[#1B4D3E]/20 active:scale-95 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-white hidden xs:block" />
              </button>
            </div>
          </div>
        </nav>

        {/* Glowing glassmorphism & background gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#4CAF50]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/5 right-1/10 w-80 h-80 bg-[#E8F5E9]/5 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Hero Left Content Accent Block */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col justify-center">
              
              {/* Premium College Incubated Badge */}
              <div className="inline-flex self-center lg:self-start items-center gap-1.5 bg-[#E8F5E9]/15 border border-[#4CAF50]/20 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide text-[#E8F5E9] uppercase select-none shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#4CAF50] shrink-0 animate-pulse" />
                <span>Next-Gen Sphoorthy College Marketplace</span>
              </div>

              {/* Mega Heavy Premium Headings */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-[72px] font-display font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.08]">
                  Order Food & Essentials.<br />
                  Discover Campus Stores.<br />
                  <span className="text-[#4CAF50] relative inline-block">
                    CampusBites It.
                    <span className="absolute left-0 bottom-2 w-full h-1 bg-[#4CAF50]/40 rounded-full" />
                  </span>
                </h1>
                
                <p className="text-xs sm:text-base md:text-lg text-slate-200 mt-2 font-semibold max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Everything students need inside campus. Fresh meals, snacks, stationery, printouts, and essentials delivered faster.
                </p>
              </div>

              {/* Swiggy-like Dual Input Search Container */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mt-8 relative z-30">
                <div className="flex flex-col sm:flex-row items-stretch bg-white/10 hover:bg-white/15 focus-within:bg-white focus-within:text-[#1E293B] rounded-2xl border border-white/20 focus-within:border-white/40 shadow-lg backdrop-blur-md transition-all duration-300 overflow-hidden">
                  
                  {/* Left Side: Campus Block selector */}
                  <div className="relative flex items-center px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-white/10 focus-within:border-slate-200 shrink-0 select-none cursor-pointer group/loc min-w-[170px] sm:max-w-[200px]">
                    <MapPin className="w-4 h-4 text-[#4CAF50] shrink-0 mr-2" />
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-white focus-within:text-[#1E293B] outline-none cursor-pointer pr-4 appearance-none w-full border-none"
                    >
                      <option className="text-slate-900 bg-white" value="Sphoorthy Camp">Sphoorthy Camp</option>
                      <option className="text-slate-900 bg-white" value="Block A">Block A (Main)</option>
                      <option className="text-slate-900 bg-white" value="Block B">Block B (Lounge)</option>
                      <option className="text-slate-900 bg-white" value="Library Hub">Library Hub</option>
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-white/60 focus-within:text-[#1E293B]/60 absolute right-3 pointer-events-none rotate-90" />
                  </div>

                  {/* Right Side: Main Search input */}
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder="Search food, snacks, stationery, stores..."
                      className="w-full pl-5 pr-12 py-3.5 sm:py-4 bg-transparent text-white focus:text-[#1E293B] placeholder:text-slate-355 focus:placeholder:text-slate-400 focus:outline-none text-sm sm:text-base font-semibold border-none"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 text-[#E8F5E9] focus-within:text-[#1E293B]/80 hover:text-white shrink-0 p-1.5 cursor-pointer"
                    >
                      <Search className="w-5 h-5 text-[#4CAF50] hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-10 w-full">
                
                {/* Card 1: Food Delivery */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={onSignIn}
                  className="cursor-pointer bg-white rounded-[24px] p-5 shadow-lg flex flex-col justify-between h-[180px] sm:h-[200px] border border-white/10 hover:border-[#4CAF50]/30 transition-all duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-28 sm:h-28 bg-[#E8F5E9]/60 rounded-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform" />
                  <div className="absolute right-2 bottom-2 text-4xl sm:text-5xl">🍔</div>
                  
                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-black uppercase text-[#1B4D3E] tracking-wider">Food Delivery</span>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">Fresh meals from campus canteens</h3>
                    <div className="inline-block bg-[#E8F5E9] text-[#1B4D3E] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                      Fresh & Hot
                    </div>
                  </div>

                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>

                {/* Card 2: Campus Store */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={onSignIn}
                  className="cursor-pointer bg-white rounded-[24px] p-5 shadow-lg flex flex-col justify-between h-[180px] sm:h-[200px] border border-white/10 hover:border-[#4CAF50]/30 transition-all duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-28 sm:h-28 bg-[#E8F5E9]/60 rounded-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform" />
                  <div className="absolute right-2 bottom-2 text-4xl sm:text-5xl">🛒</div>

                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-black uppercase text-[#1B4D3E] tracking-wider">Campus Store</span>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">Stationery and daily essentials</h3>
                    <div className="inline-block bg-[#E8F5E9] text-[#1B4D3E] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                      Student Rates
                    </div>
                  </div>

                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>

                {/* Card 3: Print & Services */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={onSignIn}
                  className="cursor-pointer bg-white rounded-[24px] p-5 shadow-lg flex flex-col justify-between h-[180px] sm:h-[200px] border border-white/10 hover:border-[#4CAF50]/30 transition-all duration-300 relative overflow-hidden group select-none text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-28 sm:h-28 bg-[#E8F5E9]/60 rounded-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform" />
                  <div className="absolute right-2 bottom-2 text-4xl sm:text-5xl">🖨️</div>

                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-black uppercase text-[#1B4D3E] tracking-wider">Print & Hub</span>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">Printouts, records & academic services</h3>
                    <div className="inline-block bg-[#E8F5E9] text-[#1B4D3E] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                      Instant Copy
                    </div>
                  </div>

                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors mt-auto">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>

              </div>

            </div>

            {/* Hero Right visual column: Premium marketplace showcase */}
            <div className="hidden lg:flex col-span-1 lg:col-span-5 relative h-[500px] items-center justify-center select-none overflow-visible">
              
              {/* Central Pulsating Halo Backdrops */}
              <div className="absolute w-[400px] h-[400px] rounded-full bg-radial from-[#4CAF50]/20 to-transparent blur-3xl pointer-events-none" />

              {/* Large Glassmorphism Card */}
              <div 
                className="w-full max-w-[380px] h-[380px] rounded-[48px] shadow-2xl backdrop-blur-[20px] border flex flex-col items-center justify-center relative overflow-visible text-center p-8 transition-all duration-500 hover:border-white/25"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Center Content */}
                <div className="space-y-4 relative z-10 max-w-[280px]">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-white text-xl tracking-tight uppercase leading-tight">
                      SPHN Campus Marketplace
                    </h3>
                    <p className="text-xs text-[#A2C2B9] mt-2 font-medium leading-relaxed">
                      Discover food, drinks, files, records, and exam prep tools right inside Sphoorthy.
                    </p>
                  </div>
                </div>

                {/* Floating animated product cards around the center */}
                
                {/* 1. Burger (🍔) */}
                <motion.div 
                  animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute -top-[12%] -left-[10%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 cursor-pointer max-w-[170px]"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🍔</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-850 text-[11px] whitespace-nowrap">Canteen Burger</h4>
                    <span className="text-[10px] font-bold text-slate-450 font-mono">₹45</span>
                  </div>
                </motion.div>

                {/* 2. Coffee (☕) */}
                <motion.div 
                  animate={{ y: [0, 12, 0], x: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute top-[20%] -right-[15%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 cursor-pointer max-w-[170px]"
                >
                  <div className="w-10 h-10 bg-[#EBF7F2] rounded-xl flex items-center justify-center text-2xl shrink-0">☕</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-855 text-[11px] whitespace-nowrap">Cold Brew</h4>
                    <span className="text-[10px] font-bold text-slate-450 font-mono">₹35</span>
                  </div>
                </motion.div>

                {/* 3. Notebook (📚) */}
                <motion.div 
                  animate={{ y: [0, -14, 0], x: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute -bottom-[10%] -left-[5%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 cursor-pointer max-w-[175px]"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">📚</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-855 text-[11px] whitespace-nowrap">Lab Record</h4>
                    <span className="text-[10px] font-bold text-slate-450 font-mono">₹25</span>
                  </div>
                </motion.div>

                {/* 4. Pen (🖊️) */}
                <motion.div 
                  animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute -top-[5%] -right-[5%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-2.5 shadow-lg flex items-center gap-2.5 cursor-pointer max-w-[130px]"
                >
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xl shrink-0">🖊️</div>
                  <div className="text-left min-w-0 leading-tight">
                    <h4 className="font-bold text-slate-855 text-[10px] truncate">Drawing Pen</h4>
                    <span className="text-[9px] font-bold text-slate-450 font-mono">₹10</span>
                  </div>
                </motion.div>

                {/* 5. Print Service (🖨️) */}
                <motion.div 
                  animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute bottom-[35%] -left-[18%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 cursor-pointer max-w-[170px]"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🖨️</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-855 text-[11px] whitespace-nowrap">Print Service</h4>
                    <span className="text-[10px] font-bold text-slate-450 font-mono">Fast Copy</span>
                  </div>
                </motion.div>

                {/* 6. Snacks (🍟) */}
                <motion.div 
                  animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  onClick={onSignIn}
                  className="absolute -bottom-[8%] -right-[8%] bg-white/95 backdrop-blur-md border border-slate-100/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 cursor-pointer max-w-[170px]"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🍟</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-855 text-[11px] whitespace-nowrap">Hot Snacks</h4>
                    <span className="text-[10px] font-bold text-[#4CAF50] font-mono">₹20</span>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Featured SPHN Categories (Horizontal layout scroll) */}
      <section className="bg-[#E8F5E9]/30 py-16 w-full rounded-t-[32px] sm:rounded-t-[48px] -mt-6 relative z-20 border-t border-slate-100 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <h2 className="text-2xl font-display font-black text-[#1B4D3E] tracking-tight">
                Featured Categories
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wide">Ready for dispatch in secondary canteens & hubs</p>
            </div>
            
            <button 
              onClick={onSignIn}
              className="text-xs font-black text-[#1B4D3E] hover:text-[#2E7D5A] flex items-center gap-1 cursor-pointer"
            >
              See All Items ({categories.length} sections)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Categories Grid (Click triggers Sign-in callback) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={onSignIn}
                className="group cursor-pointer bg-white hover:bg-white border border-slate-100 hover:border-[#1B4D3E] p-5 rounded-2xl text-center shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center space-y-3"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1B4D3E] tracking-tight leading-none group-hover:text-[#4CAF50] transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase font-mono">{cat.count}</p>
                </div>
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
