import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, Clock, Star, Plus, Minus, ChevronLeft, ChevronRight, Edit3, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem } from '../types';

interface TodaysSpecialsSliderProps {
  items: FoodItem[];
  cart: { [key: string]: number };
  onUpdateCart: (item: FoodItem, quantity: number) => void;
  userRole?: 'customer' | 'admin';
  onGoToAdmin?: () => void;
}

export function TodaysSpecialsSlider({
  items,
  cart,
  onUpdateCart,
  userRole,
  onGoToAdmin
}: TodaysSpecialsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  // Filter items that have isTodaySpecial = true
  let specials = items.filter(it => it.isTodaySpecial === true);

  // Fallback if no items are currently toggled as special by the admin
  const isFallback = specials.length === 0;
  if (isFallback) {
    // Recommend top-rated or available items
    specials = items
      .filter(it => it.isAvailable)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }

  // Handle Autoplay rotation
  useEffect(() => {
    if (specials.length <= 1) return;

    if (!isHovered) {
      autoplayTimer.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % specials.length);
      }, 5000);
    }

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [specials.length, isHovered]);

  // Handle index boundaries during array change
  useEffect(() => {
    if (currentIndex >= specials.length) {
      setCurrentIndex(0);
    }
  }, [specials.length, currentIndex]);

  if (specials.length === 0) {
    return null; // Don't show if empty or missing data
  }

  const activeItem = specials[currentIndex];
  const cartQty = cart[activeItem.id] || 0;

  const isVeg =
    activeItem.tags?.includes('Vegetarian') ||
    activeItem.category === 'Desserts' ||
    activeItem.category === 'Beverages' ||
    activeItem.id.includes('bev') ||
    activeItem.id.includes('veg');

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % specials.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + specials.length) % specials.length);
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden select-none mb-6 relative w-full text-slate-800 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="todays-specials-featured-slider"
    >
      {/* Top Slider Header Badge / Controls Bar */}
      <div className="bg-gradient-to-r from-[#1B4D3E]/5 via-[#4CAF50]/5 to-transparent px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs animate-bounce">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div className="flex items-center gap-1.5 py-1">
            <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-tight uppercase">
              {isFallback ? "🔥 Today's Staff Picks" : "🔥 Today's Chef Specials"}
            </h2>
            {isFallback && (
              <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full uppercase">
                Featured Recommendations
              </span>
            )}
          </div>
        </div>

        {/* Administration quick trigger */}
        <div className="flex items-center gap-2">
          {userRole === 'admin' && onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-50 hover:text-[#1B4D3E] transition-all"
              title="Toggle specials in the Admin Canteen catalogue"
            >
              <Edit3 className="w-3 h-3" />
              <span>Modify Daily Deals</span>
            </button>
          )}

          {specials.length > 1 && (
            <div className="flex gap-1.5">
              <button
                onClick={handlePrev}
                className="h-7 w-7 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="h-7 w-7 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Slide Carousel Area */}
      <div className="px-4 sm:px-6 py-5">
        <div className="relative overflow-hidden min-h-[160px] md:min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ 
                type: "spring",
                stiffness: 130,
                damping: 18,
                mass: 0.8
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
            >
              {/* Left Column: Image wrapper */}
              <div className="md:col-span-4 relative">
                <div className="h-32 sm:h-36 w-full rounded-2xl overflow-hidden shadow-xs border border-slate-100 flex items-center justify-center bg-slate-50 relative">
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=80';
                    }}
                  />
                  
                  {/* Floating tags */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    <span className="bg-[#1B4D3E] text-white font-extrabold text-[8px] uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse fill-current" />
                      SPHN PICK
                    </span>
                  </div>

                  {/* Veg Indicator */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center p-[2px] bg-white shadow-xs ${
                      isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`} title={isVeg ? 'Vegetarian' : 'Contains Non-Vegetarian'}>
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isVeg ? 'bg-emerald-600' : 'bg-rose-600 rotate-45 rounded-sm'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Menu details */}
              <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3 md:space-y-0 md:pl-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded mr-1">
                      {activeItem.category}
                    </span>
                    {activeItem.rating && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-650 font-black text-amber-500 bg-amber-50/70 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" />
                        {activeItem.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {activeItem.estimatedPrepTime}m prep
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight uppercase">
                    {activeItem.name}
                  </h3>
                  
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xl font-medium">
                    {activeItem.description || "Freshly cooked to order using state-of-the-art kitchen equipment. Served hot to keep you energised throughout study lectures."}
                  </p>
                </div>

                {/* Pricing & Interactive Direct Cart adder */}
                <div className="flex items-center justify-between gap-4 pt-3.5 border-t border-slate-100 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#4CAF50] block mt-0.5 font-mono">Special price</span>
                    <strong className="text-[#1B4D3E] font-sans font-black text-lg sm:text-xl">
                      ₹{activeItem.price}
                    </strong>
                  </div>

                  {/* Quantity Controller / Adder */}
                  <div>
                    {cartQty > 0 ? (
                      <div className="inline-flex items-center bg-[#1B4D3E] rounded-xl text-white px-3 py-1.5 text-xs font-black select-none shadow-sm gap-3">
                        <button
                          onClick={() => onUpdateCart(activeItem, cartQty - 1)}
                          className="text-white hover:text-emerald-300 h-5 w-5 flex items-center justify-center text-sm font-black bg-transparent border-none cursor-pointer outline-none transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-4 text-center font-bold font-mono">{cartQty}</span>
                        <button
                          onClick={() => onUpdateCart(activeItem, cartQty + 1)}
                          className="text-white hover:text-emerald-300 h-5 w-5 flex items-center justify-center text-sm font-black bg-transparent border-none cursor-pointer outline-none transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onUpdateCart(activeItem, 1)}
                        className="inline-flex items-center gap-1 border-2 border-emerald-500 hover:bg-[#1B4D3E] hover:text-white text-[#1B4D3E] px-4.5 py-1.5 text-xs font-black rounded-xl cursor-pointer select-none transition-all duration-200 active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Dots/Pagers representation */}
      {specials.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4.5 mt-1.5">
          {specials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none outline-none ${
                i === currentIndex ? 'w-5 bg-[#1B4D3E]' : 'w-1.5 bg-slate-200 hover:bg-slate-350'
              }`}
              title={`Switch to special slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
