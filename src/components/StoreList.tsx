import React, { useState } from 'react';
import { 
  Utensils, Coffee, PenTool, Printer, BookOpen, FlaskConical, Sparkles, 
  Star, Clock, Tag, Search, ArrowRight, ShieldCheck, MapPin 
} from 'lucide-react';
import { motion } from 'motion/react';

interface Store {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  category: string;
  offerBadge: string;
  location: string;
  description: string;
}

interface StoreListProps {
  onSelectStore: (storeId: string) => void;
}

export function StoreList({ onSelectStore }: StoreListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('All');

  // Modern category icons data details
  const categoryIcons = [
    { name: 'All', icon: Utensils, label: 'All Items' },
    { name: 'Food', icon: Utensils, label: 'Food Cravings' },
    { name: 'Beverages', icon: Coffee, label: 'Beverages & Chai' },
    { name: 'Stationery', icon: PenTool, label: 'Stationery Items' },
    { name: 'Printouts', icon: Printer, label: 'Printouts Hub' },
    { name: 'Books', icon: BookOpen, label: 'College Books' },
    { name: 'Lab Materials', icon: FlaskConical, label: 'Lab Kits' },
    { name: 'Essentials', icon: Sparkles, label: 'Daily Essentials' },
  ];

  // Store data list
  const stores: Store[] = [
    {
      id: 'canteen_cafe',
      name: 'Campus Central Cafe',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      rating: 4.8,
      deliveryTime: '10 mins',
      category: 'Food',
      offerBadge: '20% OFF',
      location: 'Block B Dining Hall',
      description: 'Hot sizzling South Indian treats, authentic meals, and deep fried campus delicacies.'
    },
    {
      id: 'block_b_lounge',
      name: 'Block-B Juice & Coffee Lounge',
      imageUrl: 'https://images.unsplash.com/photo-1541167750496-1628856ab772?w=500',
      rating: 4.6,
      deliveryTime: '5 mins',
      category: 'Beverages',
      offerBadge: 'FREE Coffee above ₹150',
      location: 'Block B Ground Floor',
      description: 'Freshly grounded filter coffee, dynamic fruit juices, milkshakes, and sweet cupcakes.'
    },
    {
      id: 'books_depot',
      name: 'Sphoorthy Book & Stationery Depot',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
      rating: 4.7,
      deliveryTime: '8 mins',
      category: 'Stationery',
      offerBadge: '10% OFF on Lab Manuals',
      location: 'Academic Admin Block A',
      description: 'Authorized engineering charts, lab manuals, dynamic pensets, draftings records and tools.'
    }
  ];

  // Filtering filter logic
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          store.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIcon = selectedIconCategory === 'All' || 
                        store.category.toLowerCase() === selectedIconCategory.toLowerCase() ||
                        // fallback helper mapping
                        (selectedIconCategory === 'Books' && store.category === 'Stationery') ||
                        (selectedIconCategory === 'Lab Materials' && store.category === 'Stationery');
                        
    return matchesSearch && matchesIcon;
  });

  return (
    <div id="store-list-page" className="space-y-8 text-left">
      
      {/* 1. Category Icons Carousel Section */}
      <div className="space-y-4">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-[#4CAF50] font-black uppercase tracking-wider font-mono">What would you like to request?</span>
          <h3 className="font-display font-black text-slate-800 text-lg md:text-xl tracking-tight leading-none">College Marketplace Verticals</h3>
        </div>

        {/* Dynamic Monochrome green category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryIcons.map(cat => {
            const IconComp = cat.icon;
            const isSelected = selectedIconCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedIconCategory(cat.name)}
                className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2.5 hover:shadow-md hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white shadow-sm shadow-[#1B4D3E]/20'
                    : 'bg-white border-slate-100 text-[#1B4D3E]'
                }`}
              >
                <div className={`p-2.5 rounded-full ${isSelected ? 'bg-white/10 text-white' : 'bg-[#E8F5E9] text-[#1B4D3E]'}`}>
                  <IconComp className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className={`text-xs font-black tracking-tight block ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Stores Filter and Search bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search stores, canteen stalls, lounge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 border border-slate-150 outline-none focus:border-[#1B4D3E] focus:bg-white rounded-full font-semibold text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="text-[11px] font-mono font-bold text-[#4CAF50] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full border border-[#4CAF50]/15 uppercase shrink-0">
          Showing {filteredStores.length} Verified Outlets
        </div>
      </div>

      {/* 3. Sweeping Grid display */}
      <div className="space-y-4">
        <h4 className="font-display font-black text-slate-800 text-base md:text-lg tracking-tight">Outlets around Sphoorthy Campus</h4>
        
        {filteredStores.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-[#F2F7F5] rounded-full flex items-center justify-center mx-auto text-[#1B4D3E]">
              <Search className="w-6 h-6" />
            </div>
            <h5 className="font-display font-black text-slate-800 text-sm">No campus store matches</h5>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">Try checking your spelling or looking into other SPHN marketplace categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store.id)}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Image & Banner badge */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Swiggy style floating offer badge */}
                  <div className="absolute bottom-3 left-3 bg-[#1B4D3E] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                    <Tag className="w-3.5 h-3.5" />
                    {store.offerBadge}
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 text-left space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                        {store.category} Outlet
                      </span>
                      <span className="text-[9px] uppercase font-mono font-bold text-[#4CAF50] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#4CAF50]/15">
                        Verified SPHN
                      </span>
                    </div>

                    <h5 className="font-display font-black text-slate-800 text-base md:text-lg tracking-tight group-hover:text-[#4CAF50] transition-colors leading-snug">
                      {store.name}
                    </h5>
                    
                    <p className="text-slate-450 text-slate-505 text-xs line-clamp-2 leading-relaxed font-medium">
                      {store.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    {/* Star & time badges */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-[#E8F5E9] text-[#1B4D3E] rounded px-2 py-0.5 text-xs font-black font-mono">
                        <Star className="w-3.5 h-3.5 fill-[#1B4D3E] stroke-none" />
                        <span>{store.rating}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                        <span>{store.deliveryTime} prep</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#1B4D3E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Check Tray <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
