import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChefHat, Sparkles, LogOut, Clock, BookOpen, User, Bell, Shield, ArrowRight, Menu as MenuIcon, X as XIcon, Store, Tag, MapPin, Gift, Percent, Search, Home, ChevronDown, Mic, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Order, StudentProfile, PaymentSettings, SystemNotification } from './types';
import { AuthScreen } from './components/AuthScreen';
import { CanteenMenu } from './components/CanteenMenu';
import { CartDrawer } from './components/CartDrawer';
import { OrderProgress } from './components/OrderProgress';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { FallbackImage } from './components/FallbackImage';
import { MenuSkeleton } from './components/MenuSkeleton';
import { LandingPage } from './components/LandingPage';
import { StoreList } from './components/StoreList';
import { OffersPanel } from './components/OffersPanel';
import { TodaysSpecialsSlider } from './components/TodaysSpecialsSlider';
import MenuItemCardDemo from '@/demo';

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: 'customer' | 'admin' } | null>(null);
  const [isPopupBootstrapping, setIsPopupBootstrapping] = useState<boolean>(false);

  // Intercept popup bootstrap flow to prevent reverse proxy OAuth bridge failures
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_auth_init') === 'true' && window.opener) {
      setIsPopupBootstrapping(true);
      localStorage.removeItem('google_auth_popup_active');
      
      fetch('/api/auth/google-url')
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
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'profile' | 'admin' | 'stores' | 'offers' | 'demo'>('menu');
  const [filteredStoreId, setFilteredStoreId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);

  // Mobile Redesign states
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'orders' | 'stores' | 'cart' | 'profile'>('home');
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
  const [selectedCampus, setSelectedCampus] = useState<string>('Sphoorthy Main Campus');
  const [selectedLocation, setSelectedLocation] = useState<string>('Block B Dining Hall');
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);

  // Advanced Integrated State features
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
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

  // 1. Session restore
  useEffect(() => {
    const cached = localStorage.getItem('canteen_user');
    if (cached) {
      try {
        const parsedUser = JSON.parse(cached);
        setUser(parsedUser);
        
        // Restore pre-cached student profile instantly on startup/reload
        const cachedProfile = localStorage.getItem(`student_profile_${parsedUser.id}`);
        if (cachedProfile) {
          try {
            setStudentProfile(JSON.parse(cachedProfile));
            setIsProfileLoading(false);
          } catch (pe) {
            console.error("Could not parse cached student profile:", pe);
          }
        }
      } catch (e) {
        console.error("Could not parse user session:", e);
      }
    } else {
      setIsProfileLoading(false);
    }
  }, []);

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
      const response = await fetch('/api/menu');
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        setMenuItems(data);
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
    try {
      const isAdmin = user.role === 'admin';
      const endpoint = isAdmin ? '/api/admin/orders' : `/api/orders/user/${user.id}`;
      const response = await fetch(endpoint);
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        setOrders(data);

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
        console.warn("Orders user endpoint returned non-JSON or offline fallback.");
      }
    } catch (e) {
      console.warn("Could not pull user orders safely:", e);
    }
  };

  // 4. Fetch dynamic payment merchant configs
  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment/settings');
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        setPaymentSettings(data);
      }
    } catch (err) {
      console.warn("Could not load payment settings:", err);
    }
  };

  // 5. Fetch student profiles with ultra-reliable local cache fallback and background auto-sync recover
  const fetchStudentProfile = async () => {
    if (!user) {
      setIsProfileLoading(false);
      return;
    }
    try {
      setIsProfileLoading(true);
      const response = await fetch(`/api/student/profile/${user.id}?email=${encodeURIComponent(user.email || '')}`);
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setStudentProfile(data);
          localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(data));
        } else {
          // Check local cache too before showing the modal
          const localCheck = localStorage.getItem(`student_profile_${user.id}`);
          if (localCheck) {
            try {
              const parsed = JSON.parse(localCheck);
              setStudentProfile(parsed);
              // Proactively restore / sync this profile to the server database
              fetch('/api/student/profile/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, profile: parsed })
              }).catch(syncErr => console.warn("Auto-sync profile on recovery failed:", syncErr));
            } catch (pErr) {
              setStudentProfile(null);
              if (user.role === 'customer') {
                setShowProfileModal(true);
              }
            }
          } else {
            setStudentProfile(null);
            if (user.role === 'customer') {
              setShowProfileModal(true);
            }
          }
        }
      } else {
        // Fallback to cache if request was not successful
        const localCheck = localStorage.getItem(`student_profile_${user.id}`);
        if (localCheck) {
          try {
            setStudentProfile(JSON.parse(localCheck));
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn("Could not fetch student profiles:", err);
      // Fallback to cache on complete connection failure
      const localCheck = localStorage.getItem(`student_profile_${user.id}`);
      if (localCheck) {
        try {
          setStudentProfile(JSON.parse(localCheck));
        } catch (_) {}
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 6. Fetch Admin students summaries
  const fetchAllStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
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
        body: JSON.stringify({ userId: studentUserId, isVerified: newVerifyStatus })
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
    }, 10000); // Dynamic real-time menu cache updates (every 10s)
    return () => clearInterval(menuInterval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchStudentProfile();
      if (user.role === 'admin') {
        fetchAllStudents();
      }
      const interval = setInterval(() => {
        fetchUserOrders();
      }, 4000); // Poll tracking statuses
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const handleUpdateCart = (item: FoodItem, qty: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = qty;
      }
      if (user?.id) {
        localStorage.setItem(`cart_cache_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
    if (user?.id) {
      localStorage.removeItem(`cart_cache_${user.id}`);
    }
  };

  const handleAuthSuccess = (authUser: typeof user | any) => {
    setUser(authUser);
    if (authUser?.studentProfile) {
      setStudentProfile(authUser.studentProfile);
      localStorage.setItem(`student_profile_${authUser.id}`, JSON.stringify(authUser.studentProfile));
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
  };

  const handleLogout = () => {
    localStorage.removeItem('canteen_user');
    setUser(null);
    setCart({});
    setOrders([]);
    setStudentProfile(null);
    setActiveTab('menu');
  };

  // Order status progression & admin updates with automatic cancellation refunds (Feature 30)
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
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
    setOrders(prev => [order, ...prev]);
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
    try {
      const response = await fetch('/api/menu/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemPayload)
      });
      if (response.ok) {
        fetchMenu();
        addNotification('Canteen Catalogue Updated', `Delicacy "${itemPayload.name}" was appended to the chef schedule.`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditMenuItem = async (itemId: string, itemPayload: any) => {
    try {
      const response = await fetch(`/api/menu/${itemId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemPayload)
      });
      if (response.ok) {
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/${itemId}/delete`, {
        method: 'DELETE'
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
        body: JSON.stringify(settingsPayload)
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
        body: JSON.stringify({ userId: user?.id, profile: profilePayload })
      });
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(profilePayload);
        if (user?.id) {
          localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(profilePayload));
        }
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
            `Registry locked in local server-memory. Connect Supabase database in Settings to persist to cloud.`,
            'info'
          );
        }
        if (user?.role === 'admin') {
          fetchAllStudents();
        }
      }
    } catch (err) {
      console.error(err);
      addNotification(
         'Sync Failure',
         'Could not establish registry lock with canteen terminals.',
         'alert'
      );
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F2F7F5]">
        <LandingPage
          onSignIn={() => {
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
                      <p>Please reach out to our campus dining coordinator team with any payment, operational, or cancellation issues:</p>
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1 border border-slate-100 mt-2 font-mono text-[10px] text-slate-700">
                        <p><strong>Merchant Legal Identity:</strong> Amaresh Katuri (CampusBites Consortium)</p>
                        <p><strong>Support Email:</strong> amareshkaturi@gmail.com</p>
                        <p><strong>Operational Address:</strong> Block B, Central Canteen & Dining, Academic Campus Area, Sphoorthy Engineering College, Chennai / Hyderabad, India</p>
                        <p><strong>Helpline Representative:</strong> Digital Dining Desk</p>
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

    const quickCategories = [
      { label: 'Meals', icon: '🍔', cat: 'Meals' },
      { label: 'Beverages', icon: '☕', cat: 'Beverages' },
      { label: 'Snacks', icon: '🍟', cat: 'Snacks' },
      { label: 'Desserts', icon: '🍕', cat: 'Desserts' },
      { label: 'Stationery', icon: '📚', cat: 'Stationery' },
      { label: 'Printouts', icon: '🖨', cat: 'Stationery' },
      { label: 'Lab Kits', icon: '🧪', cat: 'Stationery' },
    ];

    const campusLocations = [
      'Block B Dining Hall',
      'Administrative Admin Block A',
      'Mechanical Engg Block C',
      'Boys Mess Wing Ground',
      'SPHN Main Campus Lounge'
    ];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between pb-22 select-none relative overflow-x-hidden">
        
        {/* Compact Swiggy-style Sticky Mobile Header (Height: 70px) */}
        <header className="sticky top-0 z-45 h-[70px] bg-white border-none flex items-center justify-between px-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] shrink-0">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#1B4D3E] flex items-center justify-center text-white font-black text-sm">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-slate-900 text-xs font-black tracking-tight leading-none uppercase block">CampusBites</span>
              <span className="text-[#4CAF50] text-[8px] uppercase font-extrabold block tracking-normal leading-none mt-0.5">SPHOORTHY HUB</span>
            </div>
          </div>

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

        {/* Slider Choice Modal for SPHN Campus Locations */}
        {showLocationSelector && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-55 flex items-end">
            <div className="absolute inset-0" onClick={() => setShowLocationSelector(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-3xl p-5 shadow-2xl relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-display font-black text-slate-800 text-sm uppercase tracking-wide">Select Delivery Hub</h3>
                <button onClick={() => setShowLocationSelector(false)} className="text-slate-400 text-lg font-bold">×</button>
              </div>
              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
                {campusLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationSelector(false);
                      addNotification('📍 Location Updated', `Delivery point changed to ${loc}.`, 'info');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedLocation === loc ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <span className="text-[#4CAF50] font-black">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Nav Tabs Body rendering conditional content */}
        <main className="flex-1 w-full bg-white">
          <AnimatePresence mode="wait">
            {mobileTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-0"
              >
                {/* 1. Greeting Section */}
                <div className="px-4 py-3 bg-white text-left">
                  <span className="text-xs text-slate-400 font-medium block">Good {getTimeOfDay()} 👋</span>
                  <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                    {studentProfile?.fullName || user.name || 'Mummadi Shiva Ganesh'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">What would you like today to supercharge your study day?</p>
                </div>

                {/* 2. Full-Width Sticky Search Bar */}
                <div className="px-4 pb-3 bg-white sticky top-[70px] z-30">
                  <div className="relative flex items-center bg-slate-100 rounded-2xl h-[46px] px-4 border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search food, snacks, stationery..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder-slate-400"
                    />
                    {searchQuery ? (
                      <button onClick={() => setSearchQuery('')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1.5 cursor-pointer">Clear</button>
                    ) : (
                      <Mic 
                        className="w-4 h-4 text-slate-400 cursor-pointer hover:text-[#1B4D3E]" 
                        onClick={() => {
                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (SpeechRecognition) {
                            const recognition = new SpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.interimResults = false;
                            recognition.onstart = () => {
                              addNotification('🎙️ Voice Search', 'Listening to order cue... speak now', 'info');
                            };
                            recognition.onresult = (event: any) => {
                              const speakText = event.results[0][0].transcript;
                              setSearchQuery(speakText);
                              addNotification('🎙️ Voice Capture', `Searched: "${speakText}"`, 'success');
                            };
                            recognition.start();
                          } else {
                            addNotification('🎙️ Voice Search Info', 'Speak "Dosa" or "Coffee" directly. Custom voice engine init.', 'info');
                          }
                        }} 
                      />
                    )}
                  </div>
                </div>

                {/* 3. Today's Specials Dynamic Slider */}
                <div className="px-4 py-1 bg-white">
                  <TodaysSpecialsSlider
                    items={menuItems}
                    cart={cart}
                    onUpdateCart={handleUpdateCart}
                    userRole={user?.role}
                    onGoToAdmin={() => {
                      setIsMobile(false);
                      setActiveTab('admin');
                    }}
                  />
                </div>



                {/* 5. Recommended list using CanteenMenu with hideSearchHeader prop */}
                <div className="bg-white py-4 px-4 text-left border-b border-slate-100">
                  {isMenuLoading ? (
                    <MenuSkeleton count={3} hidePills={true} hidePromo={true} />
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-display font-black text-slate-800 text-[11px] uppercase tracking-wider">Recommended Items list</h3>
                        <button
                          onClick={() => setVegetarianOnly(!vegetarianOnly)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                            vegetarianOnly ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B4D3E]' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 border rounded flex items-center justify-center p-[1px] ${vegetarianOnly ? 'border-[#4CAF50]' : 'border-slate-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${vegetarianOnly ? 'bg-[#4CAF50]' : 'bg-transparent'}`} />
                          </div>
                          <span>Veg Only</span>
                        </button>
                      </div>

                      {filteredStoreId && (
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl mb-3.5 text-[10px] uppercase font-bold text-[#1B4D3E]">
                          <span>Filtering outlet: {filteredStoreId === 'canteen_cafe' ? 'Campus Cafe' : filteredStoreId === 'books_depot' ? 'Stationery Depot' : 'Coffee Lounge'}</span>
                          <button onClick={() => { setFilteredStoreId(null); setSelectedCategory('All'); }} className="underline font-black">Reset</button>
                        </div>
                      )}

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
                        hideSearchHeader={true}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {mobileTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 bg-slate-50 min-h-[75vh]"
                transition={{ duration: 0.18 }}
              >
                <OrderProgress 
                  orders={orders} 
                  onCancelOrder={(id) => handleUpdateOrderStatus(id, 'Cancelled')} 
                  onRefresh={fetchUserOrders} 
                  onGoToMenu={() => setMobileTab('home')}
                />
              </motion.div>
            )}

            {mobileTab === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 bg-white min-h-[75vh] text-left"
                transition={{ duration: 0.18 }}
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
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 bg-slate-50 min-h-[75vh] space-y-4"
                transition={{ duration: 0.18 }}
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border text-[#1B4D3E]">
                      <User className="w-5 h-5 text-swiggy-orange" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-950 text-sm">Canteen User Profile</h4>
                      <p className="text-slate-400 text-[11px]">Manage your food delivery details</p>
                    </div>
                  </div>

                  {studentProfile ? (
                    <div className="space-y-3 font-sans">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Your Full Name</span>
                        <strong className="text-slate-900 text-xs">{studentProfile.fullName}</strong>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Verified Email Address</span>
                        <strong className="text-slate-900 text-xs break-all">{studentProfile.email || user.email}</strong>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Contact mobile number</span>
                        <strong className="text-slate-900 font-mono text-xs">{studentProfile.contactNo}</strong>
                      </div>

                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-full py-2.5 bg-[#1B4D3E] hover:bg-[#2E7D5A] active:scale-95 text-white font-bold rounded-xl transition-all cursor-pointer text-center text-xs"
                      >
                        Modify Profile Details
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-slate-500 font-medium">No active Swiggy Profile found.</p>
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="bg-[#1B4D3E] text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 cursor-pointer transition-all"
                      >
                        Set Up My Profile Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Account details card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-3 text-left">
                  <h3 className="font-bold text-slate-950 text-sm">Account Settings</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Logged in as <strong className="text-slate-600 font-mono">{user.email}</strong> • Access level: <strong className="capitalize text-[#1B4D3E]">{user.role}</strong></p>
                  
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin'); setIsMobile(false); }}
                        className="flex-1 py-2.5 border border-slate-200 bg-slate-50 text-slate-800 text-center rounded-xl font-bold cursor-pointer hover:bg-slate-100 text-xs"
                      >
                        Open Admin Box (PC view)
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2.5 bg-red-50 text-red-650 text-red-600 rounded-xl font-bold text-center cursor-pointer border border-red-100 hover:bg-red-100 text-xs"
                    >
                      Log Out Session
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Custom Swiggy Bottom Basket Bar (When count > 0 and not on cart tab) */}
        {mobileCartItemCount > 0 && mobileTab !== 'cart' && (
          <div className="fixed bottom-[74px] left-4 right-4 z-40 select-none">
            <button
              onClick={() => setMobileTab('cart')}
              className="w-full bg-[#1B4D3E] text-white px-4.5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between font-sans hover:bg-[#2E7D5A] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl text-white">
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100 block leading-none">Your Mobile Tray</span>
                  <span className="text-[11.5px] font-extrabold mt-1 block leading-none">
                    {mobileCartItemCount} {mobileCartItemCount === 1 ? 'Item' : 'Items'} • ₹{mobileCartSubtotal}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-black text-[11px] uppercase tracking-wider">
                <span>Configure Cart</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Sticky Mobile Bottom Navigation (White background, height 58px) */}
        <nav className="fixed bottom-0 left-0 right-0 z-45 bg-white h-[58px] border-t border-slate-100 flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] shrink-0">
          {[
            { tag: 'home', label: 'Home', icon: Home },
            { tag: 'orders', label: 'Orders', icon: ShoppingBag },
            { tag: 'cart', label: 'Cart', icon: ShoppingCart, count: mobileCartItemCount },
            { tag: 'profile', label: 'Profile', icon: User }
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = mobileTab === item.tag;
            return (
              <button
                key={item.tag}
                onClick={() => {
                  setMobileTab(item.tag as any);
                  if (item.tag === 'home') {
                    setActiveTab('menu');
                  } else if (item.tag === 'orders') {
                    setActiveTab('orders');
                    fetchUserOrders();
                  } else if (item.tag === 'profile') {
                    setActiveTab('profile');
                    fetchStudentProfile();
                  }
                }}
                className="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer select-none transition-all duration-200 outline-none"
              >
                <div className={`p-1.5 rounded-full transition-all duration-300 ${
                  isTabActive ? 'text-[#1B4D3E] scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute top-1.5 right-6 bg-red-500 text-white font-mono text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center font-bold scale-90 border-2 border-white">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-black transition-all duration-200 leading-none ${
                  isTabActive ? 'text-[#1B4D3E] transform translate-y-0.5' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

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
                {complianceModal === 'contact' && <p>Operational Desk: Block B dining counters, Academic Area. Helpline support available via SPHN terminals.</p>}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F7F5] text-slate-100 antialiased font-sans flex flex-col justify-between">
      
      {/* Sphoorthy Engineering College Brand Banner (Requirement 3) */}
      <FallbackImage
        srcs={[
          '/assets/college_banner.png',
          '/assets/college_banner.jpg',
          '/assets/banner.png',
          '/assets/banner.jpg',
          '/banner.png',
          '/banner.jpg'
        ]}
        alt="Sphoorthy Engineering College Banner"
        type="banner"
        className="w-full h-auto max-h-48 object-cover border-b border-slate-200"
      />
      
      {/* SubtleSpacing details between top banner and navbar (Requirement 9) */}
      <div className="h-2 w-full bg-slate-100/50 border-b border-slate-200/40"></div>

      {/* Top Universal Header */}
      <header id="main-header" className="h-20 bg-white sticky top-0 z-45 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand area (Swiggy Signature Locator Layout) */}
          <button 
            onClick={() => { setActiveTab('menu'); setFilteredStoreId(null); }}
            className="flex items-center gap-3 hover:opacity-90 transition-all text-left bg-transparent border-none outline-none cursor-pointer"
          >
            <FallbackImage
              srcs={[
                '/assets/college_logo.png',
                '/assets/logo.png',
                '/logo.png',
                '/assets/logo.jpg',
                '/assets/logo.svg'
              ]}
              alt="Sphoorthy Engineering College Logo"
              type="logo"
              className="w-12 h-12 object-contain rounded-full shrink-0 border border-emerald-500/15 p-0.5"
            />
            <div className="flex flex-col">
              <span className="font-display font-black text-lg text-[#1B4D3E] tracking-tight leading-none uppercase">
                CampusBites
              </span>
              <span className="text-[10px] text-[#4CAF50] font-black tracking-wider uppercase block mt-1.5 font-mono">
                SPHN Campus
              </span>
            </div>
          </button>

          {/* Nav Links Tabs & Session controllers */}
          <div className="flex items-center gap-2 sm:gap-6 h-full text-slate-900">
            
            {/* View selectors - HIDDEN on mobile, visible on medium+ screens */}
            <nav className="hidden md:flex gap-8 text-sm font-black h-20">
              <button
                onClick={() => { setActiveTab('menu'); }}
                className={`h-20 flex items-center gap-2 px-1.5 transition-all text-xs font-black uppercase tracking-wider cursor-pointer hover:text-[#1B4D3E] ${
                  activeTab === 'menu' ? 'text-[#1B4D3E] border-[#1B4D3E] border-b-4' : 'text-slate-400 border-transparent hover:border-slate-200 border-b-4'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                Menu
              </button>

              <button
                onClick={() => { setActiveTab('demo'); }}
                className={`h-20 flex items-center gap-2 px-1.5 transition-all text-xs font-black uppercase tracking-wider cursor-pointer hover:text-[#1B4D3E] ${
                  activeTab === 'demo' ? 'text-[#1B4D3E] border-[#1B4D3E] border-b-4' : 'text-slate-400 border-transparent hover:border-slate-200 border-b-4'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-650" />
                Card Demo
              </button>

              <button
                onClick={() => { setActiveTab('orders'); }}
                className={`h-20 flex items-center gap-2 px-1.5 transition-all text-xs font-black uppercase tracking-wider cursor-pointer relative hover:text-[#1B4D3E] ${
                  activeTab === 'orders' ? 'text-[#1B4D3E] border-[#1B4D3E] border-b-4' : 'text-slate-400 border-transparent hover:border-slate-200 border-b-4'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders
                {orders.some(o => ['Pending', 'Preparing', 'Ready for Pickup'].includes(o.status)) && (
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] absolute top-6 right-[-4px] animate-ping" />
                )}
              </button>



              {isUserAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`h-20 flex items-center gap-2 px-1.5 transition-all text-xs font-black uppercase tracking-wider cursor-pointer hover:text-[#1B4D3E] ${
                    activeTab === 'admin' ? 'text-[#1B4D3E] border-[#1B4D3E] border-b-4 font-black' : 'text-slate-400 border-transparent hover:border-slate-200 border-b-4'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Box
                </button>
              )}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3 border-l border-slate-100 pl-2 sm:pl-6 h-10 shrink-0">
              
              {/* Communication alerts drawer */}
              <NotificationsDrawer
                notifications={notifications}
                onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                onClearAll={() => setNotifications([])}
              />

              {/* Profile card details */}
              <button
                onClick={() => setShowProfileModal(true)}
                title="Edit Academic Profile"
                className="flex items-center gap-2 text-right hover:opacity-90 cursor-pointer bg-slate-50 border border-slate-150 p-1 rounded-xl hover:bg-slate-100 transition-all pr-2 sm:pr-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1B4D3E] flex items-center justify-center text-white shrink-0 text-xs font-black font-mono">
                  {user.name.slice(0,2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {isProfileLoading ? 'LOADING...' : 'MY PROFILE'}
                  </span>
                  <span className="text-[11px] font-black block leading-none text-slate-800">{user.name.split(' ')[0]}</span>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer text-slate-400"
                title="Log Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Hamburger Button for mobile devices (Requirement 11) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 border border-slate-200 rounded-xl md:hidden hover:bg-slate-50 text-slate-600 hover:text-[#1B4D3E] transition-all cursor-pointer ml-1"
                title="Toggle Menu Navigation"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="w-4 h-4" />
                ) : (
                  <MenuIcon className="w-4 h-4" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>
      
      {/* Mobile Nav Menu Drawer (Requirement 11) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-b border-slate-100 bg-white overflow-hidden shadow-xs"
          >
            <div className="px-4 py-3 space-y-1.5 flex flex-col text-slate-900 bg-white">
              <button
                onClick={() => {
                  setActiveTab('menu');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'menu' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                Menu
              </button>

              <button
                onClick={() => {
                  setActiveTab('demo');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'demo' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-650" />
                Card Demo
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </button>



              {isUserAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-3 text-left text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'admin' ? 'bg-[#E8F5E9] text-[#1B4D3E]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Box
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Canvas Fluid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full text-slate-900">
        
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
          {activeTab === 'demo' ? (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              <MenuItemCardDemo />
            </motion.div>
          ) : activeTab === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
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
              <OrderProgress 
                orders={orders} 
                onCancelOrder={(id) => handleUpdateOrderStatus(id, 'Cancelled')} 
                onRefresh={fetchUserOrders} 
              />
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
) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-8"
            >
              {/* 1. Stunning Organic Green Hero Banner exactly like mock */}
              <div 
                className="relative rounded-3xl text-white overflow-hidden p-6 sm:p-10 lg:p-12 shadow-xl flex flex-col justify-center select-none"
                style={{
                  background: `linear-gradient(135deg, #1B4D3E 0%, #225C47 50%, #2E7D5A 100%)`
                }}
              >
                {/* Decorative faint grid lines / glowing bubbles */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                  <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#4CAF50]/15 rounded-full blur-2xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-[#E8F5E9]/5 rounded-full blur-2xl animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Hero Left Content */}
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-flex items-center gap-1.5 bg-[#E8F5E9]/15 border border-[#4CAF50]/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wide text-[#E8F5E9] uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                      <span>SPHN CAMPUS EXCLUSIVE</span>
                    </div>

                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3.5xl lg:text-[44px] font-display font-extrabold tracking-tight text-white leading-tight">
                        Order Food & Essentials.<br />
                        Discover Campus Stores.<br />
                        <span className="text-[#4CAF50] relative inline-block">
                          CampusBites It.
                          <span className="absolute left-0 bottom-1 w-full h-1 bg-[#4CAF50]/40 rounded-full" />
                        </span>
                      </h1>
                      <p className="text-[11px] sm:text-xs text-slate-200 font-semibold max-w-md leading-relaxed mt-1">
                        Fresh meals, snacks, stationery, printouts and more. Delivered fast to your campus. Welcome back, <strong className="text-white">{user?.name}</strong>!
                      </p>
                    </div>
                  </div>

                  {/* Hero Right Floating Graphics Column mimicking mockup */}
                  <div className="hidden md:flex lg:col-span-5 relative h-[250px] md:h-[280px] items-center justify-center pointer-events-none select-none overflow-hidden">
                    {/* Circular backlight */}
                    <div className="absolute w-44 h-44 rounded-full bg-radial from-[#4CAF50]/15 to-transparent blur-xl" />
                    
                    {/* Burger FLOATER */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute top-[8%] left-[8%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-2 shadow-md flex items-center gap-2 max-w-[130px]"
                    >
                      <span className="text-xl">🍔</span>
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-900 text-[9px] leading-tight font-sans">Cheesy Burger</h4>
                        <span className="font-mono text-[9px] text-slate-500 font-bold block">₹120</span>
                      </div>
                    </motion.div>

                    {/* Coffee FLOATER */}
                    <motion.div 
                      animate={{ y: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut" }}
                      className="absolute top-[5%] right-[5%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-2 shadow-md flex items-center gap-2 max-w-[130px]"
                    >
                      <span className="text-xl">🥤</span>
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-900 text-[9px] leading-tight font-sans">Cold Coffee</h4>
                        <span className="font-mono text-[9px] text-slate-500 font-bold block">₹60</span>
                      </div>
                    </motion.div>

                    {/* Red Sauce Pasta FLOATER */}
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
                      className="absolute bottom-[8%] right-[10%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-2 shadow-md flex items-center gap-2 max-w-[140px]"
                    >
                      <span className="text-xl">🍝</span>
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-900 text-[9px] leading-tight font-sans">Red Sauce Pasta</h4>
                        <span className="font-mono text-[9px] text-slate-500 font-bold block">₹150</span>
                      </div>
                    </motion.div>

                    {/* Notebook FLOATER */}
                    <motion.div 
                      className="absolute bottom-[10%] left-[5%] bg-white/95 backdrop-blur-md border border-[#E8F5E9] rounded-xl p-2 shadow-md flex items-center gap-2 max-w-[130px]"
                    >
                      <span className="text-xl">📓</span>
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-900 text-[9px] leading-tight font-sans">Record Book</h4>
                        <span className="font-mono text-[9px] text-slate-500 font-bold block">₹40</span>
                      </div>
                    </motion.div>

                    {/* Big central beautiful mockup bags illustration */}
                    <div className="w-[180px] h-[180px] bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xs flex items-center justify-center relative overflow-hidden p-4">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-[#4CAF50] rounded-2xl flex items-center justify-center mx-auto text-xl text-white shadow-md">📦</div>
                        <span className="text-[10px] font-black tracking-widest text-[#E8F5E9] uppercase block font-sans">SPHN EXPRESS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Specials Dynamic Featured Slider (Responsive desktop and large screens support) */}
              <div className="w-full">
                <TodaysSpecialsSlider
                  items={menuItems}
                  cart={cart}
                  onUpdateCart={handleUpdateCart}
                  userRole={user?.role}
                  onGoToAdmin={() => {
                    setActiveTab('admin');
                  }}
                />
              </div>

              {/* 2. Three Column Responsive Dashboard Layout mirroring mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Columns (Canteen Catalogue & Store selection) */}
                <div className="lg:col-span-2 space-y-8">
                  




                  {/* Catalogue Products Render Spot */}
                  <div className="space-y-4">
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

                </div>

                {/* Right Sidebar Column - My Cart */}
                <div className="hidden lg:block lg:col-span-1 text-slate-900">
                  <div className="bg-white rounded-3xl p-6 shadow-xl sticky top-[180px] border border-slate-100">
                    <CartDrawer 
                      user={user!}
                      cart={cart}
                      menuItems={menuItems}
                      onUpdateCart={handleUpdateCart}
                      onClearCart={handleClearCart}
                      onOrderPlacement={handleOrderCreated}
                      onExploreMenu={() => { setFilteredStoreId(null); setSelectedCategory('All'); setSearchQuery(''); setActiveTab('menu'); }}
                    />
                  </div>
                </div>

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

      {/* Elegant minimalist footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500 w-full shrink-0">
        <p className="font-sans font-semibold text-slate-600 leading-none">CampusBites Hub • Sphoorthy Engineering College Canteen Portal</p>
        <p className="mt-1 text-slate-400">Powered by active PCI compliance Razorpay checkout pathways and Valute instant ledger transactions.</p>
        <div className="mt-3 flex justify-center space-x-4 flex-wrap gap-y-2 text-[11px] text-blue-600 font-medium">
          <button onClick={() => setComplianceModal('terms')} className="hover:underline cursor-pointer">Terms & Conditions</button>
          <span>•</span>
          <button onClick={() => setComplianceModal('privacy')} className="hover:underline cursor-pointer">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setComplianceModal('refund')} className="hover:underline cursor-pointer">Refund & Cancellation</button>
          <span>•</span>
          <button onClick={() => setComplianceModal('contact')} className="hover:underline cursor-pointer">Contact Us</button>
        </div>
      </footer>

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
                    <p>Please reach out to our campus dining coordinator team with any payment, operational, or cancellation issues:</p>
                    <div className="bg-slate-50 p-3 rounded-lg space-y-1 border border-slate-100 mt-2 font-mono text-[10px]">
                      <p><strong>Merchant Legal Identity:</strong> Amaresh Katuri (CampusBites Consortium)</p>
                      <p><strong>Support Email:</strong> amareshkaturi@gmail.com</p>
                      <p><strong>Operational Address:</strong> Block B, Central Canteen & Dining, Academic Campus Area, Chennai / Hyderabad, India</p>
                      <p><strong>Helpline Representative:</strong> Digital Dining Desk</p>
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

    </div>
  );
}
