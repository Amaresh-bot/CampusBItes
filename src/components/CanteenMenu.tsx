import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, Star, Flame, Tag, Check, ShoppingBag, Grid, HelpCircle, SlidersHorizontal, Mic, MessageSquare, ThumbsUp, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Order } from '../types';

interface CanteenMenuProps {
  items: FoodItem[];
  cart: { [key: string]: number };
  onUpdateCart: (item: FoodItem, quantity: number) => void;
  filteredStoreId?: string | null;
  onClearStoreFilter?: () => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  vegetarianOnly?: boolean;
  setVegetarianOnly?: (veg: boolean) => void;
  hideSearchHeader?: boolean;
  orders?: Order[];           // user's orders for review eligibility check
  currentUserId?: string;     // logged-in user id
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

export function CanteenMenu({ 
  items, 
  cart, 
  onUpdateCart, 
  filteredStoreId, 
  onClearStoreFilter,
  selectedCategory: propCategory,
  setSelectedCategory: propSetCategory,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  vegetarianOnly: propVegetarianOnly,
  setVegetarianOnly: propSetVegetarianOnly,
  hideSearchHeader = false,
  orders = [],
  currentUserId,
}: CanteenMenuProps) {
  const [localCategory, localSetCategory] = useState<string>('All');
  const [localSearchQuery, localSetSearchQuery] = useState<string>('');
  const [localVegetarianOnly, localSetVegetarianOnly] = useState<boolean>(false);

  // Reviews state: map of itemId → reviews array
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [reviewFormItem, setReviewFormItem] = useState<string | null>(null); // item id with open form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');

  const fetchReviews = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/menu/${itemId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviewsMap(prev => ({ ...prev, [itemId]: data || [] }));
      }
    } catch (_) {}
  }, []);

  const handleToggleReviews = (itemId: string) => {
    const willExpand = !expandedReviews[itemId];
    setExpandedReviews(prev => ({ ...prev, [itemId]: willExpand }));
    if (willExpand && !reviewsMap[itemId]) {
      fetchReviews(itemId);
    }
  };

  const handleSubmitReview = async (itemId: string) => {
    if (!currentUserId) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/menu/${itemId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, rating: reviewRating, review: reviewText }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setReviewFormItem(null);
        setReviewText('');
        setReviewRating(5);
        fetchReviews(itemId); // refresh reviews
      } else {
        setReviewError(data.error || data.message || 'Failed to submit review');
      }
    } catch (e) {
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Check if current user has a Completed order for a given itemId
  const hasCompletedOrderForItem = useCallback((itemId: string): boolean => {
    if (!currentUserId || orders.length === 0) return false;
    return orders.some(o =>
      o.status === 'Completed' &&
      o.userId === currentUserId &&
      o.items.some((oi: any) => oi.id === itemId || oi.itemId === itemId || oi.name === items.find(i => i.id === itemId)?.name)
    );
  }, [orders, currentUserId, items]);


  const selectedCategory = propCategory !== undefined ? propCategory : localCategory;
  const setSelectedCategory = propSetCategory !== undefined ? propSetCategory : localSetCategory;

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : localSetSearchQuery;

  const vegetarianOnly = propVegetarianOnly !== undefined ? propVegetarianOnly : localVegetarianOnly;
  const setVegetarianOnly = propSetVegetarianOnly !== undefined ? propSetVegetarianOnly : localSetVegetarianOnly;

  // Rotating Placeholders for Swiggy-style Search Bar
  const searchPlaceholders = [
    "Search for 'Cake'",
    "Search for 'Burger'",
    "Search for 'Chai'",
    "Search for 'Hot Coffee'",
    "Search for 'Samosa'",
    "Search for 'Notebook'",
    "Search for 'Dosa'",
    "Search for 'Cold Coffee'",
    "Search for 'Biryani'"
  ];
  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPlaceholderIdx(prev => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Auto-set category if a store is filtered
  useEffect(() => {
    if (filteredStoreId) {
      if (filteredStoreId === 'canteen_cafe') {
        setSelectedCategory('Breakfast');
      } else if (filteredStoreId === 'books_depot') {
        setSelectedCategory('Stationery');
      } else if (filteredStoreId === 'block_b_lounge') {
        setSelectedCategory('Beverages');
      } else {
        setSelectedCategory('All');
      }
    }
  }, [filteredStoreId]);

  // Derive unique categories
  const categories = ['All', 'Breakfast', 'Meals', 'Beverages', 'Snacks', 'Desserts'];

  // Filtering filter logic
  const filteredItems = items.filter(item => {
    // Category check
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      matchesCategory = item.category.toLowerCase() === selectedCategory.toLowerCase();
    }

    // Secondary Filter from Store selection
    let matchesStore = true;
    if (filteredStoreId) {
      if (filteredStoreId === 'canteen_cafe') {
        matchesStore = ['Breakfast', 'Meals', 'Snacks', 'Desserts'].includes(item.category);
      } else if (filteredStoreId === 'books_depot' || filteredStoreId === 'print_hub') {
        matchesStore = ['Stationery', 'Books', 'Lab Materials'].includes(item.category) || item.name.toLowerCase().includes('notebook') || item.name.toLowerCase().includes('pen');
      } else if (filteredStoreId === 'block_b_lounge') {
        matchesStore = ['Beverages', 'Desserts'].includes(item.category);
      }
    }

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const isVeg = item.tags?.includes('Vegetarian') || item.category === 'Desserts' || item.category === 'Beverages' || (item.id && item.id.includes('bev')) || (item.id && item.id.includes('veg'));
    const isVegMatches = !vegetarianOnly || isVeg;
    
    return matchesCategory && matchesStore && matchesSearch && isVegMatches;
  });

  return (
    <div id="canteen-menu" className="space-y-6">
      
      {/* 1. Sticky Category Pills & Search Container */}
      {!hideSearchHeader && (
        <div className="sticky top-[80px] z-30 bg-[#F2F7F5]/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="space-y-3">
            {/* Swiggy-Style Search Input & Veg Filter Row */}
            <div className="flex gap-3 items-center">
              {/* Search Card */}
              <div className="flex-1 relative shadow-md rounded-[20px] bg-white border border-slate-100 flex items-center h-[54px] focus-within:ring-2 focus-within:ring-[#1B4D3E]/20 transition-all duration-300 px-4">
                <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder={searchPlaceholders[currentPlaceholderIdx]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none border-none text-sm font-semibold text-slate-800 placeholder-slate-400/90"
                />
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="font-bold text-xs text-slate-400 hover:text-slate-600 transition-colors uppercase cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                ) : (
                  <div className="flex items-center shrink-0">
                    <div className="w-[1px] h-6 bg-slate-200 mr-3" />
                    <Mic 
                      className="w-5 h-5 text-[#FF5722] cursor-pointer hover:scale-105 active:scale-95 transition-all" 
                      onClick={() => {
                        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                        if (SpeechRecognition) {
                          const recognition = new SpeechRecognition();
                          recognition.lang = 'en-US';
                          recognition.interimResults = false;
                          recognition.onresult = (event: any) => {
                            const speakText = event.results[0][0].transcript;
                            setSearchQuery(speakText);
                          };
                          recognition.start();
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Connected Store Filtering Indicator */}
            {filteredStoreId && (
              <div className="flex items-center justify-between bg-[#E8F5E9] border border-[#4CAF50]/35 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
                  <span className="text-[11px] font-black text-[#1B4D3E] uppercase tracking-wider">
                    Filtering by Store: {filteredStoreId === 'canteen_cafe' ? 'Campus Cafe' : filteredStoreId === 'books_depot' ? 'Sphoorthy Book Center' : 'Block-B Lounge'}
                  </span>
                </div>
                <button
                  onClick={onClearStoreFilter}
                  className="text-[10px] font-black text-[#2E7D5A] uppercase underline hover:text-[#1B4D3E] cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Horizontal Swiggy-Style Category Pills — hidden on desktop (sidebar has categories) */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
              {categories.map(category => {
                const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white ring-4 ring-[#1B4D3E]/10 shadow-md'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Menu Items Container */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">
            {filteredItems.length} {filteredItems.length === 1 ? 'Delicacy' : 'Delicacies'} inside SPHN Campus
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div 
            className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
            <div className="w-16 h-16 bg-[#E8F5E9] text-[#1B4D3E] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-[#2E7D5A]" />
            </div>
            <h3 className="text-base font-black text-[#1B4D3E]">No products match current filters</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto font-medium">Try checking your spelling, resetting the filters, or disabling Pure Veg toggle.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setVegetarianOnly(false); if (onClearStoreFilter) onClearStoreFilter(); }}
              className="mt-4 px-5 py-2.5 bg-[#1B4D3E] text-white font-bold rounded-xl text-xs hover:bg-[#2E7D5A] transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-100 shadow-xs p-3.5 sm:p-6 md:p-8 space-y-6">
            {filteredItems.map((item, index) => {
              const quantityInCart = cart[item.id] || 0;
              const isVeg = item.tags?.includes('Vegetarian') || item.category === 'Desserts' || item.category === 'Beverages' || (item.id && item.id.includes('bev')) || (item.id && item.id.includes('veg'));
              const isBestseller = item.rating >= 4.4 || item.isTodaySpecial;

              return (
                <div 
                  key={item.id}
                  className={`py-6 first:pt-0 last:pb-0 border-b border-slate-100/60 last:border-0 text-left ${
                    !item.isAvailable ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-row gap-4 sm:gap-6 justify-between items-start">
                    {/* Left Column (Details) */}
                  <div className="flex-1 space-y-1.5 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Swiggy Veg/Non-veg Identifier */}
                      <div className={`w-[14px] h-[14px] border-2 rounded flex items-center justify-center p-[2px] shrink-0 ${
                        isVeg ? 'border-emerald-600 bg-emerald-50/10' : 'border-rose-600 bg-rose-50/10'
                      }`} title={isVeg ? 'Vegetarian' : 'Contains Non-Vegetarian Ingredients'}>
                        <div className={`w-[5px] h-[5px] ${
                          isVeg ? 'rounded-full bg-emerald-600' : 'bg-rose-600 rotate-45'
                        }`} />
                      </div>
                      
                      {/* Bestseller ribbon exactly like Swiggy */}
                      {isBestseller && (
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded-md shadow-xs">
                          <Flame className="w-2.5 h-2.5" />
                          ⭐ Bestseller
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-display font-black text-slate-900 text-sm sm:text-base md:text-lg tracking-tight leading-snug truncate sm:whitespace-normal">
                        {item.name}
                      </h4>
                      <p className="font-mono font-black text-slate-800 text-xs sm:text-sm md:text-base">
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Ratings & Prep Time details */}
                    <div className="flex items-center gap-2 sm:gap-3.5 text-xs">
                      <div className="flex items-center gap-1 bg-[#E8F5E9] text-[#1B4D3E] border border-[#4CAF50]/15 rounded-md px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold font-mono">
                        <Star className="w-2.5 h-2.5 fill-[#1B4D3E] stroke-none shrink-0" />
                        <span>{item.rating || '4.5'}</span>
                      </div>
                      
                      {item.estimatedPrepTime && (
                        <div className="flex items-center gap-1 text-slate-450 font-bold font-mono text-[9px] sm:text-[11px] uppercase">
                          <Clock className="w-3 h-3 text-[#1B4D3E] shrink-0" />
                          <span>{item.estimatedPrepTime} MINS</span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed max-w-xl font-medium line-clamp-2 sm:line-clamp-none">
                      {item.description || 'Delicately cooked fresh with finest local SPHN ingredients, serving goodness within minutes.'}
                    </p>

                    {/* Low stock badge */}
                    {item.isAvailable && item.availableStock !== undefined && item.availableStock <= 5 && item.availableStock > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md mt-0.5">
                        ⚡ Only {item.availableStock} left!
                      </span>
                    )}
                  </div>

                  {/* Right Column (Product Image and ADD control) */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center p-0.5">
                    <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/70 shadow-sm relative group">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 text-[9px] text-slate-300"
                        onError={(e) => {
                          if (item.category === 'Stationery' || item.name.toLowerCase().includes('notebook') || item.name.toLowerCase().includes('pen')) {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578852612716-854e527abf2e?w=300';
                          } else if (item.category === 'Beverages') {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300';
                          } else if (item.category === 'Snacks') {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300';
                          } else {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';
                          }
                        }}
                      />
                    </div>

                    {/* Quantity controls overlaid on the bottom center */}
                    <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 z-10 w-20 sm:w-[110px]">
                      {!item.isAvailable ? (
                        <div className="w-full bg-slate-100 text-slate-400 border border-slate-205 text-center py-1 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
                          Out
                        </div>
                      ) : quantityInCart > 0 ? (
                        <div className="flex items-center w-full h-[30px] sm:h-[38px] bg-white text-[#1B4D3E] rounded-lg sm:rounded-xl border border-[#4CAF50]/40 shadow-md overflow-hidden justify-between p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateCart(item, quantityInCart - 1)}
                            className="w-6 sm:w-9 h-full hover:bg-slate-50 font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-mono font-black text-slate-800 text-[10px] sm:text-xs select-none">
                            {quantityInCart}
                          </span>
                          <button
                            type="button"
                            disabled={item.availableStock !== undefined && quantityInCart >= item.availableStock}
                            onClick={() => onUpdateCart(item, quantityInCart + 1)}
                            className={`w-6 sm:w-9 h-full font-black text-xs sm:text-sm flex items-center justify-center transition-all ${
                              item.availableStock !== undefined && quantityInCart >= item.availableStock
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            +
                          </button>
                        </div>
                       ) : (
                         <button
                           type="button"
                           onClick={() => onUpdateCart(item, 1)}
                           className="w-full h-[30px] sm:h-[38px] bg-white hover:bg-[#1B4D3E]/5 text-[#1B4D3E] border border-[#1B4D3E]/25 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center text-center active:scale-95 text-[#1B4D3E]"
                         >
                           Add
                         </button>
                       )}
                    </div>
                  </div>

                </div>

                {/* Reviews Panel — expandable toggle below each item */}
                <div className="col-span-full mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleReviews(item.id)}
                    className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider transition-colors cursor-pointer py-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {expandedReviews[item.id] ? 'Hide Reviews' : `Reviews ${item.rating ? `(${item.rating.toFixed(1)} ★)` : ''}`}
                    {expandedReviews[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {expandedReviews[item.id] && (
                    <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                      {/* Existing Reviews */}
                      {(reviewsMap[item.id] || []).length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No reviews yet. Be the first!</p>
                      ) : (
                        (reviewsMap[item.id] || []).slice(0, 3).map(rev => (
                          <div key={rev.id} className="bg-slate-50 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-700">{rev.userName || 'Student'}</span>
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            {rev.review && <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{rev.review}</p>}
                            <p className="text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                        ))
                      )}

                      {/* Review Submit — only for users who completed an order containing this item */}
                      {currentUserId && hasCompletedOrderForItem(item.id) && (
                        reviewFormItem === item.id ? (
                          <div className="bg-[#E8F5E9]/50 border border-[#4CAF50]/20 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Your Review</span>
                              <button type="button" onClick={() => { setReviewFormItem(null); setReviewError(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <button key={s} type="button" onClick={() => setReviewRating(s)} className="cursor-pointer">
                                  <Star className={`w-5 h-5 transition-colors ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                                </button>
                              ))}
                              <span className="text-xs text-slate-500 ml-1 font-bold">{reviewRating}/5</span>
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Share your experience..."
                              value={reviewText}
                              onChange={e => setReviewText(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-[#1B4D3E]/40 resize-none"
                            />
                            {reviewError && <p className="text-[10px] text-rose-600 font-medium">{reviewError}</p>}
                            <button
                              type="button"
                              disabled={reviewSubmitting}
                              onClick={() => handleSubmitReview(item.id)}
                              className="flex items-center gap-1.5 bg-[#1B4D3E] text-white text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#143B2F] transition-all disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setReviewFormItem(item.id); setReviewRating(5); setReviewText(''); setReviewError(''); }}
                            className="flex items-center gap-1.5 text-[10px] text-[#1B4D3E] font-bold border border-[#1B4D3E]/30 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#E8F5E9] transition-all"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Rate this item
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
      
    </div>
  );
}
