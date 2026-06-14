import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  Coffee, 
  Notebook, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  CreditCard,
  ShoppingBag,
  Star,
  Flame,
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

  // Swiggy style popular campus venues with realistic badges
  const popularStores = [
    {
      name: "Sphoorthy Central Cafe",
      category: "North Indian • Chinese • South Indian • Fast Food",
      rating: "4.8",
      time: "10-15 Min",
      tag: "Best Seller",
      image: "🍔",
      color: "bg-[#E8F5E9]"
    },
    {
      name: "Student Stationery Emporium",
      category: "Record Books • Lab Kits • Geometry Essentials • Printing",
      rating: "4.9",
      time: "5-10 Min",
      tag: "Academic Hub",
      image: "📚",
      color: "bg-[#F3F4F6]"
    },
    {
      name: "Block-B Coffee Lounge",
      category: "Cold Brews • Hot Tea • Premium Pastries • Puffs",
      rating: "4.7",
      time: "8-12 Min",
      tag: "Student Favorite",
      image: "☕",
      color: "bg-[#EBF7F2]"
    }
  ];

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
                className="text-[11px] sm:text-xs font-extrabold bg-[#4CAF50] hover:bg-[#45a049] hover:scale-[1.02] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-[10px] sm:rounded-[15px] cursor-pointer shadow-lg shadow-[#1B4D3E]/20 active:scale-95 transition-all flex items-center gap-1.5 border border-[#4CAF50]/15 shrink-0"
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
            <div className="col-span-1 lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col justify-center">
              
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
                  Everything students need inside campus. Fresh meals, snacks, stationery, printouts, and essentials delivered faster than standing in line.
                </p>
              </div>



            </div>

            {/* Hero Right visual column: Dynamic floating marketplace illustration cards */}
            <div className="hidden md:flex col-span-1 lg:col-span-6 relative h-[450px] md:h-[550px] lg:h-[600px] items-center justify-center select-none overflow-hidden">
              
              {/* Central Pulsating Halo Backdrops */}
              <div className="absolute w-[300px] md:w-[450px] h-[300px] md:h-[450px] rounded-full bg-radial from-[#4CAF50]/15 to-transparent blur-3xl" />
              <div className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] rounded-full bg-[#E8F5E9]/5 blur-2xl" />

              {/* Card 1: Burger Card (🍔) */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                whileHover={{ scale: 1.05, zIndex: 30 }}
                onClick={onSignIn}
                className="absolute top-[5%] left-[8%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 cursor-pointer max-w-[200px] transition-all"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-3xl shrink-0">🍔</div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold uppercase text-[#2E7D5A] tracking-wider leading-none">Canteen Grill</span>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-0.5 whitespace-nowrap">Spicy Crispy Burger</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">₹45</span>
                    <span className="text-[9px] font-black text-[#4CAF50] bg-[#E8F5E9] px-1 py-0.5 rounded uppercase font-sans">★ 4.8</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Coffee Card (☕) */}
              <motion.div 
                animate={{ y: [0, 14, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.05, zIndex: 30 }}
                onClick={onSignIn}
                className="absolute top-[32%] right-[2%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 cursor-pointer max-w-[200px] transition-all"
              >
                <div className="w-12 h-12 bg-[#EBF7F2] rounded-xl flex items-center justify-center text-3xl shrink-0">☕</div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold uppercase text-[#2E7D5A] tracking-wider leading-none">Block-B Lounge</span>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-0.5 whitespace-nowrap">Cold Brew Coffee</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">₹35</span>
                    <span className="text-[9px] font-black text-[#4CAF50] bg-[#E8F5E9] px-1 py-0.5 rounded uppercase font-sans">★ 4.9</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Notebook Card (📚) */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                whileHover={{ scale: 1.05, zIndex: 30 }}
                onClick={onSignIn}
                className="absolute bottom-[10%] left-[5%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 cursor-pointer max-w-[210px] transition-all"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-3xl shrink-0">📚</div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold uppercase text-[#2E7D5A] tracking-wider leading-none">SPHN Book Store</span>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-0.5 whitespace-nowrap">B.Tech Lab Record</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">₹25</span>
                    <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1 py-0.5 rounded uppercase font-sans">Required</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Pen Card (🖊️) */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.05, zIndex: 30 }}
                onClick={onSignIn}
                className="absolute top-[8%] right-[10%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-3 shadow-lg flex items-center gap-2.5 cursor-pointer max-w-[150px] transition-all"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🖊️</div>
                <div className="text-left min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs mt-0.5 truncate uppercase font-sans">Drawing Pen</h4>
                  <p className="text-[10px] font-bold text-slate-450 font-mono">₹10 • Fast Pack</p>
                </div>
              </motion.div>



              {/* Big central beautiful food illustrations background container */}
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-xs flex items-center justify-center relative overflow-hidden text-center p-8">
                <div className="space-y-4">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#4CAF50]/15 rounded-full blur-xl" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                  
                  <ShoppingBag className="w-20 h-20 text-[#4CAF50] mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-display font-black text-white text-lg tracking-tight uppercase">SPHN Campus Marketplace</h3>
                    <p className="text-xs text-[#A2C2B9] mt-1 font-medium px-4">Everything students need from sizzling canteen meals to stationary supplies instantly.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Service Cards (Three large bento grid cards below hero) */}
      <section className="bg-white py-16 w-full -mt-4 relative z-20 rounded-t-[32px] sm:rounded-t-[48px] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-display font-black tracking-tight text-[#1B4D3E]">
              What would you like to do?
            </h2>
            <p className="text-xs text-[#2E7D5A] font-bold uppercase tracking-widest">
              Instant pickup solutions customized for Sphoorthy Campus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Food Delivery */}
            <div 
              onClick={onSignIn}
              className="group cursor-pointer bg-white hover:bg-white border border-[#E8F5E9] hover:border-[#1B4D3E] p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              {/* Image Circle Background */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#E8F5E9]/50 rounded-bl-[100px] shrink-0 -z-10 group-hover:bg-[#E8F5E9] transition-all" />

              <div className="space-y-4 pt-4">
                <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#E8F5E9] text-[#1B4D3E] px-2.5 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                  Most Popular
                </div>

                <div className="space-y-2">
                  <div className="text-4xl text-slate-850">🍔</div>
                  <h3 className="font-display font-black text-[#1B4D3E] text-2xl tracking-tight leading-tight uppercase mt-2">
                    Food Delivery
                  </h3>
                  <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed">
                    Order fresh, steaming hot culinary dishes from the main canteens instantly. No queues, pay digitally, and fetch when token buzzes!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-[#1B4D3E] group-hover:text-[#4CAF50] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                  Browse Menu Catalogue
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="h-8 w-8 rounded-full bg-[#1B4D3E] group-hover:bg-[#4CAF50] text-white flex items-center justify-center font-bold font-mono text-xs transition-transform group-hover:scale-110">
                  →
                </span>
              </div>
            </div>

            {/* Card 2: Campus Bookstore */}
            <div 
              onClick={onSignIn}
              className="group cursor-pointer bg-white hover:bg-white border border-[#E8F5E9] hover:border-[#1B4D3E] p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#E8F5E9]/50 rounded-bl-[100px] shrink-0 -z-10 group-hover:bg-[#E8F5E9] transition-all" />

              <div className="space-y-4 pt-4">
                <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#E8F5E9] text-[#1B4D3E] px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                  10 Minute Delivery
                </div>

                <div className="space-y-2">
                  <div className="text-4xl text-slate-850">📚</div>
                  <h3 className="font-display font-black text-[#1B4D3E] text-2xl tracking-tight leading-tight uppercase mt-2">
                    Campus Store
                  </h3>
                  <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed">
                    Secure books, geometric kits, lab manuals, official white papers, premium pens, highlighters, and scientific calculators immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-[#1B4D3E] group-hover:text-[#4CAF50] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                  Explore Bookstore
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="h-8 w-8 rounded-full bg-[#1B4D3E] group-hover:bg-[#4CAF50] text-white flex items-center justify-center font-bold font-mono text-xs transition-transform group-hover:scale-110">
                  →
                </span>
              </div>
            </div>

            {/* Card 3: Queue-Free Pickup */}
            <div 
              onClick={onSignIn}
              className="group cursor-pointer bg-white hover:bg-white border border-[#E8F5E9] hover:border-[#1B4D3E] p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#E8F5E9]/50 rounded-bl-[100px] shrink-0 -z-10 group-hover:bg-[#E8F5E9] transition-all" />

              <div className="space-y-4 pt-4">
                <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#E8F5E9] text-[#1B4D3E] px-2.5 py-1 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                  Skip Waiting
                </div>

                <div className="space-y-2">
                  <div className="text-4xl text-slate-850">☕</div>
                  <h3 className="font-display font-black text-[#1B4D3E] text-2xl tracking-tight leading-tight uppercase mt-2">
                    Queue-Free Pickup
                  </h3>
                  <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed">
                    On your way to block B? Reserve beverages or records. Instantly capture your generated tokens and scoop them without standard wait cycles.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-[#1B4D3E] group-hover:text-[#4CAF50] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                  Advance Pre-Ordering
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="h-8 w-8 rounded-full bg-[#1B4D3E] group-hover:bg-[#4CAF50] text-white flex items-center justify-center font-bold font-mono text-xs transition-transform group-hover:scale-110">
                  →
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Featured SPHN Categories (Horizontal layout scroll) */}
      <section className="bg-[#E8F5E9]/30 py-16 w-full border-y border-slate-100 select-none">
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

      {/* 7. Popular SPHN Stores Section (Swiggy restaurant style layout) */}
      <section className="bg-white py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-black text-[#1B4D3E] tracking-tight">
              Popular SPHN Stores
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top-rated campus suppliers for engineering student kits & food</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularStores.map((store, idx) => (
              <div 
                key={idx}
                onClick={onSignIn}
                className="group cursor-pointer bg-[#F8FAFC]/60 hover:bg-white border border-slate-100 hover:border-[#1B4D3E]/30 rounded-[28px] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                
                {/* Simulated Store Hero banner */}
                <div className={`h-36 ${store.color} flex items-center justify-center relative`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">{store.image}</span>
                  
                  {/* Floating Absolute SPHN Store Badge */}
                  <span className="absolute top-3 left-3 text-[9px] font-black text-white bg-[#1B4D3E] px-2.5 py-1 rounded-md tracking-wider uppercase shadow-sm">
                    {store.tag}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-black text-slate-900 group-hover:text-[#1B4D3E] transition-colors leading-tight text-base sm:text-lg">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {store.category}
                    </p>
                  </div>

                  {/* SPHN Badges (Swiggy format) */}
                  <div className="flex items-center gap-4 text-xs font-bold font-mono border-t border-slate-100 pt-3 text-slate-500">
                    <span className="flex items-center gap-1 text-[#2E7D5A]">
                      <Star className="w-3.5 h-3.5 fill-current text-[#4CAF50]" />
                      {store.rating}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {store.time}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] uppercase font-black bg-[#EBF7F2] text-[#1B4D3E] px-1.5 py-0.5 rounded">
                      SPHN HUB
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>



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
