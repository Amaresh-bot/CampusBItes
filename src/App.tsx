import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingBag, ChefHat, Sparkles, LogOut, BookOpen, User, Shield, ArrowRight, Menu as MenuIcon, X as XIcon, Search, Home, Mic, ShoppingCart, AlertCircle, CheckCircle2, MapPin, Star, Clock, Check, SlidersHorizontal, Leaf, Flame, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Order, StudentProfile, PaymentSettings, SystemNotification } from './types';
import { useUser } from './context/UserContext';
import { AuthScreen } from './components/AuthScreen';
import { CanteenMenu } from './components/CanteenMenu';
import { CartDrawer } from './components/CartDrawer';
import { OrderProgress } from './components/OrderProgress';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { FallbackImage } from './components/FallbackImage';
import { MenuSkeleton } from './components/MenuSkeleton';
import { LandingPage } from './components/LandingPage';
import { StoreList } from './components/StoreList';
import { OffersPanel } from './components/OffersPanel';
import { TodaysSpecialsSlider } from './components/TodaysSpecialsSlider';
import { ProfileTab } from './components/ProfileTab';
import { BottomNavbar } from './components/BottomNavbar';
import PrintHub from './components/PrintHub/PrintHub';
import { AppFooter } from './components/AppFooter';
import { SafeStorage } from './lib/storage';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import explodedBurger from './assets/images/exploded_burger.png';
import explodedBurgerClean from './assets/images/exploded_burger_clean.png';


export default function App() {
  const {
    user,
    setUser,
    studentProfile,
    setStudentProfile,
    isProfileLoading,
    fetchStudentProfile,
    prefetchStudentProfile,
    logout: contextLogout,
  } = useUser();
  const [isPopupBootstrapping, setIsPopupBootstrapping] = useState<boolean>(false);

  // Clear legacy insecure localStorage keys on startup
  useEffect(() => {
    SafeStorage.clearInsecureKeys();
  }, []);

  // Intercept popup bootstrap flow to prevent reverse proxy OAuth bridge failures
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_auth_init') === 'true' && window.opener) {
      setIsPopupBootstrapping(true);
      SafeStorage.removeItem('google_auth_popup_active');
      
      fetch('/api/auth/google-url', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error("Failed to load Google Auth URL");
          return res.json();
        })
        .then(data => {
          window.location.href = data.url;
        })
        .catch(err => {
          console.error("Popup bootstrap error:", err);
        });
    }
  }, []);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'profile' | 'admin' | 'stores' | 'offers' | 'printhub'>('menu');
  const [filteredStoreId, setFilteredStoreId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(false);
  const [pendingFilter, setPendingFilter] = useState<{ query: string; category: string } | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Mobile Redesign states
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'orders' | 'stores' | 'cart' | 'profile' | 'admin' | 'printhub'>('home');
  const [promoIndex, setPromoIndex] = useState<number>(0);

  // Clean event listener to identify handheld devices dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab, mobileTab, hasEnteredApp]);

  // Automatic scrolling promotional carousel trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Lifted Swiggy-style Filter States for Synchronized Header/Categories Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean>(false);

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

  const [selectedCampus, setSelectedCampus] = useState<string>('Sphoorthy Main Campus');
  const [selectedLocation, setSelectedLocation] = useState<string>('Block B Dining Hall');
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);

  // Advanced Integrated State features
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: 'canteen@axisbank',
    merchantName: 'CampusBites Hub',
    bankName: 'Axis Bank Ltd',
    accountNo: '918020584920492',
    ifscCode: 'UTIB0000180'
  });
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [complianceModal, setComplianceModal] = useState<'terms' | 'privacy' | 'refund' | 'contact' | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // 1. Session restore — handled by UserContext (SWR pattern with localStorage)

  // 1b. Expose global alert register for payments / bookings triggers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).addCanteenNotification = (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'email') => {
        addNotification(title, msg, type);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).addCanteenNotification;
      }
    };
  }, []);

  // 2. Fetch canteen menu catalog from backend
  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu', { credentials: 'include' });
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        const normalizedData = (data || []).map((item: any) => ({
          ...item,
          id: item.id || item._id
        }));
        setMenuItems(normalizedData);
      } else {
        console.warn("Canteen menu endpoint is temporarily unavailable or returned non-JSON.");
      }
    } catch (e) {
      console.warn("Canteen menu fetching warning:", e);
    } finally {
      setIsMenuLoading(false);
    }
  };

  // 3. Fetch active user orders from backend database
  const fetchUserOrders = async () => {
    if (!user || !user.id) return;
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const isAdmin = user.role === 'admin';
      const endpoint = isAdmin ? '/api/admin/orders' : `/api/orders/user/${user.id}`;
      const response = await fetch(endpoint, { credentials: 'include' });
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        const normalizedData = (data || []).map((ord: any) => ({
          ...ord,
          id: ord.id || ord._id
        }));
        setOrders(normalizedData);

        // Simple low stock notification dispatcher
        if (menuItems.length > 0) {
          const outOfStockItems = menuItems.filter(item => !item.isAvailable);
          if (outOfStockItems.length > 0 && user.role === 'admin') {
            const alreadyNotified = notifications.some(n => n.title.includes('Stock Warning'));
            if (!alreadyNotified) {
              addNotification(
                '⚠️ Low Stock Admin Warning',
                `Items ${outOfStockItems.map(i => i.name).join(', ')} are set to Out of Stock. Stock records updated.`,
                'alert'
              );
            }
          }
        }
      } else {
        const errText = await response.text();
        console.warn("Orders user endpoint returned non-JSON or offline fallback:", errText);
        setOrdersError(`Server returned error: ${response.statusText || response.status}. Please make sure database is initialized.`);
      }
    } catch (e: any) {
      console.warn("Could not pull user orders safely:", e);
      setOrdersError(e.message || "Failed to fetch orders from database. Make sure server is online.");
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // 4. Fetch dynamic payment merchant configs
  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment/settings', { credentials: 'include' });
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        setPaymentSettings(data);
      }
    } catch (err) {
      console.warn("Could not load payment settings:", err);
    }
  };

  // 5. fetchStudentProfile — delegated to UserContext (deduped, cached, SWR)

  // 6. Fetch Admin students summaries
  const fetchAllStudents = async () => {
    try {
      const response = await fetch('/api/admin/students', { credentials: 'include' });
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        setAllStudents(data);
      }
    } catch (err) {
      console.warn("Could not fetch students summaries:", err);
    }
  };

  const handleToggleStudentVerify = async (studentUserId: string, newVerifyStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentUserId, isVerified: newVerifyStatus }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchAllStudents();
        addNotification(
          'Student Verification Updated',
          `Student is now ${newVerifyStatus ? 'Verified' : 'Unverified'}.`,
          'success'
        );
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to update verification status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error synchronizing student verification status.");
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchPaymentSettings();
    const menuInterval = setInterval(() => {
      fetchMenu();
    }, 30000); // Dynamic real-time menu cache updates (every 30s)
    return () => clearInterval(menuInterval);
  }, []);

  const hasActiveOrders = orders.some(o => 
    o.status === 'Pending' || 
    o.status === 'Approved' || 
    o.status === 'Preparing' || 
    o.status === 'Ready for Pickup'
  );

  const fetchWalletBalance = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`/api/wallet/${user.id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.wallet) {
          setWalletBalance(data.wallet.balance);
        }
      }
    } catch (err) {
      console.warn("Could not fetch wallet balance:", err);
    }
  };

  // Fetch user profile and orders once on user or tab transitions
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchStudentProfile(); // via UserContext — deduped
      fetchWalletBalance();
      if (user.role === 'admin') {
        fetchAllStudents();
      }
    }
  }, [user?.id, activeTab, mobileTab]);

  // Set up polling interval only if the user has active orders to track
  useEffect(() => {
    if (user) {
      const shouldPoll = user.role === 'admin'
        ? (activeTab === 'admin' || mobileTab === 'admin')
        : (activeTab === 'orders' || mobileTab === 'orders') && hasActiveOrders;

      if (shouldPoll) {
        const interval = setInterval(() => {
          fetchUserOrders();
        }, 4000); // Poll tracking statuses
        return () => clearInterval(interval);
      }
    }
  }, [user?.id, activeTab, mobileTab, hasActiveOrders]);

  // Sync stateful notification dispatch additions
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'alert' | 'email') => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Multi-Tab Cart synchronization (Feature 40)
  useEffect(() => {
    if (user?.id) {
      const handleStorageSync = (e: StorageEvent) => {
        if (e.key === `cart_cache_${user.id}`) {
          try {
            setCart(JSON.parse(e.newValue || '{}'));
          } catch (err) {
            console.error(err);
          }
        }
      };
      window.addEventListener('storage', handleStorageSync);
      return () => window.removeEventListener('storage', handleStorageSync);
    }
  }, [user]);

  // Load cart from cache on user login/mount
  useEffect(() => {
    if (user?.id) {
      const cached = SafeStorage.getItem(`cart_cache_${user.id}`);
      if (cached) {
        try {
          setCart(JSON.parse(cached));
        } catch (err) {
          console.error(err);
        }
      } else {
        setCart({});
      }
    } else {
      setCart({});
    }
  }, [user?.id]);

  const handleUpdateCart = (item: FoodItem, qty: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = qty;
      }
      if (user?.id) {
        SafeStorage.setItem(`cart_cache_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
    if (user?.id) {
      SafeStorage.removeItem(`cart_cache_${user.id}`);
    }
  };

  const handleAuthSuccess = (authUser: typeof user | any) => {
    setUser(authUser);
    if (authUser?.studentProfile) {
      setStudentProfile(authUser.studentProfile);
    }
    addNotification(
      'Session Approved',
      `Welcome to CampusBites, ${authUser?.name || 'Student'}. Secure token keys verified.`,
      'success'
    );
    if (authUser?.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('menu');
    }
    
    // Automatically redirect and apply any category/query filter selected on the landing page
    if (pendingFilter) {
      setSearchQuery(pendingFilter.query || '');
      setSelectedCategory(pendingFilter.category || 'All');
      if (pendingFilter.category === 'printhub') {
        setActiveTab('printhub');
        setMobileTab('printhub');
      }
      setPendingFilter(null);
    }
    setHasEnteredApp(true);
  };

  const handleLogout = () => {
    contextLogout();
    setCart({});
    setOrders([]);
    setActiveTab('menu');
    setHasEnteredApp(false);
  };

  // Order status progression & admin updates with automatic cancellation refunds (Feature 30)
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include'
      });
      if (response.ok) {
        const responseData = await response.json();
        const updatedOrd = responseData.order;

        // Visual Push Trigger
        addNotification(
          `Order status: ${nextStatus}`,
          `Order Token #${updatedOrd.tokenNumber} is now: "${nextStatus}".`,
          nextStatus === 'Cancelled' ? 'alert' : 'success'
        );

        // Refund sequence if Cancelled (100% if Pending/unapproved, 50% if approved/cooking)
        if (nextStatus === 'Cancelled') {
          const oldOrder = orders.find(o => o.id === orderId);
          const wasPending = oldOrder ? oldOrder.status === 'Pending' : true;
          const refundRatio = wasPending ? 1.0 : 0.5;
          const refundAmt = Number((updatedOrd.totalAmount * refundRatio).toFixed(2));
          addNotification(
            'Refund Initiated',
            `Order Cancelled. ${wasPending ? '100% full' : '50%'} refund value (₹${refundAmt}) will be credited via Razorpay pathways.`,
            'alert'
          );
        }

        fetchUserOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete orders callback
  const handleOrderCreated = (order: Order) => {
    const normalizedOrder = {
      ...order,
      id: order.id || (order as any)._id
    };
    setOrders(prev => [normalizedOrder, ...prev]);
    setPlacedOrder(normalizedOrder);
    setActiveTab('orders'); // Go track order progress

    addNotification(
      'Order Dispatched',
      `CampusBites kitchen received order ticket. Estimated prep: 12 minutes.`,
      'success'
    );

    // Dispatch Order confirmation mail (Feature 26)
    const emailBody = `To: ${order.userEmail || 'student@campus.edu'}\nSubject: Canteen Order Confirmation #${order.tokenNumber}\n\nHi ${order.userName},\nWe have compiled your cooking custom order.\nPayment reference: ${order.paymentId}\nGateway method: ${order.paymentMethod}\nTotal Billing: ₹${order.totalAmount}\nYour token pickup key is ${order.tokenNumber}.`;
    
    addNotification('✉️ SMTP Mail Dispatched', emailBody, 'email');
  };

  // Admin dynamic menu actions
  const handleAddMenuItem = async (itemPayload: any) => {
    console.log("[handleAddMenuItem] Dispatching POST request to /api/menu/add with payload:", itemPayload);
    try {
      const response = await fetch('/api/menu/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemPayload),
        credentials: 'include'
      });
      console.log(`[handleAddMenuItem] Response received. Status: ${response.status} (${response.statusText})`);
      
      const data = await response.json();
      if (response.ok) {
        console.log("[handleAddMenuItem] Menu item added successfully. Response data:", data);
        fetchMenu();
        addNotification('Canteen Catalogue Updated', `Delicacy "${itemPayload.name}" was appended to the chef schedule.`, 'success');
      } else {
        console.error("[handleAddMenuItem] Server rejected request. Error details:", data);
        addNotification('Menu Creation Failed', data.message || 'Error occurred while saving menu item.', 'alert');
      }
    } catch (err) {
      console.error("[handleAddMenuItem] Network error or JSON parsing failed:", err);
    }
  };

  const handleEditMenuItem = async (itemId: string, itemPayload: any) => {
    console.log(`[handleEditMenuItem] Dispatching PUT request to /api/menu/${itemId}/edit with payload:`, itemPayload);
    try {
      const response = await fetch(`/api/menu/${itemId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemPayload),
        credentials: 'include'
      });
      console.log(`[handleEditMenuItem] Response received. Status: ${response.status} (${response.statusText})`);
      
      const data = await response.json();
      if (response.ok) {
        console.log("[handleEditMenuItem] Menu item updated successfully. Response data:", data);
        fetchMenu();
      } else {
        console.error("[handleEditMenuItem] Server rejected edit request. Error details:", data);
        addNotification('Menu Update Failed', data.message || 'Error occurred while updating menu item.', 'alert');
      }
    } catch (err) {
      console.error("[handleEditMenuItem] Network error or JSON parsing failed:", err);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/${itemId}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchMenu();
        addNotification('Dish Removed', `Item deleted successfully from menu catalogs.`, 'alert');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePaymentSettings = async (settingsPayload: PaymentSettings) => {
    try {
      const response = await fetch('/api/payment/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSaved = async (profilePayload: StudentProfile) => {
    try {
      const response = await fetch('/api/student/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, profile: profilePayload }),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(profilePayload);
        setShowProfileModal(false);
        if (data.savedToCloud) {
          addNotification(
            'Academic Profile Synced to Supabase',
            `Lock success! Roll No: ${profilePayload.rollNo} saved in Supabase canteen_student_profiles.`,
            'success'
          );
        } else {
          addNotification(
            'Profile Saved (Sandbox Fallback Mode)',
            `Registry locked in local server-memory. Connect Supabase to persist to cloud.`,
            'info'
          );
        }
        if (user?.role === 'admin') fetchAllStudents();
      }
    } catch (err) {
      console.error(err);
      addNotification('Sync Failure', 'Could not establish registry lock with canteen terminals.', 'alert');
    }
  };

  const isUserAdmin = user?.role === 'admin';

  if (isPopupBootstrapping) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-8 text-center font-sans" id="oauth-bootstrapper-root">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" id="oauth-bootstrapper-spinner" />
        <h1 className="text-xl font-semibold mb-2 text-slate-900" id="oauth-bootstrapper-title">Connecting to Google...</h1>
        <p className="text-sm text-slate-500" id="oauth-bootstrapper-subtitle">Please wait while we redirect you safely to secure identity systems.</p>
      </div>
    );
  }

  if (!user || !hasEnteredApp) {
    return (
      <div className="min-h-screen bg-[#F2F7F5]">
        <LandingPage
          isLoggedIn={!!user}
          onEnterApp={(query, category) => {
            if (query !== undefined) setSearchQuery(query || '');
            if (category !== undefined) setSelectedCategory(category || 'All');
            setHasEnteredApp(true);
            if (category === 'printhub') {
              setActiveTab('printhub');
              setMobileTab('printhub');
            } else {
              setActiveTab('menu');
              setMobileTab('home');
            }
          }}
          onSignOut={handleLogout}
          onSignIn={(query, category) => {
            if (query || category) {
              setPendingFilter({ query: query || '', category: category || 'All' });
            } else {
              setPendingFilter(null);
            }
            setShowAuthModal(true);
            setComplianceModal(null);
          }}
          onContactUs={() => {
            setComplianceModal('contact');
          }}
        />

        {/* Backdrop-Blur Secure Auth Screen Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setShowAuthModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="relative w-full max-w-md my-8 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual Premium Close Icon */}
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute right-4 top-4 text-[#64748B] hover:text-[#0F172A] font-bold text-xl h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-all z-50 shadow-xs active:scale-90"
                  aria-label="Close Authentication Form"
                >
                  ×
                </button>
                <AuthScreen onSuccess={(authUser) => {
                  setShowAuthModal(false);
                  handleAuthSuccess(authUser);
                }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compliance policies accessibility on landing page */}
        <AnimatePresence>
          {complianceModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
              onClick={() => setComplianceModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 text-[#1E293B]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="font-sans font-bold text-base text-[#0F172A] uppercase tracking-wide">
                    {complianceModal === 'terms' && 'Terms & Conditions'}
                    {complianceModal === 'privacy' && 'Privacy Policy'}
                    {complianceModal === 'refund' && 'Refund & Cancellation Policy'}
                    {complianceModal === 'contact' && 'Contact Us'}
                  </h3>
                  <button
                    onClick={() => setComplianceModal(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl font-light"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-600 space-y-3 leading-relaxed font-sans">
                  {complianceModal === 'terms' && (
                    <>
                      <p className="font-semibold text-slate-800">1. Services Provided</p>
                      <p>CampusBites Hub provides digital pre-ordering and booking management for student dining, smart mess cards, and canteen canteens within our campus network.</p>
                      <p className="font-semibold text-slate-800">2. Account Registration</p>
                      <p>Users must register with an official institution-affiliated email account and complete setup of their college profile (including roll number/department) to receive order items.</p>
                      <p className="font-semibold text-slate-800">3. Food Handling & Responsibilities</p>
                      <p>Food preparations are handled dynamically by our verified canteen kitchens. Users should collect their meals promptly once notifications mark order statuses as 'Ready for Pickup'.</p>
                    </>
                  )}

                  {complianceModal === 'privacy' && (
                    <>
                      <p className="font-semibold text-slate-800">1. Data Storage</p>
                      <p>We process basic credentials including your name, email, department, roll number, and phone details to identify you and prevent food distribution errors.</p>
                      <p className="font-semibold text-[#1B4D3E]">2. Secure Payment Intermediaries</p>
                      <p>All online checkouts and deposit processing are handled securely via Razorpay payment gate keys. We never store credit cards or private ledger values on our servers.</p>
                    </>
                  )}

                  {complianceModal === 'refund' && (
                    <>
                      <p className="font-semibold text-slate-800">1. Refund Eligibility Period</p>
                      <p>Canteen food items represent highly immediate, perishable inventory. Refund ranges are dictated by actual cooking progress tracking:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Pending orders (unapproved)</strong>: Eligible for a <strong>100% full refund</strong> instantly credited back.</li>
                        <li><strong>Approved or Cooking orders</strong>: Eligible for a <strong>50% partial refund</strong>.</li>
                      </ul>
                    </>
                  )}

                  {complianceModal === 'contact' && (
                    <>
                      <p className="font-semibold text-slate-800">Support & Compliance Desk</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Please reach out to our campus support team via email for any payment or operational inquiries:
                      </p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-3 text-center">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold mb-1">Support Email</span>
                        <a href="mailto:amareshkaturi@gmail.com" className="text-[#1B4D3E] hover:underline font-extrabold text-sm">
                          amareshkaturi@gmail.com
                        </a>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setComplianceModal(null)}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (user && hasEnteredApp && (activeTab === 'printhub' || mobileTab === 'printhub')) {
    return (
      <PrintHub
        user={user}
        studentProfile={studentProfile}
        onBackToHome={() => {
          setSelectedCategory('All');
          setFilteredStoreId(null);
          setSearchQuery('');
          setActiveTab('menu');
          setMobileTab('home');
        }}
        onBackToCanteen={() => {
          setSelectedCategory('All');
          setFilteredStoreId(null);
          setSearchQuery('');
          setActiveTab('menu');
          setMobileTab('home');
        }}
      />
    );
  }

  const mobileCartItemCount = Object.values(cart).reduce((sum, qty) => (sum as number) + (qty as number), 0) as number;
  const mobileCartSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find(m => m.id === id);
    return (sum as number) + (item ? item.price * (qty as number) : 0);
  }, 0) as number;

  if (isMobile && user) {
    const handleOrderCreatedMobile = (order: Order) => {
      handleOrderCreated(order);
      setMobileTab('orders');
    };

    const getTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      return 'evening';
    };

    const promos = [
      { title: "Sizzling Samosas & Snacks", code: "Prepared fresh daily", color: "from-[#1B4D3E] to-[#4CAF50]" },
      { title: "Hot Filter Coffee & Tea", code: "Energize your college study sessions", color: "from-[#FF9800] to-[#FF5722]" },
      { title: "Skip Queue Instant Pickup", code: "Ready in 10 minutes", color: "from-[#3F51B5] to-[#00BCD4]" }
    ];


    const campusLocations = [
      'Block B Dining Hall',
      'Administrative Admin Block A',
      'Mechanical Engg Block C',
      'Boys Mess Wing Ground',
      'SPHN Main Campus Lounge'
    ];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col select-none relative overflow-x-hidden">
        
        {/* Compact Swiggy-style Sticky Mobile Header (Height: 70px) */}
        {mobileTab !== 'home' && (
          <header className="sticky top-0 z-45 h-[70px] bg-white border-none flex items-center justify-between px-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] shrink-0">
            <button
              onClick={() => { setHasEnteredApp(false); setActiveTab('menu'); setFilteredStoreId(null); }}
              className="flex items-center gap-2 text-left bg-transparent border-none outline-none cursor-pointer hover:opacity-90 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1B4D3E] flex items-center justify-center text-white font-black text-sm">
                <ChefHat className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="text-slate-900 text-xs font-black tracking-tight leading-none uppercase block">CampusBites</span>
                <span className="text-[#1B4D3E] text-[8px] uppercase font-extrabold block tracking-normal leading-none mt-0.5">SPHOORTHY HUB</span>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {/* Direct self-contained Notifications Bell Component */}
              <NotificationsDrawer
                notifications={notifications}
                onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                onClearAll={() => setNotifications([])}
              />

              {/* Profile Avatar trigger */}
              <button
                onClick={() => setMobileTab('profile')}
                className="w-8 h-8 rounded-xl bg-[#1B4D3E]/10 flex items-center justify-center text-[#1B4D3E] font-black text-xs font-mono border border-[#1B4D3E]/5"
              >
                {user.name.slice(0, 2).toUpperCase()}
              </button>
            </div>
          </header>
        )}

        {/* Location selector popup removed */}

        {/* Dynamic Nav Tabs Body rendering conditional content */}
        <main className="flex-1 w-full bg-white">
          <AnimatePresence mode="wait">
            {mobileTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.10, ease: 'easeOut' }}
                className="space-y-6 bg-slate-50 text-left"
              >
                {/* Redesigned Home Header inline with page */}
                <div className="bg-white px-4 pt-4 pb-3 flex flex-col space-y-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  {/* Top Header Row */}
                  <div className="flex justify-between items-center">
                    {/* College Location Selector - Static */}
                    <div
                      className="flex items-center gap-1.5 text-left bg-transparent border-none outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1B4D3E]">
                        <MapPin className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                        <span className="text-xs font-extrabold text-slate-900">Sphoorthy Canteen</span>
                      </div>
                    </div>

                    {/* Right utilities: Notification and User Greeting */}
                    <div className="flex items-center gap-2">
                      <NotificationsDrawer
                        notifications={notifications}
                        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                        onClearAll={() => setNotifications([])}
                      />
                      
                      <button
                        onClick={() => setMobileTab('profile')}
                        className="w-8 h-8 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[#1B4D3E] font-black text-xs border border-[#A5D6A7]/50"
                      >
                        {user.name.slice(0, 2).toUpperCase()}
                      </button>
                    </div>
                  </div>

                  {/* Greeting Block */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">Welcome back, {studentProfile?.fullName?.split(' ')[0] || user.name.split(' ')[0]}!</span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                      Delicious food for you
                    </h2>
                  </div>
                </div>

                {/* Search Bar pill */}
                <div className="px-4">
                  <div className="relative shadow-sm rounded-full bg-white border border-slate-200 flex items-center h-12 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all px-4">
                    <Search className="w-4.5 h-4.5 text-slate-400 stroke-[2.5] mr-2" />
                    <input
                      type="text"
                      placeholder="Search food, canteens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-slate-450 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Hero Banner promoting canteens & digital tokens */}
                {!searchQuery && (
                  <div className="px-4 pt-2">
                    <div className="bg-gradient-to-br from-[#1B4D3E] to-[#2E7D5A] rounded-3xl p-5 text-white shadow-lg relative flex items-center justify-between min-h-[140px]">
                      {/* Left contents */}
                      <div className="space-y-2 max-w-[55%] z-10">
                        <h3 className="text-xl font-black leading-[1.15] text-white">
                          Order Food<br />&<br />Essentials.
                        </h3>
                      </div>

                      {/* Right illustration / overlapping exploded burger image */}
                      <div className="absolute right-[-10px] top-[-15px] bottom-[-15px] w-[160px] h-[170px] z-20 pointer-events-none">
                        <img 
                          src={explodedBurger} 
                          alt="Canteen Special" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Horizontal Scroll */}
                <div className="space-y-3">
                  <div className="px-4 flex justify-between items-center">
                    <h4 className="font-display font-black text-slate-800 text-sm tracking-tight">Explore Categories</h4>
                    {vegetarianOnly && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Veg Only</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 px-4">
                    {[
                      { id: 'All', label: 'All' },
                      { id: 'Breakfast', label: 'Breakfast' },
                      { id: 'Meals', label: 'Lunch' },
                      { id: 'Snacks', label: 'Snacks' },
                      { id: 'Beverages', label: 'Beverages' },
                      { id: 'Chinese', label: 'Dinner' },
                      { id: 'Specials', label: 'Specials' }
                    ].map(cat => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                          }}
                          className={`w-full text-center py-2 px-1 text-xs font-bold transition-all border rounded-full cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Today's Specials Section */}
                {!searchQuery && selectedCategory === 'All' && (
                  <div className="px-4">
                    <TodaysSpecialsSlider
                      items={menuItems}
                      cart={cart}
                      onUpdateCart={handleUpdateCart}
                      userRole={user?.role}
                      onGoToAdmin={() => {
                        setMobileTab('admin');
                      }}
                    />
                  </div>
                )}

                {/* Popular Food Items Section (Category Catalog) */}
                <div className="space-y-4 px-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-black text-slate-800 text-sm tracking-tight">
                      {searchQuery 
                        ? `Search Results for "${searchQuery}"` 
                        : selectedCategory === 'All' 
                        ? 'Popular Canteen Treats' 
                        : `${selectedCategory} Catalogue`}
                    </h4>
                    
                    {/* Veg toggle */}
                    <button
                      onClick={() => setVegetarianOnly(!vegetarianOnly)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                        vegetarianOnly ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 border rounded flex items-center justify-center p-[1px] ${vegetarianOnly ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'}`}>
                        {vegetarianOnly && <Check className="w-2 h-2 text-white stroke-[3.5]" />}
                      </div>
                      <span>Veg Only</span>
                    </button>
                  </div>

                  {filteredStoreId && (
                    <div className="flex items-center justify-between bg-[#E8F5E9] border border-[#C8E6C9] px-3 py-2 rounded-xl text-[10px] uppercase font-bold text-[#1B4D3E]">
                      <span>Filtering outlet: {filteredStoreId === 'canteen_cafe' ? 'Campus Cafe' : filteredStoreId === 'books_depot' ? 'Stationery Depot' : 'Coffee Lounge'}</span>
                      <button onClick={() => { setFilteredStoreId(null); setSelectedCategory('All'); }} className="underline font-black cursor-pointer">Reset</button>
                    </div>
                  )}

                  {/* Redesigned Cards Grid mapping the design reference */}
                  {(() => {
                    // filter logic
                    const list = menuItems.filter(item => {
                      let matchesCategory = true;
                      if (selectedCategory !== 'All' && selectedCategory !== 'Specials') {
                        // Map "Meals" category from backend to "Lunch" visually
                        matchesCategory = item.category.toLowerCase() === selectedCategory.toLowerCase();
                      } else if (selectedCategory === 'Specials') {
                        matchesCategory = !!item.isTodaySpecial;
                      }

                      let matchesStore = true;
                      if (filteredStoreId) {
                        if (filteredStoreId === 'canteen_cafe') {
                          matchesStore = ['Breakfast', 'Meals', 'Snacks', 'Desserts'].includes(item.category);
                        } else if (filteredStoreId === 'books_depot') {
                          matchesStore = ['Stationery', 'Books', 'Lab Materials'].includes(item.category) || item.name.toLowerCase().includes('notebook') || item.name.toLowerCase().includes('pen');
                        } else if (filteredStoreId === 'block_b_lounge') {
                          matchesStore = ['Beverages', 'Desserts'].includes(item.category);
                        }
                      }

                      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      const isVeg = item.tags?.includes('Vegetarian') || item.category === 'Desserts' || item.category === 'Beverages' || item.id?.includes('bev') || item.id?.includes('veg');
                      const matchesVeg = !vegetarianOnly || isVeg;

                      return matchesCategory && matchesStore && matchesSearch && matchesVeg;
                    });

                    if (list.length === 0) {
                      return (
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-2 shadow-xs">
                          <h5 className="font-bold text-slate-800 text-xs">No food items found</h5>
                          <p className="text-[10px] text-slate-450">Try adjusting your filters or search terms.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-16 pt-12">
                        {list.map(item => {
                          const quantity = cart[item.id] || 0;
                          return (
                            <div
                              key={item.id}
                              className="bg-white rounded-[30px] shadow-sm hover:shadow-md border border-slate-100/60 p-4 flex flex-col items-center justify-between text-center relative mt-4 min-h-[190px]"
                            >
                              {/* Overlapping circular food image sticking out at the top */}
                              <div className="absolute -top-12 w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-white bg-slate-100">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              
                              {/* Content padding to avoid image overlap */}
                              <div className="pt-12 flex-1 flex flex-col justify-between w-full">
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-slate-900 text-[13px] leading-tight line-clamp-2 px-1">
                                    {item.name}
                                  </h5>
                                  <span className="text-[10px] text-slate-400 capitalize block">{item.category}</span>
                                </div>

                                <div className="pt-3 w-full flex flex-col items-center gap-2 mt-auto">
                                  <span className="text-sm font-black text-[#1B4D3E] font-mono">
                                    ₹{item.price}
                                  </span>

                                  {/* Add to Tray action button */}
                                  {quantity > 0 ? (
                                    <div className="flex items-center bg-[#E8F5E9] text-[#1B4D3E] rounded-full border border-[#A5D6A7] overflow-hidden h-7 w-20 justify-between p-0.5">
                                      <button
                                        onClick={() => handleUpdateCart(item, quantity - 1)}
                                        className="w-6 h-full font-black text-xs hover:bg-[#C8E6C9] flex items-center justify-center cursor-pointer select-none"
                                      >
                                        -
                                      </button>
                                      <span className="font-bold font-mono text-xs">{quantity}</span>
                                      <button
                                        onClick={() => handleUpdateCart(item, quantity + 1)}
                                        className="w-6 h-full font-black text-xs hover:bg-[#C8E6C9] flex items-center justify-center cursor-pointer select-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateCart(item, 1)}
                                      className="px-4 py-1 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
                                    >
                                      Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {mobileTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-slate-50 min-h-[75vh]"
                transition={{ duration: 0.10, ease: 'easeOut' }}
              >
                {isOrdersLoading && orders.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-3xl gap-3">
                      <div className="h-6 w-36 bg-slate-200 rounded-lg animate-pulse" />
                      <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded-md" />
                            <div className="h-3.5 w-48 bg-slate-150 rounded-md" />
                          </div>
                          <div className="h-10 w-20 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="h-2 w-full bg-slate-150 rounded-full" />
                        <div className="flex justify-between pt-2">
                          <div className="h-3 w-16 bg-slate-150 rounded-md" />
                          <div className="h-3 w-12 bg-slate-150 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ordersError ? (
                  <div className="bg-white rounded-3xl border border-red-100 p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-slate-800 text-sm">Failed to Load Orders</h4>
                      <p className="text-xs text-red-650 max-w-sm mx-auto leading-relaxed font-semibold">{ordersError}</p>
                    </div>
                    <button
                      onClick={fetchUserOrders}
                      className="px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white font-black text-xs rounded-xl cursor-pointer"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <OrderProgress 
                    orders={orders} 
                    onCancelOrder={(id) => handleUpdateOrderStatus(id, 'Cancelled')} 
                    onRefresh={fetchUserOrders} 
                    onGoToMenu={() => setMobileTab('home')}
                  />
                )}
              </motion.div>
            )}

            {mobileTab === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-white min-h-[75vh] text-left"
                transition={{ duration: 0.10, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 select-none">
                  <h3 className="font-display font-black text-slate-800 text-xs uppercase tracking-wider">Your Canteen Cart</h3>
                  {mobileCartItemCount > 0 && (
                    <button
                      onClick={() => { handleClearCart(); addNotification('🗑️ Cart Emptied', 'Tray cleared successfully', 'info'); }}
                      className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl uppercase tracking-wider"
                    >
                      Clear Tray
                    </button>
                  )}
                </div>
                <CartDrawer 
                  user={user!}
                  cart={cart}
                  menuItems={menuItems}
                  onUpdateCart={handleUpdateCart}
                  onClearCart={handleClearCart}
                  onOrderPlacement={handleOrderCreatedMobile}
                  onExploreMenu={() => setMobileTab('home')}
                />
              </motion.div>
            )}

            {mobileTab === 'profile' && (
              <ProfileTab
                user={user!}
                studentProfile={studentProfile}
                isProfileLoading={isProfileLoading}
                onEditProfile={() => setShowProfileModal(true)}
                onOpenAdmin={() => { setMobileTab('admin'); }}
                onLogout={handleLogout}
              />
            )}

            {/* Tokens Tab removed */}

            {mobileTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="p-4 bg-slate-50 min-h-[75vh]"
              >
                <ErrorBoundary>
                  <AdminPanel 
                    onBack={() => setMobileTab('profile')}
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    foodItems={menuItems}
                    onAddMenuItem={handleAddMenuItem}
                    onEditMenuItem={handleEditMenuItem}
                    onDeleteMenuItem={handleDeleteMenuItem}
                    students={allStudents}
                    paymentSettings={paymentSettings}
                    onUpdatePaymentSettings={handleUpdatePaymentSettings}
                    onToggleStudentVerify={handleToggleStudentVerify}
                  />
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating cart summary bar removed */}

        {/* Premium Floating Bottom Navigation */}
        <BottomNavbar
          mobileTab={mobileTab}
          cartItemCount={mobileCartItemCount}
          onTabChange={(tab) => {
            setMobileTab(tab);
            if (tab === 'home') setActiveTab('menu');
            if (tab === 'orders') setActiveTab('orders');
            if (tab === 'profile') setActiveTab('profile');
          }}
          onOrdersClick={fetchUserOrders}
          onProfileHover={prefetchStudentProfile}
        />

        {/* Global Compliance overlay triggers for the policy screens */}
        {complianceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-55" onClick={() => setComplianceModal(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-5 text-slate-800 text-left text-xs space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                  {complianceModal === 'terms' && 'Terms & Conditions'}
                  {complianceModal === 'privacy' && 'Privacy Policy'}
                  {complianceModal === 'refund' && 'Refund & Cancellation Policy'}
                  {complianceModal === 'contact' && 'Contact Us'}
                </h3>
                <button onClick={() => setComplianceModal(null)} className="text-slate-400 text-xl font-bold">×</button>
              </div>
              <div className="space-y-2 leading-relaxed">
                {complianceModal === 'terms' && <p>CampusBites Hub manages digital booking logs within Sphoorthy Engineering College dining networks.</p>}
                {complianceModal === 'privacy' && <p>All payments are securely completed using PCI-compliant token gateways. SPHN does not store credentials.</p>}
                {complianceModal === 'refund' && <p>A full refund is distributed for unapproved orders. If preparations are cooking, a 50% refund is issued.</p>}
                {complianceModal === 'contact' && <p>Support Email: amareshkaturi@gmail.com. Operational Desk: Block B dining counters, Academic Area.</p>}
              </div>
              <div className="pt-2 flex justify-end">
                <button onClick={() => setComplianceModal(null)} className="px-4 py-1.5 bg-slate-950 text-white rounded-lg text-[10px] font-bold uppercase transition-all">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Modals (Profile setup, compliance) */}
        {showProfileModal && (
          <ProfileModal
            initialProfile={studentProfile || undefined}
            userEmail={user.email}
            defaultName={user.name}
            onSave={handleProfileSaved}
            onClose={() => setShowProfileModal(false)}
          />
        )}

        {/* Shared App Footer */}
        <AppFooter onPolicyClick={(key) => setComplianceModal(key)} className="pb-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-900 antialiased font-sans flex flex-col">

      {/* ═══════════════════════════════════════════════════
           SWIGGY-STYLE DESKTOP HEADER
      ═══════════════════════════════════════════════════ */}
      <header id="main-header" className="bg-white sticky top-0 z-45 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center">
          
          {/* Logo — left */}
          <button 
            onClick={() => { setHasEnteredApp(false); setActiveTab('menu'); setFilteredStoreId(null); }}
            className="flex items-center gap-2.5 hover:opacity-90 transition-all text-left bg-transparent border-none outline-none cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] flex items-center justify-center shadow-md shrink-0">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-[15px] text-[#1B4D3E] tracking-tight leading-none">CampusBites</span>
              <span className="text-[9px] text-[#4CAF50] font-black tracking-widest uppercase block mt-0.5">SPHN Campus</span>
            </div>
          </button>

          {/* Location pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 cursor-default shrink-0 ml-4">
            <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">Sphoorthy Canteen</span>
          </div>

          {/* Nav tabs — centered */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'menu' ? 'bg-[#1B4D3E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" /> Menu
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === 'orders' ? 'bg-[#1B4D3E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Orders
                {orders.some(o => ['Pending', 'Preparing', 'Ready for Pickup'].includes(o.status)) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === 'cart' ? 'bg-[#1B4D3E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Cart
                {Object.values(cart).reduce((s: number, v) => s + (v as number), 0) > 0 && (
                  <span className={`min-w-[16px] h-4 rounded-full text-[9px] font-black flex items-center justify-center px-0.5 ${
                    activeTab === 'cart' ? 'bg-white text-[#1B4D3E]' : 'bg-[#1B4D3E] text-white'
                  }`}>
                    {Object.values(cart).reduce((s: number, v) => s + (v as number), 0)}
                  </span>
                )}
              </button>
              {isUserAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin' ? 'bg-[#1B4D3E] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              )}
            </nav>
          </div>

          {/* Right: Notifications + Profile + Hamburger */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationsDrawer
              notifications={notifications}
              onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
              onClearAll={() => setNotifications([])}
            />

            <ProfileDropdown
              data={{
                name: user.name,
                email: user.email,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
                subscription: user.role === 'admin' ? 'ADMIN' : 'STUDENT',
                model: walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : 'Loading...'
              }}
              onProfileClick={() => setShowProfileModal(true)}
              onSettingsClick={() => setShowProfileModal(true)}
              onWalletClick={() => { if (isMobile) setMobileTab('profile'); else setShowProfileModal(true); }}
              onOrdersClick={() => { if (isMobile) setMobileTab('orders'); else setActiveTab('orders'); }}
              onSignOutClick={handleLogout}
            />

            {/* Hamburger for tablet/mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 border border-slate-200 rounded-xl lg:hidden hover:bg-slate-50 text-slate-600 hover:text-[#1B4D3E] transition-all cursor-pointer ml-1"
            >
              {isMobileMenuOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </header>
      
      {/* Hamburger dropdown for md/tablet screens */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden border-b border-slate-100 bg-white overflow-hidden shadow-sm z-40 relative"
          >
            <div className="px-4 py-3 space-y-1.5 flex flex-col">
              <button onClick={() => { setActiveTab('menu'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${ activeTab === 'menu' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50' }`}>
                <ChefHat className="w-4 h-4" /> Menu
              </button>
              <button onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${ activeTab === 'orders' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50' }`}>
                <ShoppingBag className="w-4 h-4" /> My Orders
              </button>
              <button onClick={() => { setActiveTab('cart'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${ activeTab === 'cart' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50' }`}>
                <ShoppingCart className="w-4 h-4" /> Cart
                {Object.values(cart).reduce((s: number, v) => s + (v as number), 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#1B4D3E] text-white text-[9px] font-black rounded-full">
                    {Object.values(cart).reduce((s: number, v) => s + (v as number), 0)}
                  </span>
                )}
              </button>
              {isUserAdmin && (
                <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-3 text-left text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${ activeTab === 'admin' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-100' }`}>
                  <Shield className="w-4 h-4" /> Admin
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Canvas */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full text-slate-900">
        
        {studentProfile === null && !isProfileLoading && user.role === 'customer' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 text-slate-900 text-xs">
            <div className="space-y-1">
              <h5 className="font-bold text-slate-950 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Student Profile Incomplete
              </h5>
              <p className="text-slate-600">Please provide your Academic Roll Number, Branch, and contact details to check out.</p>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-black hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-xs"
            >
              Configure Profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              <ErrorBoundary>
                <AdminPanel 
                  onBack={() => setActiveTab('menu')}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  foodItems={menuItems}
                  onAddMenuItem={handleAddMenuItem}
                  onEditMenuItem={handleEditMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                  students={allStudents}
                  paymentSettings={paymentSettings}
                  onUpdatePaymentSettings={handleUpdatePaymentSettings}
                  onToggleStudentVerify={handleToggleStudentVerify}
                />
              </ErrorBoundary>
            </motion.div>

          ) : activeTab === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="max-w-3xl mx-auto"
              transition={{ duration: 0.18 }}
            >
              {isOrdersLoading && orders.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-5 border border-slate-100 rounded-3xl gap-3">
                    <div className="h-6 w-36 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                      <div className="flex justify-between border-b border-slate-100 pb-4">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded-md" />
                          <div className="h-3.5 w-48 bg-slate-150 rounded-md" />
                        </div>
                        <div className="h-10 w-20 bg-slate-200 rounded-xl" />
                      </div>
                      <div className="h-2 w-full bg-slate-150 rounded-full" />
                      <div className="flex justify-between pt-2">
                        <div className="h-3 w-16 bg-slate-150 rounded-md" />
                        <div className="h-3 w-12 bg-slate-150 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                <div className="bg-white rounded-3xl border border-red-100 p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-slate-800 text-sm">Failed to Load Orders</h4>
                    <p className="text-xs text-red-650 max-w-sm mx-auto leading-relaxed font-semibold">{ordersError}</p>
                  </div>
                  <button
                    onClick={fetchUserOrders}
                    className="px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <OrderProgress 
                  orders={orders} 
                  onCancelOrder={(id) => handleUpdateOrderStatus(id, 'Cancelled')} 
                  onRefresh={fetchUserOrders} 
                />
              )}
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="max-w-md mx-auto"
              transition={{ duration: 0.18 }}
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border text-slate-800">
                    <User className="w-5 h-5 text-swiggy-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm">My Profile Card</h4>
                    <p className="text-slate-450 text-[11px]">Manage your profile and delivery choices</p>
                  </div>
                </div>

                {studentProfile ? (
                  <div className="space-y-3 font-sans">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Your Full Name</span>
                      <strong className="text-slate-900 text-xs">{studentProfile.fullName}</strong>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Verified Email Address</span>
                      <strong className="text-slate-900 text-xs break-all">{studentProfile.email || user.email}</strong>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Contact Number</span>
                      <strong className="text-slate-900 font-mono text-xs">{studentProfile.contactNo}</strong>
                    </div>

                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="w-full py-2.5 bg-black hover:bg-slate-900 text-white font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer text-center"
                    >
                      Modify Profile Details
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-slate-500 font-medium">No active Swiggy Profile found.</p>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="bg-black hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Set Up My Profile Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'cart' ? (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#1B4D3E]" />
                  <h2 className="font-black text-slate-900 text-base">Your Cart</h2>
                </div>
                <div className="p-5">
                  <CartDrawer
                    user={user!}
                    cart={cart}
                    menuItems={menuItems}
                    onUpdateCart={handleUpdateCart}
                    onClearCart={handleClearCart}
                    onOrderPlacement={(order) => { handleOrderCreated(order); setActiveTab('orders'); }}
                    onExploreMenu={() => { setFilteredStoreId(null); setSelectedCategory('All'); setSearchQuery(''); setActiveTab('menu'); }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* ═══════════════════════════════════════════════════
                   MOBILE-STYLE HERO BANNER FOR DESKTOP
              ═══════════════════════════════════════════════════ */}
              <div
                className="relative rounded-2xl text-white overflow-hidden shadow-xl select-none"
                style={{ background: 'linear-gradient(135deg, #1B4D3E 0%, #225C47 45%, #2E7D5A 100%)' }}
              >
                {/* Glowing orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left contents */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                        Order Food<br />& Essentials.
                      </h1>
                    </div>
                  </div>

                  {/* Right illustration / overlapping stacked burger image */}
                  <div className="hidden lg:flex lg:col-span-5 justify-end relative h-[220px] pointer-events-none">
                    <img 
                      src={explodedBurgerClean} 
                      alt="Canteen Special" 
                      className="w-[260px] h-[260px] object-contain drop-shadow-2xl absolute -bottom-12 right-4"
                    />
                  </div>
                </div>
              </div>

              {/* Today's Specials Slider */}
              <div className="w-full">
                <TodaysSpecialsSlider
                  items={menuItems}
                  cart={cart}
                  onUpdateCart={handleUpdateCart}
                  userRole={user?.role}
                  onGoToAdmin={() => setActiveTab('admin')}
                />
              </div>

              {/* ═══════════════════════════════════════════════════
                   3-COLUMN SWIGGY-STYLE LAYOUT
                   Left: Filters  |  Center: Menu
              ═══════════════════════════════════════════════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">

                {/* ═══ LEFT SIDEBAR: Filters ═══ */}
                <aside className="hidden lg:block space-y-4 sticky top-[90px] self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1">
                  {/* Filter Panel */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="w-4 h-4 text-[#1B4D3E]" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Filters & Sort</span>
                    </div>

                    {/* Veg/Non-Veg Toggle */}
                    <div className="pb-4 border-b border-slate-100 mb-4">
                      <button
                        onClick={() => setVegetarianOnly(!vegetarianOnly)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          vegetarianOnly
                            ? 'bg-[#E8F5E9] border-[#1B4D3E] text-[#1B4D3E]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Leaf className="w-3.5 h-3.5" />
                          Pure Veg Only
                        </span>
                        <div className={`w-8 h-4 rounded-full transition-all relative ${ vegetarianOnly ? 'bg-green-500' : 'bg-slate-200' }`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${ vegetarianOnly ? 'left-[17px]' : 'left-0.5' }`} />
                        </div>
                      </button>
                    </div>

                    {/* Categories */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Categories</p>
                      {['All','Breakfast','Meals','Beverages','Snacks','Desserts'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                            selectedCategory === cat
                              ? 'bg-[#1B4D3E] text-white'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{cat === 'All' ? '🍽️' : cat === 'Breakfast' ? '🌅' : cat === 'Meals' ? '🍔' : cat === 'Beverages' ? '☕' : cat === 'Snacks' ? '🍟' : '🍕'}</span>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* ── CENTER: Menu Items ── */}
                <div className="space-y-4 min-w-0">
                  {isMenuLoading ? (
                    <MenuSkeleton count={4} />
                  ) : (
                    <CanteenMenu
                      items={menuItems}
                      cart={cart}
                      onUpdateCart={handleUpdateCart}
                      filteredStoreId={filteredStoreId}
                      onClearStoreFilter={() => setFilteredStoreId(null)}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      vegetarianOnly={vegetarianOnly}
                      setVegetarianOnly={setVegetarianOnly}
                    />
                  )}
                </div>

                {/* ── RIGHT: Sticky Cart removed — Cart is now its own tab ── */}

              </div>

              {/* Mobile Sticky Floating Cart Bar */}
              {mobileCartItemCount > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-40 md:hidden">
                  <button
                    onClick={() => setIsMobileCartOpen(true)}
                    className="w-full bg-[#1B4D3E] text-white px-5 py-4 rounded-2xl shadow-xl flex items-center justify-between font-sans hover:bg-[#2E7D5A] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E8F5E9]/20 p-2 rounded-xl text-white">
                        <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E8F5E9] block leading-none font-sans">Your Basket</span>
                        <span className="text-xs font-black mt-1 block leading-none">
                          {mobileCartItemCount} {mobileCartItemCount === 1 ? 'item' : 'items'} • ₹{mobileCartSubtotal}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                      <span>View Cart</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}

              {/* Mobile Slide-up Bottom Drawer Sheet */}
              <AnimatePresence>
                {isMobileCartOpen && (
                  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden flex items-end">
                    <div className="absolute inset-0" onClick={() => setIsMobileCartOpen(false)} />
                    
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      className="w-full bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto"
                    >
                      {/* Drag handlebar */}
                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setIsMobileCartOpen(false)} />
                      
                      {/* Header with Close */}
                      <div className="flex items-center justify-between px-6 pb-2 border-b border-slate-100">
                        <h3 className="font-display font-black text-slate-800 text-sm uppercase tracking-wide">Mobile Canteen Basket</h3>
                        <button
                          onClick={() => setIsMobileCartOpen(false)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all cursor-pointer"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <CartDrawer 
                          user={user!}
                          cart={cart}
                          menuItems={menuItems}
                          onUpdateCart={handleUpdateCart}
                          onClearCart={() => { handleClearCart(); setIsMobileCartOpen(false); }}
                          onOrderPlacement={(order) => { handleOrderCreated(order); setIsMobileCartOpen(false); }}
                          onExploreMenu={() => { setFilteredStoreId(null); setSelectedCategory('All'); setSearchQuery(''); setIsMobileCartOpen(false); }}
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════════════════════════════════════
           SHARED APP FOOTER
      ═══════════════════════════════════════ */}
      <AppFooter onPolicyClick={(key) => setComplianceModal(key)} className="mt-16" />

      {/* Compliance / Policy Modal */}
      <AnimatePresence>
        {complianceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setComplianceModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-sans font-bold text-base text-slate-950 uppercase tracking-wide">
                  {complianceModal === 'terms' && 'Terms & Conditions'}
                  {complianceModal === 'privacy' && 'Privacy Policy'}
                  {complianceModal === 'refund' && 'Refund & Cancellation Policy'}
                  {complianceModal === 'contact' && 'Contact Us'}
                </h3>
                <button
                  onClick={() => setComplianceModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-3 leading-relaxed font-sans">
                {complianceModal === 'terms' && (
                  <>
                    <p className="font-semibold text-slate-800">1. Services Provided</p>
                    <p>CampusBites Hub provides digital pre-ordering and booking management for student dining, smart mess cards, and canteen canteens within our campus network.</p>
                    <p className="font-semibold text-slate-800">2. Account Registration</p>
                    <p>Users must register with an official institution-affiliated email account and complete setup of their college profile (including roll number/department) to receive order items.</p>
                    <p className="font-semibold text-slate-800">3. Food Handling & Responsibilities</p>
                    <p>Food preparations are handled dynamically by our verified canteen kitchens. Users should collect their meals promptly once notifications mark order statuses as 'Ready for Pickup'.</p>
                    <p className="font-semibold text-slate-800">4. Wallet Balance & UPI</p>
                    <p>The Valute Wallet holds non-withdrawable campus dining credits. Deposits made via UPI or online pathways are instantly reflected as digital credits.</p>
                  </>
                )}

                {complianceModal === 'privacy' && (
                  <>
                    <p className="font-semibold text-slate-800">1. Data Storage</p>
                    <p>We process basic credentials including your name, email, department, roll number, and phone details to identify you and prevent food distribution errors.</p>
                    <p className="font-semibold text-slate-800">2. Secure Payment Intermediaries</p>
                    <p>All online checkouts and deposit processing are handled securely via Razorpay payment gate keys. We never store credit cards, UPI strings, or private ledger values on our servers.</p>
                    <p className="font-semibold text-slate-800">3. Browsing & Caching</p>
                    <p>We utilize standard local state caching (localStorage) to persist sessions. Data is strictly utilized internally and is never shared or sold to advertising groups.</p>
                  </>
                )}

                {complianceModal === 'refund' && (
                  <>
                    <p className="font-semibold text-slate-800">1. Refund Eligibility Period</p>
                    <p>Canteen food items represent highly immediate, perishable inventory. Refund ranges are dictated by actual cooking progress tracking:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Pending orders (unapproved)</strong>: Eligible for a <strong>100% full refund</strong> instantly credited back to the digital Valute wallet.</li>
                      <li><strong>Approved or Cooking orders</strong>: Eligible for a <strong>50% partial refund</strong> back to your wallet, to satisfy the sunk costs of physical food items already processed.</li>
                      <li><strong>Ready for pickup / Completed orders</strong>: Non-refundable under any conditions.</li>
                    </ul>
                    <p className="font-semibold text-slate-800">2. Refund Processing Time</p>
                    <p>Refund values are instant. Wallet ledger credits are handled instantly upon manual cancellation via our internal transaction ledger.</p>
                  </>
                )}

                {complianceModal === 'contact' && (
                  <>
                    <p className="font-semibold text-slate-800">Support & Compliance Desk</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Please reach out to our campus support team via email for any payment or operational inquiries:
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-3 text-center">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold mb-1">Support Email</span>
                      <a href="mailto:amareshkaturi@gmail.com" className="text-[#1B4D3E] hover:underline font-extrabold text-sm">
                        amareshkaturi@gmail.com
                      </a>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setComplianceModal(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Setup / Modification Overlays Popup Modal */}
      {showProfileModal && (
        <ProfileModal
          initialProfile={studentProfile || undefined}
          userEmail={user.email}
          defaultName={user.name}
          onSave={handleProfileSaved}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {placedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-black text-slate-950 text-xl tracking-tight">
                Order Placed Successfully
              </h3>
              <p className="text-xs text-slate-500">
                Your order ticket has been dispatched to the kitchen.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Token Number</span>
              <span className="text-3xl font-mono font-black text-slate-950 mt-1 block tracking-tight">
                {placedOrder.tokenNumber}
              </span>
              <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                Meal Category: <strong className="text-slate-800">{placedOrder.mealCategory || 'Snacks'}</strong>
              </span>
              
              {/* Ticket Dotted Separator decoration */}
              <div className="absolute left-0 right-0 top-0 h-1 flex justify-between px-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-full -mt-0.75 border border-slate-200" />
                ))}
              </div>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white text-xs font-black uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
            >
              Track Order Progress
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
