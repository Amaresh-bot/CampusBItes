import { useState, useMemo, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Search,
  Bell,
  User,
  Star,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  GraduationCap,
  CheckCircle,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Printer,
  ShoppingBag as CartIcon,
  BookOpen,
  Edit,
  Home,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { Product, CartItem, PickupSlip } from './printTypes';
import { PRODUCTS, CATEGORIES } from './printData';

interface PrintHubProps {
  onBackToCanteen?: () => void;
  user?: any;
  studentProfile?: any;
}

export default function App({ onBackToCanteen, user, studentProfile }: PrintHubProps) {
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAdminImage(reader.result);
          addNotification('📸 Product image uploaded from device!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigation active states
  const [activeTab, setActiveTab] = useState<'stationery' | 'orders'>('stationery');
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Products Catalogue State (Durable state for admin controls)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sphn_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return PRODUCTS;
      }
    }
    return PRODUCTS;
  });

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem('sphn_products', JSON.stringify(productsList));
  }, [productsList]);

  // Cart State (initialized with empty as requested by user)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders lists state (storing submitted pickup slips)
  const [orders, setOrders] = useState<PickupSlip[]>(() => {
    const saved = localStorage.getItem('sphn_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem('sphn_orders', JSON.stringify(orders));
  }, [orders]);

  // History state for completed pick-ups
  const [pickupHistory, setPickupHistory] = useState<PickupSlip[]>(() => {
    const saved = localStorage.getItem('sphn_orders_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sphn_orders_history', JSON.stringify(pickupHistory));
  }, [pickupHistory]);

  // Product Sliding/Pagination state
  const [productPageIndex, setProductPageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const itemsPerPage = 6;

  // UI state for popovers and modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [currentSlip, setCurrentSlip] = useState<PickupSlip | null>(null);

  // Payment timer, verification states, and admin panel sub-tabs
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number>(600);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationText, setVerificationText] = useState<string>('');
  const [adminActiveTab, setAdminActiveTab] = useState<'catalog' | 'orders'>('catalog');
  
  // Custom store merchant configurations
  const [shopUpiId, setShopUpiId] = useState<string>(() => {
    return localStorage.getItem('sphn_shop_upi') || 'akshith5481@ybl';
  });

  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('sphn_shop_upi', shopUpiId);
  }, [shopUpiId]);

  // Xerox Customization state variables
  const [showXeroxCustomizeModal, setShowXeroxCustomizeModal] = useState(false);
  const [xeroxPrintType, setXeroxPrintType] = useState<'bw' | 'color'>('bw');
  const [xeroxFormat, setXeroxFormat] = useState<'one-side' | 'double-side'>('one-side');
  const [xeroxSpiralBinding, setXeroxSpiralBinding] = useState(false);
  const [xeroxStickFile, setXeroxStickFile] = useState(false);
  const [xeroxStaple, setXeroxStaple] = useState<'yes' | 'no'>('no');
  const [xeroxPageCount, setXeroxPageCount] = useState<number>(1);
  const [xeroxUploadedFile, setXeroxUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);

  // Razorpay simulated payment steps state
  const [razorpayStep, setRazorpayStep] = useState<'OPTIONS' | 'PROCESSING' | 'SUCCESS'>('OPTIONS');

  // Mobile navigation overlay cart toggle
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Custom action confirmations dialog modal state
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const promptConfirm = (message: string, onConfirm: () => void) => {
    setConfirmAction({ message, onConfirm });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setXeroxUploadedFile({
          name: file.name,
          type: file.type,
          url: reader.result as string
        });
        addNotification(`📄 file loaded successfully: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const [paymentSelectedApp, setPaymentSelectedApp] = useState('');

  const handleTriggerSimulatedPayment = (appName: string) => {
    setPaymentSelectedApp(appName);
    setRazorpayStep('PROCESSING');
    
    setTimeout(() => {
      setRazorpayStep('SUCCESS');
      
      let createdSlip: PickupSlip | null = null;
      if (pendingOrder) {
        createdSlip = {
          ...pendingOrder,
          status: 'PENDING'
        };

        // Sync order to database via API
        fetch('/api/print-orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: createdSlip })
        }).then(res => {
          if (!res.ok) {
            addNotification('⚠️ Could not sync order to Supabase cloud, operating locally.', 'update');
          } else {
            fetchPrintOrders();
          }
        }).catch(err => {
          console.error("Error creating print order:", err);
        });

        setOrders(prev => [createdSlip!, ...prev]);
        setCurrentSlip(createdSlip);
        setCart([]); // Clear cart
      }

      setTimeout(() => {
        setIsRazorpayOpen(false);
        setPendingOrder(null);
        setRazorpayStep('OPTIONS');
        setActiveTab('orders');
        addNotification(`💳 Payment verified via ${appName}! Pass ${createdSlip?.orderId || ''} is now active and generated.`, 'success');
      }, 2500);
      
    }, 2000);
  };

  // Track Razorpay Payment Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isRazorpayOpen && pendingOrder) {
      setPaymentTimeLeft(600); // 10 minutes (600 seconds) standard secure checkout
      setIsVerifying(false);
      setVerificationText('');
      interval = setInterval(() => {
        setPaymentTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            addNotification(`⏰ Secure payment session expired for order ${pendingOrder.orderId}. Order cancelled.`, 'failed');
            setIsRazorpayOpen(false);
            setPendingOrder(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRazorpayOpen, pendingOrder]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const upiUrl = useMemo(() => {
    if (!pendingOrder) return '';
    return `upi://pay?pa=9396363123-2@ybl&pn=Sphoorthy%20Stationery&am=${pendingOrder.total}&tr=${pendingOrder.orderId}&tn=Order%20${pendingOrder.orderId}`;
  }, [pendingOrder]);

  const renderProgressBar = (status: string) => {
    if (status === 'CANCELLED') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-2xl text-center font-sans">
          ❌ This order has been CANCELLED.
        </div>
      );
    }
    if (status === 'HOLD') {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-3 rounded-2xl text-center font-sans">
          ⚠️ This order is ON HOLD (Stock replenishment in progress).
        </div>
      );
    }

    const steps = [
      { label: 'Placed', active: true },
      { label: 'Accepted', active: status === 'ACCEPTED' || status === 'READY' || status === 'PICKED_UP' },
      { label: 'Ready', active: status === 'READY' || status === 'PICKED_UP' },
      { label: 'Picked Up', active: status === 'PICKED_UP' }
    ];

    return (
      <div className="py-4 px-2 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 font-sans w-full">
        <span className="text-[9px] font-mono uppercase text-slate-400 font-extrabold block text-center tracking-wider">Order Progress</span>
        <div className="flex items-center justify-between relative px-6">
          <div className="absolute left-8 right-8 top-3.5 h-[3px] bg-slate-200 -z-0" />
          <div 
            className="absolute left-8 top-3.5 h-[3px] bg-emerald-600 transition-all duration-500 -z-0" 
            style={{
              width: status === 'PICKED_UP' ? '100%' : status === 'READY' ? '66.6%' : status === 'ACCEPTED' ? '33.3%' : '0%'
            }}
          />

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-[10px] font-bold ${
                  step.active 
                    ? 'bg-[#0B4C38] border-[#0B4C38] text-white shadow' 
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {step.active ? '✓' : idx + 1}
              </div>
              <span 
                className={`text-[8.5px] mt-1.5 font-bold transition-all duration-300 whitespace-nowrap ${
                  step.active ? 'text-emerald-950 font-extrabold' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Admin Portal State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTitle, setAdminTitle] = useState('');
  const [adminPrice, setAdminPrice] = useState<number>(0);
  const [adminCategory, setAdminCategory] = useState('notebooks');
  const [adminImage, setAdminImage] = useState('/src/assets/images/product_navy_notebook_1781436252516.jpg');
  const [editId, setEditId] = useState<string | null>(null);
  const [adminOrdersTab, setAdminOrdersTab] = useState<'active' | 'history'>('active');
  const [adminInStock, setAdminInStock] = useState(true);

  // Authentication & Profile states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (user) return true;
    return localStorage.getItem('sphn_logged_in') === 'true';
  });
  const [studentName, setStudentName] = useState<string>(() => {
    if (studentProfile?.fullName) return studentProfile.fullName;
    if (user?.name) return user.name;
    return localStorage.getItem('sphn_student_name') || '';
  });
  const [rollNumber, setRollNumber] = useState<string>(() => {
    if (studentProfile?.rollNo) return studentProfile.rollNo;
    return localStorage.getItem('sphn_student_roll') || '';
  });
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    if (studentProfile?.branch) return studentProfile.branch;
    return localStorage.getItem('sphn_student_dept') || 'General CSE';
  });
  const [contactNumber, setContactNumber] = useState<string>(() => {
    if (studentProfile?.contactNo) return studentProfile.contactNo;
    return localStorage.getItem('sphn_student_contact') || '';
  });
  const [pickupTimeSlot, setPickupTimeSlot] = useState('Before 1:30');

  // Popup & modal states
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);

  // User orders sub-tab state
  const [userSubTab, setUserSubTab] = useState<'active' | 'history'>('active');

  // Persistence hooks for user profile & login
  useEffect(() => {
    localStorage.setItem('sphn_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('sphn_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('sphn_student_roll', rollNumber);
  }, [rollNumber]);

  useEffect(() => {
    localStorage.setItem('sphn_student_dept', selectedDept);
  }, [selectedDept]);

  useEffect(() => {
    localStorage.setItem('sphn_student_contact', contactNumber);
  }, [contactNumber]);

  // Sync canteen auth and student profile to PrintHub state
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      if (studentProfile) {
        if (studentProfile.fullName) setStudentName(studentProfile.fullName);
        if (studentProfile.rollNo) setRollNumber(studentProfile.rollNo);
        if (studentProfile.branch) setSelectedDept(studentProfile.branch);
        if (studentProfile.contactNo) setContactNumber(studentProfile.contactNo);
      } else if (user.name) {
        setStudentName(user.name);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [user, studentProfile]);

  // DB Sync methods for Print & Services orders
  const fetchPrintOrders = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/print-orders/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.filter((slip: any) => slip.status !== 'PICKED_UP'));
        setPickupHistory(data.filter((slip: any) => slip.status === 'PICKED_UP'));
      }
    } catch (err) {
      console.error("Failed to fetch print orders:", err);
    }
  };

  const fetchAllPrintOrders = async () => {
    try {
      const response = await fetch('/api/print-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch all print orders for admin:", err);
    }
  };

  useEffect(() => {
    if (isAdminOpen) {
      fetchAllPrintOrders();
    } else if (user?.id) {
      fetchPrintOrders();
    }
  }, [isAdminOpen, user?.id]);

  // Dynamic announcement/notification list (Initially empty as requested, loads from state/localStorage)
  const [announcements, setAnnouncements] = useState<{ id: string; text: string; time: string; unread: boolean; type?: string }[]>(() => {
    const saved = localStorage.getItem('sphn_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // Save announcements
  useEffect(() => {
    localStorage.setItem('sphn_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const addNotification = (text: string, type: 'success' | 'failed' | 'update') => {
    const newNotif = {
      id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      time: 'Just now',
      unread: true,
      type
    };
    setAnnouncements(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setAnnouncements(prev => prev.map(a => ({ ...a, unread: false })));
  };

  const clearNotifications = () => {
    setAnnouncements([]);
  };

  const handleChangeOrderStatus = (orderId: string, transitionStatus: 'ACCEPTED' | 'HOLD' | 'CANCELLED' | 'READY') => {
    // Save update to database
    fetch(`/api/print-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: transitionStatus })
    }).then(res => {
      if (res.ok) {
        if (isAdminOpen) fetchAllPrintOrders();
        else fetchPrintOrders();
      } else {
        addNotification('⚠️ Failed to update order status in Supabase.', 'failed');
      }
    }).catch(err => {
      console.error("Error updating print order status:", err);
    });

    setOrders(prev => prev.map(slip => {
      if (slip.orderId === orderId) {
        return { ...slip, status: transitionStatus };
      }
      return slip;
    }));

    // Notify the user dynamically
    let emojiAlert = '✅';
    let statusPhrase = 'accepted by SPHN store keeper';
    let labelType: 'success' | 'failed' | 'update' = 'success';
    if (transitionStatus === 'HOLD') {
      emojiAlert = '⚠️';
      statusPhrase = 'placed ON HOLD due to temporary stock replenishment';
      labelType = 'update';
    } else if (transitionStatus === 'CANCELLED') {
      emojiAlert = '❌';
      statusPhrase = 'CANCELLED. Please visit the store for support';
      labelType = 'failed';
    } else if (transitionStatus === 'READY') {
      emojiAlert = '📦';
      statusPhrase = 'marked ready for pickup';
      labelType = 'success';
    }

    addNotification(`${emojiAlert} Order reference ${orderId} has been ${statusPhrase}!`, labelType);
  };

  const unreadCount = announcements.filter(a => a.unread).length;

  // Cart controls
  const handleAddToCart = (product: Product) => {
    if (product.inStock === false) return; // Prevent adding out of stock items
    if (product.id === 'print-1' || product.title.toLowerCase() === 'xerox') {
      setXeroxPrintType('bw');
      setXeroxFormat('one-side');
      setXeroxSpiralBinding(false);
      setXeroxStickFile(false);
      setXeroxStaple('no');
      setShowXeroxCustomizeModal(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => Math.round(cartSubtotal * 0.05), [cartSubtotal]); // 5% CGST/SGST stationery tax
  const cartTotal = useMemo(() => cartSubtotal + tax, [cartSubtotal, tax]);

  // Live filtered catalog search using stateful productsList
  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, productsList]);

  // Handle pagination indexing on filtered changes
  useEffect(() => {
    setProductPageIndex(0);
  }, [searchQuery, selectedCategory]);

  const totalProductPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  }, [filteredProducts, itemsPerPage]);

  const userActiveOrders = useMemo(() => {
    return orders.filter(slip => slip.rollNumber === rollNumber);
  }, [orders, rollNumber]);

  const userHistoryOrders = useMemo(() => {
    return pickupHistory.filter(slip => slip.rollNumber === rollNumber);
  }, [pickupHistory, rollNumber]);

  const dailyEarnings = useMemo(() => {
    const earningsMap: { [date: string]: number } = {};
    pickupHistory.forEach(slip => {
      const dateKey = slip.createdDate || 'Prior';
      earningsMap[dateKey] = (earningsMap[dateKey] || 0) + slip.total;
    });
    return earningsMap;
  }, [pickupHistory]);

  const paginatedProducts = useMemo(() => {
    const start = productPageIndex * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, productPageIndex, itemsPerPage]);

  const handleNextPage = () => {
    setSlideDirection('right');
    setProductPageIndex(prev => (prev + 1) % totalProductPages);
  };

  const handlePrevPage = () => {
    setSlideDirection('left');
    setProductPageIndex(prev => (prev - 1 + totalProductPages) % totalProductPages);
  };

  // Intercept checkout to submit order directly in 'PENDING' status
  const handlePlaceOrderCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!isLoggedIn) {
      addNotification("🔒 Please Sign In with Google before completing the order.", "failed");
      return;
    }

    // Generate fully unique code starting with S- followed by absolute dynamic random number
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = `S-${uniqueNumber}`;
    const finalTotal = Math.max(0, cartTotal - Math.round(cartSubtotal * 0.1));

    const newSlip: PickupSlip = {
      orderId,
      studentName,
      rollNumber,
      department: selectedDept,
      contactNumber,
      pickupTimeSlot,
      items: [...cart],
      subtotal: cartSubtotal,
      tax,
      total: finalTotal,
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdDate: new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
      userId: user?.id || undefined
    };

    setPendingOrder(newSlip);
    setIsCheckoutOpen(false);
    setIsRazorpayOpen(true);
  };

  // Close UPI Payment checkout popover
  const handleClosePaymentView = () => {
    setIsRazorpayOpen(false);
    setPendingOrder(null);
  };

  // Admin Actions
  const handleAddOrEditProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || adminPrice <= 0) return;

    if (editId) {
      // Update existing
      setProductsList(prev => prev.map(p => 
        p.id === editId 
          ? { 
              ...p, 
              title: adminTitle, 
              price: adminPrice, 
              category: adminCategory, 
              image: adminImage,
              inStock: adminInStock
            } 
          : p
      ));
      addNotification(`✏️ Product updated by Admin: "${adminTitle}" (${adminInStock ? 'In Stock' : 'Out of Stock'})`, 'update');
    } else {
      // Add new
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        category: adminCategory,
        title: adminTitle,
        price: adminPrice,
        image: adminImage,
        inStock: adminInStock,
        rating: 5.0
      };
      setProductsList(prev => [newProduct, ...prev]);
      addNotification(`🆕 New item added to catalogue: "${adminTitle}"`, 'update');
    }

    // Reset controls
    setAdminTitle('');
    setAdminPrice(0);
    setEditId(null);
  };

  const handleEditSelect = (product: Product) => {
    setEditId(product.id);
    setAdminTitle(product.title);
    setAdminPrice(product.price);
    setAdminCategory(product.category);
    setAdminImage(product.image);
    setAdminInStock(product.inStock !== false);
  };

  const handleDeleteProduct = (productId: string, productTitle: string) => {
    setProductsList(prev => prev.filter(p => p.id !== productId));
    addNotification(`🗑️ Catalogue update: removed "${productTitle}" from store registry.`, 'update');
    if (editId === productId) {
      setEditId(null);
      setAdminTitle('');
      setAdminPrice(0);
    }
  };

  const handleToggleStockDirect = (productId: string) => {
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = p.inStock === false ? true : false;
        addNotification(`📦 Stock Update: "${p.title}" is now ${nextStock ? 'In Stock' : 'Out of Stock'}.`, 'update');
        return { ...p, inStock: nextStock };
      }
      return p;
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    promptConfirm(`Are you sure you want to permanently delete student pickup pass ${orderId}?`, () => {
      fetch(`/api/print-orders/${orderId}`, {
        method: 'DELETE'
      }).then(res => {
        if (res.ok) {
          if (isAdminOpen) fetchAllPrintOrders();
          else fetchPrintOrders();
        } else {
          addNotification('⚠️ Failed to delete order from Supabase.', 'failed');
        }
      }).catch(err => {
        console.error("Error deleting print order:", err);
      });

      setOrders(prev => prev.filter(slip => slip.orderId !== orderId));
      addNotification(`🗑️ Order ${orderId} has been successfully deleted from SPHN registry.`, 'update');
    });
  };

  const handleMarkPickedUp = (orderId: string) => {
    const orderToPickUp = orders.find(slip => slip.orderId === orderId);
    if (!orderToPickUp) return;

    promptConfirm(`Confirm that items for Pass ${orderId} have been physically collected by ${orderToPickUp.studentName}?`, () => {
      // Save update to database
      fetch(`/api/print-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PICKED_UP' })
      }).then(res => {
        if (res.ok) {
          if (isAdminOpen) fetchAllPrintOrders();
          else fetchPrintOrders();
        } else {
          addNotification('⚠️ Failed to archive order status in Supabase.', 'failed');
        }
      }).catch(err => {
        console.error("Error archiving print order:", err);
      });

      const completedOrder: PickupSlip = {
        ...orderToPickUp,
        status: 'PICKED_UP',
      };
      setPickupHistory(prev => [completedOrder, ...prev]);
      setOrders(prev => prev.filter(slip => slip.orderId !== orderId));
      if (currentSlip && currentSlip.orderId === orderId) {
        setCurrentSlip(null);
      }
      addNotification(`📦 Pass ${orderId} marked as COLLECTED and archived to history.`, 'success');
    });
  };

  const handleClearAllOrders = () => {
    promptConfirm('Are you certain you want to purge the entire pickup tickets history? This cannot be undone.', () => {
      setOrders([]);
      addNotification('🧹 Cleared all student pickup tickets from SPHN registry.', 'update');
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-[#0A261D] font-sans selection:bg-[#0B4C38] selection:text-white antialiased">
      
      {/* ----------------- TOP BANNER HEADER ----------------- */}
      <header className="hidden md:block bg-[#04281E] text-white py-2.5 px-6 border-b border-emerald-950/40 relative overflow-hidden">
        {/* Subtle grid pattern background to match high-end college theme */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs gap-2 md:gap-0 relative z-10 font-mono tracking-tight text-emerald-200/90">
          
          {/* Left item */}
          <div className="flex items-center gap-1.5 bg-[#0B4C38] px-3 py-1 rounded-sm border border-emerald-500/20 shadow-inner">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>EAMCET CODE: <strong className="text-white">SPHN</strong></span>
          </div>

          {/* Center item */}
          <div className="text-center">
            <h1 className="font-sans font-bold text-[13px] tracking-wide text-white uppercase sm:inline-block">
              Sphoorthy Engineering College
            </h1>
            <span className="hidden md:inline mx-2 text-emerald-500">•</span>
            <p className="text-[10px] md:inline text-emerald-300 font-sans tracking-wide">
              Towards Excellence • Approved by AICTE, New Delhi & Affiliated to JNTUH, Hyderabad
            </p>
          </div>

          {/* Right item */}
          <div className="flex items-center gap-2 bg-[#063b2a] px-3 py-1 rounded-md border border-emerald-800">
            <GraduationCap size={13} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-emerald-100">
              NAAC Accredited Grade <strong className="text-emerald-300">A++</strong> Campus
            </span>
          </div>
        </div>
      </header>

      {/* ----------------- INTUITIVE GLOBAL NAVIGATION ----------------- */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex justify-between items-center gap-1.5">
          
          {/* Logo brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {onBackToCanteen && (
              <button 
                onClick={onBackToCanteen}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0B4C38] hover:text-emerald-950 bg-emerald-50 border border-emerald-900/10 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer mr-1.5"
                title="Return to CampusBites Canteen Dashboard"
              >
                ← Canteen
              </button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0B4C38] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md font-bold text-white text-xs sm:text-sm tracking-tighter">
              SPHN
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-xs sm:text-lg tracking-tight text-emerald-950">CampusBites</span>
                <span className="w-1.5 h-1.5 bg-lime-500 rounded-full" />
              </div>
              <p className="text-[8px] sm:text-[10px] text-emerald-700/80 font-mono tracking-wide uppercase font-semibold">Campus Store</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="hidden md:flex bg-slate-100/80 p-0.5 sm:p-1 rounded-full items-center shrink-0">
            <button
              onClick={() => { setActiveTab('stationery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'stationery' 
                  ? 'bg-[#0B4C38] text-white shadow-md' 
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-slate-100'
              }`}
            >
              <BookOpen size={12} className="shrink-0" />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 relative cursor-pointer shrink-0 ${
                activeTab === 'orders' 
                  ? 'bg-[#0B4C38] text-white shadow-md' 
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag size={12} className="shrink-0" />
              <span>Passes</span>
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-lime-500 text-[#04281E] text-[9.5px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          {/* User controls and interactions */}
          <div className="flex items-center gap-1.5 sm:gap-3 relative shrink-0">
            
            {/* Admin Management Toggle Portal Button */}
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 cursor-pointer border-none shadow-sm ${
                isAdminOpen 
                  ? 'bg-[#0B4C38] text-white shadow-md' 
                  : 'bg-[#0B4C38]/5 border border-emerald-900/5 text-[#0B4C38] hover:bg-[#0B4C38]/10'
              }`}
              title="Campus Store Administrative Panel"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold">Admin</span>
            </button>

            {/* Announcements Bell Icon */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                  markAllNotificationsAsRead();
                }}
                className={`p-1.5 sm:p-2.5 rounded-full border bg-slate-50 transition-colors relative hover:bg-slate-100 shadow-sm cursor-pointer ${
                  isNotificationsOpen ? 'bg-emerald-50 border-emerald-200 text-[#0B4C38]' : 'border-slate-100 text-slate-700'
                }`}
                title="Store Announcements"
              >
                <Bell size={15} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                      <h4 className="font-display font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-lime-500" />
                        Campus Store Live Alerts
                      </h4>
                      {announcements.length > 0 && (
                        <button 
                          onClick={clearNotifications}
                          className="text-[9px] font-mono hover:underline text-red-500"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {announcements.length > 0 ? (
                      <div className="space-y-3 divide-y divide-slate-50 max-h-[300px] overflow-y-auto pr-1">
                        {announcements.map(item => (
                          <div key={item.id} className="pt-2.5 first:pt-0">
                            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                              {item.text}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[9px] font-mono text-slate-400">{item.time}</span>
                              {item.unread && (
                                <span className="w-1.5 h-1.5 bg-lime-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-2">
                          <Bell size={16} />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">No live announcements yet</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px]">
                          Place an order, simulate failures, or let the store updates trigger notifications!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Control */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 bg-[#0B4C38]/5 hover:bg-[#0B4C38]/10 px-2 sm:px-3 py-1.5 rounded-full transition-colors border border-emerald-900/5 group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#0B4C38] text-lime-400 font-mono font-bold flex items-center justify-center text-xs shadow-inner">
                  {studentName.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#0B4C38]/70">My Profile</p>
                  <p className="text-xs font-bold text-emerald-950 font-sans group-hover:text-[#0B4C38] transition-colors">{studentName}</p>
                </div>
              </button>

              {/* Profile Card Popover */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-50"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-900 text-lime-400 font-mono font-bold flex items-center justify-center text-sm">
                        {studentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-emerald-950">{studentName}</h4>
                        <p className="text-xs text-slate-500">{rollNumber}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Department</span>
                        <span className="text-xs text-slate-800 font-medium block">{selectedDept}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Contact Phone</span>
                        <span className="text-xs text-slate-800 font-medium block">{contactNumber}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-50 flex justify-between">
                        <span className="text-xs text-slate-500">Pick-up verified?</span>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle size={12} className="text-lime-500" /> SPHN Student
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </nav>

      {/* ----------------- MAIN LAYOUT AREA ----------------- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          
          {activeTab === 'stationery' ? (
            
            <motion.div
              key="stationery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              
              {/* ----------------- HERO SECTION ----------------- */}
              <section className="hidden md:block relative rounded-3xl bg-[#083c2e] text-white p-8 md:p-12 overflow-hidden shadow-xl shadow-emerald-950/20 border border-emerald-900/30">
                {/* Visual rich gradients on hero */}
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] opacity-20 md:opacity-100 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-emerald-800/60 via-transparent to-transparent z-0 pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-96 h-96 rounded-full bg-emerald-900/40 blur-3xl pointer-events-none" />

                {/* Grid Overlay for Premium Aesthetic */}
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                  
                  {/* Left Column Text details */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono tracking-wider font-semibold uppercase text-lime-400">
                      <Sparkles size={12} className="text-[#a3e635]" />
                      SPHN Campus Store
                    </span>

                    <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                      Shop Stationery &<br />
                      <span className="text-lime-400 font-extrabold bg-gradient-to-r from-lime-400 to-emerald-300 bg-clip-text text-transparent">Essentials.</span>
                    </h2>

                    <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-sans max-w-md">
                      Books, stationery, printouts and daily essentials—everything you need, all in one place. Simply order online and pick up securely at the campus store!
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-lime-400" />
                        <span className="text-xs font-semibold text-emerald-50">Zero Queue Pickup</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-50">Authorized SPHN Stock</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Studio Illustration with floating cards */}
                  <div className="lg:col-span-7 relative h-[360px] md:h-[420px] flex items-center justify-center">
                    
                    {/* The Central Premium Generated Image representing modern studio layout */}
                    <div className="relative w-full h-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-950/50">
                      <img 
                        src="/src/assets/images/stationery_hero_banner_1781436219475.jpg" 
                        alt="SPHN Stationery Premium Scene" 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04281E]/80 via-transparent to-transparent" />
                    </div>

                    {/* Outer floating mini glassmorphic tags matching specified texts */}

                    {/* 📘 Notebooks From ₹40 */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.2 }}
                      className="absolute -top-3 left-[5%] bg-white/95 text-[#0A261D] p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-900/5 hover:-translate-y-1 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-emerald-50 text-[#0B4C38] rounded-xl flex items-center justify-center text-lg">
                        📘
                      </div>
                      <div>
                        <p className="text-xs font-extrabold font-display leading-tight">Notebooks</p>
                        <p className="text-[10px] text-slate-500 font-semibold font-mono">From ₹40</p>
                      </div>
                    </motion.div>

                    {/* ✏️ Pens & Pencils From ₹10 */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.3 }}
                      className="absolute -top-2 right-[2%] bg-white/95 text-[#0A261D] p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-900/5 hover:-translate-y-1 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-emerald-50 text-[#0B4C38] rounded-xl flex items-center justify-center text-lg">
                        ✏️
                      </div>
                      <div>
                        <p className="text-xs font-extrabold font-display leading-tight">Pens & Pencils</p>
                        <p className="text-[10px] text-slate-500 font-semibold font-mono">From ₹10</p>
                      </div>
                    </motion.div>

                    {/* 🖨 Printouts From ₹1/page */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.4 }}
                      className="absolute -bottom-2 left-[2%] bg-white/95 text-[#0A261D] p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-900/5 hover:-translate-y-1 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-emerald-50 text-[#0B4C38] rounded-xl flex items-center justify-center text-lg">
                        🖨
                      </div>
                      <div>
                        <p className="text-xs font-extrabold font-display leading-tight">Printouts</p>
                        <p className="text-[10px] text-slate-500 font-semibold font-mono">From ₹1/page</p>
                      </div>
                    </motion.div>

                    {/* 🧴 Daily Essentials From ₹20 */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-[10%] -right-1 bg-white/95 text-[#0A261D] p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-900/5 hover:-translate-y-1 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-emerald-50 text-[#0B4C38] rounded-xl flex items-center justify-center text-lg">
                        🧴
                      </div>
                      <div>
                        <p className="text-xs font-extrabold font-display leading-tight">Daily Essentials</p>
                        <p className="text-[10px] text-slate-500 font-semibold font-mono">From ₹20</p>
                      </div>
                    </motion.div>

                    {/* Center glassmorphic label */}
                    <div className="absolute top-[40%] right-[15%] bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold flex items-center gap-2 py-2 px-4 rounded-full shadow-lg font-display text-xs">
                      <span className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-ping" />
                      SPHN STORE
                    </div>

                  </div>
                </div>
              </section>

              {/* ----------------- SEARCH & FULL GRID DIRECTORY ----------------- */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side, containing Search, categories filter chips, and actual products inventory */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Heavy Typography Subheader */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-emerald-950 uppercase tracking-tight">
                        Browse SPHN Stationery Store Catalog
                      </h3>
                      <p className="text-xs text-slate-400">Select categories of authentic academic and college materials</p>
                    </div>
                  </div>

                  {/* Large Premium Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4.5 top-[50%] -translate-y-[50%] text-emerald-700/60" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for notebooks, pens, files, printouts, and more..."
                      className="w-full bg-white border border-slate-200 pl-11.5 pr-4 py-4 rounded-2xl text-sm font-medium shadow-sm transition placeholder:text-slate-400 text-emerald-950 focus:outline-none focus:border-[#0B4C38] focus:ring-1 focus:ring-[#0B4C38]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-[50%] -translate-y-[50%] p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Horizontal rounded filter pills */}
                  <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                          selectedCategory === cat.id 
                            ? 'bg-[#0B4C38] text-white shadow-md' 
                            : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-[#0a261d]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Search / Category Results Count overlay */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Showing {filteredProducts.length} items available</span>
                    {(selectedCategory !== 'all' || searchQuery) && (
                      <button 
                        onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                        className="text-[#0B4C38] hover:underline font-semibold flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Clear Filters
                      </button>
                    )}
                  </div>

                  {/* Fine layout inventory list card grid - WITH slide animation on pagination arrows key update */}
                  {filteredProducts.length > 0 ? (
                    <div className="overflow-hidden relative min-h-[460px]">
                      <AnimatePresence mode="popLayout" custom={slideDirection}>
                        <motion.div
                          key={productPageIndex}
                          custom={slideDirection}
                          variants={{
                            enter: (dir: 'left' | 'right') => ({
                              opacity: 0,
                              x: dir === 'right' ? 80 : -80
                            }),
                            center: {
                              opacity: 1,
                              x: 0
                            },
                            exit: (dir: 'left' | 'right') => ({
                              opacity: 0,
                              x: dir === 'right' ? -80 : 80
                            })
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5"
                        >
                          {paginatedProducts.map(product => {
                            const isInCart = cart.some(item => item.product.id === product.id);
                            const isOutOfStock = product.inStock === false;
                            return (
                              <div
                                key={product.id}
                                className={`bg-white rounded-3xl p-3 sm:p-4 border border-slate-100 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between group h-full relative ${isOutOfStock ? 'opacity-70 bg-slate-50/50' : ''}`}
                              >
                                {isOutOfStock && (
                                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                                    OUT OF STOCK
                                  </div>
                                )}
                                
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100/80 overflow-hidden flex items-center justify-center p-2 sm:p-4">
                                    <img
                                      src={product.image}
                                      alt={product.title}
                                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-300"
                                      referrerPolicy="no-referrer"
                                    />
                                    {product.isStaffPick && (
                                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-emerald-950 text-lime-400 text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                        Recommended
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                        {product.category.replace('_', ' ')}
                                      </span>
                                      {product.rating && (
                                        <span className="text-[10px] sm:text-xs text-amber-500 font-semibold font-mono">
                                          ★ {product.rating}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-display font-extrabold text-xs sm:text-sm text-[#0A261D] group-hover:text-[#0B4C38] transition-colors leading-tight">
                                      {product.title}
                                    </h4>
                                    {product.subtitle && (
                                      <p className="text-[10px] sm:text-xs text-slate-400 leading-normal">{product.subtitle}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-slate-50 mt-3 sm:mt-4 gap-2">
                                  <div className="flex flex-col text-left">
                                    <span className="text-[9px] sm:text-xs text-slate-400 font-medium scale-90 -ml-1">PRICE</span>
                                    <span className="text-xs sm:text-sm font-extrabold text-emerald-950 font-mono">
                                      ₹{product.price}
                                      {product.category === 'printouts' && <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal"> /page</span>}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                                    disabled={isOutOfStock}
                                    className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-sm transition-all duration-300 cursor-pointer ${
                                      isOutOfStock
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent'
                                        : isInCart 
                                        ? 'bg-[#0B4C38] text-white' 
                                        : 'bg-slate-50 hover:bg-[#0B4C38] hover:text-white text-emerald-950 border border-slate-200'
                                    }`}
                                  >
                                    {isOutOfStock ? (
                                      'SOLD OUT'
                                    ) : (
                                      <>
                                        <Plus size={10} />
                                        {isInCart ? 'In Cart' : 'ADD'}
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      </AnimatePresence>

                      {totalProductPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mt-6 max-w-max mx-auto select-none font-sans shadow-sm">
                          <button
                            onClick={handlePrevPage}
                            className="p-1 rounded-full text-emerald-900 duration-200 hover:bg-white/80 cursor-pointer"
                            title="Previous products"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-mono font-bold text-emerald-950 px-2">
                            Page {productPageIndex + 1} of {totalProductPages}
                          </span>
                          <button
                            onClick={handleNextPage}
                            className="p-1 rounded-full text-[#0B4C38] duration-200 hover:bg-white/80 cursor-pointer"
                            title="Next products"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center max-w-lg mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                        <Search size={22} />
                      </div>
                      <h4 className="font-display font-bold text-base text-emerald-950">No Stationery Found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        We couldn't find items matching "{searchQuery}" in directory. Check your spelling or look under another category pill.
                      </p>
                      <button 
                        onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                        className="mt-4 text-xs font-bold text-white bg-[#0B4C38] px-4 py-2 rounded-full transition"
                      >
                        Reset Catalogue
                      </button>
                    </div>
                  )}

                </div>

                {/* Right side: Large Rounded Interactive Cart Panel */}
                <div className="hidden lg:block lg:col-span-4 sticky top-28">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
                    
                    {/* Cart Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0B4C38] flex items-center justify-center">
                          <ShoppingCart size={18} />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-[#0D382A]">Your Store Cart</h3>
                          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                            {cart.reduce((s, i) => s + i.quantity, 0)} Items Added
                          </p>
                        </div>
                      </div>
                      
                      {cart.length > 0 && (
                        <button 
                          onClick={() => setCart([])}
                          className="text-[10px] font-mono text-red-500 font-bold hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Cart Items list */}
                    {cart.length > 0 ? (
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                          {cart.map((item) => (
                            <motion.div
                              key={`cart-${item.product.id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0 group border-dashed"
                            >
                              {/* Item miniature */}
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0">
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-grow min-w-0">
                                <h5 className="text-xs font-bold text-emerald-950 truncate">{item.product.title}</h5>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {item.product.subtitle || item.product.category.replace('_', ' ')}
                                </p>
                                <span className="text-xs font-bold text-emerald-950 font-mono inline-block mt-1">
                                  ₹{item.product.price}
                                </span>
                              </div>

                              {/* Controls */}
                              <div className="flex flex-col items-end gap-1.5 justify-between">
                                <button
                                  onClick={() => handleRemoveFromCart(item.product.id)}
                                  className="text-slate-300 hover:text-red-500 transition duration-150"
                                  title="Delete item"
                                >
                                  <Trash2 size={13} />
                                </button>
                                
                                <div className="flex items-center bg-slate-100 rounded-full px-2 py-0.5 gap-2 border border-slate-200">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                    className="p-0.5 rounded-full hover:bg-white text-slate-700 transition"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-xs font-bold font-mono text-emerald-900 w-3 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                    className="p-0.5 rounded-full hover:bg-white text-slate-700 transition"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="py-12 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3 border border-slate-50">
                          <ShoppingBag size={18} />
                        </div>
                        <h4 className="font-display font-bold text-xs text-slate-500">Cart is Empty</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                          Select from store categories or search stationery items to fill your card.
                        </p>
                      </div>
                    )}

                    {/* Bill details */}
                    {cart.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                          <span>Items Subtotal</span>
                          <span className="font-mono text-emerald-950 font-semibold">₹{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                          <span>Verified SPHN Student Discount</span>
                          <span className="font-mono text-lime-600 font-semibold">-₹{Math.round(cartSubtotal * 0.1)} (10%)</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                          <span>Stationery SGST/CGST (5%)</span>
                          <span className="font-mono text-emerald-950 font-semibold">+₹{tax}</span>
                        </div>
                        
                        <div className="flex justify-between items-baseline pt-3 border-t border-slate-50">
                          <span className="text-xs font-bold text-emerald-950 uppercase">Estimated Total</span>
                          <span className="text-lg font-black font-mono text-emerald-950">
                            ₹{Math.max(0, cartTotal - Math.round(cartSubtotal * 0.1))}
                          </span>
                        </div>

                        {/* Order Placement Call to action */}
                        <button
                          onClick={() => setIsCheckoutOpen(true)}
                          className="w-full bg-[#0B4C38] hover:bg-[#073c2e] text-lime-400 font-display font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-emerald-900/10 transition duration-300 flex items-center justify-center gap-2 group text-sm uppercase tracking-wider mt-2 hover:cursor-pointer"
                        >
                          View Cart & Pick-up Info
                          <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                        </button>

                        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                          ⚠️ Self-Pickup at Sphoorthy Campus Store.<br />Show receipt barcode/slip during office hours.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </section>

            </motion.div>

          ) : (
            
            /* ----------------- SUBMITTED PICK-UP ORDERS TAB ----------------- */
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-200 pb-4 max-w-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-emerald-950 flex items-center gap-2">
                    <ShoppingBag className="text-[#0B4C38]" />
                    Your Active SPHN Store Pickup Slips
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Browse and show these active digital receipts to the shopkeeper at Sphoorthy Campus Store for item collection.
                  </p>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={handleClearAllOrders}
                    className="shrink-0 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Clear All Passes
                  </button>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column Active order summary list */}
                  <div className="space-y-4">
                    {orders.map((slip) => (
                      <div
                        key={slip.orderId}
                        onClick={() => setCurrentSlip(slip)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          currentSlip?.orderId === slip.orderId 
                            ? 'bg-white border-[#0B4C38] shadow-lg ring-1 ring-[#0B4C38]' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                              {slip.orderId}
                            </span>
                            <h4 className="font-display font-extrabold text-sm text-emerald-950 mt-1">
                              Pickup Slip • {slip.studentName}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{slip.department} • {slip.rollNumber}</p>
                          </div>
                          
                          <div className="text-right">
                            {slip.status === 'ACCEPTED' && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                ACCEPTED ✅
                              </span>
                            )}
                            {slip.status === 'HOLD' && (
                              <span className="bg-amber-100 text-amber-800 text-[9.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                ON HOLD ⚠️
                              </span>
                            )}
                            {slip.status === 'CANCELLED' && (
                              <span className="bg-red-100 text-red-700 text-[9.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                CANCELLED ❌
                              </span>
                            )}
                            {(!slip.status || slip.status === 'READY') && (
                              <span className="bg-lime-100 text-emerald-950 text-[9.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                                READY FOR PICKUP
                              </span>
                            )}
                            <p className="text-xs font-bold text-emerald-950 font-mono mt-1.5">₹{slip.total}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-[#0B4C38]" /> Slot: {slip.pickupTimeSlot}
                          </span>
                          <span className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-[#0B4C38] font-bold">Venue: Campus Stationery</span>
                          <span className="text-[#0B4C38] font-bold hover:underline flex items-center gap-0.5">
                            Details <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column Detailed Slip Card View */}
                  <div className="sticky top-28 bg-[#0F3227] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-emerald-950 text-center">
                    {/* Visual pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
                    
                    {currentSlip ? (
                      <div className="space-y-6 relative z-10 text-left">
                        
                        {/* Upper Brand */}
                        <div className="flex items-center justify-between border-b border-white/15 pb-4 gap-2">
                          <div>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-lime-400 font-semibold block">SPHN OFFICIAL PICKUP RECEIPT</span>
                            <span className="font-display font-extrabold text-lg tracking-tight">Sphoorthy Engineering College</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => window.print()}
                              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition text-emerald-200 hover:text-white cursor-pointer"
                              title="Print Slip Receipt"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => {
                                promptConfirm(`Are you sure you want to permanently delete student pickup pass ${currentSlip.orderId}?`, () => {
                                  setOrders(prev => prev.filter(slip => slip.orderId !== currentSlip.orderId));
                                  setCurrentSlip(null);
                                  addNotification(`🗑️ Order ${currentSlip.orderId} deleted.`, 'update');
                                });
                              }}
                              className="bg-red-500/10 hover:bg-red-550/30 p-2 rounded-xl transition text-red-300 hover:text-red-100 cursor-pointer"
                              title="Delete Slip Pass"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Receipt slip design */}
                        <div className="bg-white text-[#0A261D] rounded-2xl p-6 space-y-4 shadow-inner relative overflow-hidden">
                          {/* Top slip cutout notches */}
                          <div className="absolute -left-3 top-[-10px] w-6 h-6 bg-[#0F3227] rounded-full" />
                          <div className="absolute -right-3 top-[-10px] w-6 h-6 bg-[#0F3227] rounded-full" />
                          
                          {/* Receipt Data */}
                          <div className="text-center pb-4 border-b border-slate-100/80">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Order Pickup Code</p>
                            <div className="text-xl font-mono font-black tracking-wider text-emerald-950 my-1">{currentSlip.orderId}</div>
                            {currentSlip.status === 'ACCEPTED' && (
                              <span className="bg-emerald-100/80 text-emerald-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none font-mono">
                                ORDER ACCEPTED ✅
                              </span>
                            )}
                            {currentSlip.status === 'HOLD' && (
                              <span className="bg-amber-100/80 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none font-mono">
                                ORDER ON HOLD ⚠️
                              </span>
                            )}
                            {currentSlip.status === 'CANCELLED' && (
                              <span className="bg-red-100/80 text-red-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none font-mono">
                                VOUCHER CANCELLED ❌
                              </span>
                            )}
                            {(!currentSlip.status || currentSlip.status === 'READY') && (
                              <span className="bg-emerald-100/80 text-emerald-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none font-mono">
                                READY FOR PICKUP ✅
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-y-3.5 text-xs pb-4 border-b border-slate-100/85">
                            <div>
                              <span className="text-[9px] font-mono uppercase text-slate-400 block">Student Name</span>
                              <strong className="text-emerald-950 text-[13px]">{currentSlip.studentName}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-slate-400 block">Roll Number</span>
                              <strong className="text-emerald-950 font-mono text-[13px]">{currentSlip.rollNumber}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-slate-400 block">Department</span>
                              <span className="text-slate-800 text-xs font-semibold block truncate leading-tight mt-0.5">{currentSlip.department}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-slate-400 block">Selected Time Slot</span>
                              <span className="text-slate-800 text-xs font-semibold block leading-tight mt-0.5">{currentSlip.pickupTimeSlot}</span>
                            </div>
                            <div className="col-span-2 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl mt-1 text-left">
                              <span className="text-[9px] font-mono uppercase text-emerald-800 font-extrabold block">Collection Venue</span>
                              <span className="text-[#0B4C38] text-xs font-black block mt-0.5">Campus Stationery (Store Main Counter)</span>
                            </div>
                          </div>

                          {/* Items Summary inside slip */}
                          <div className="space-y-2.5">
                            <span className="text-[9px] font-mono uppercase text-slate-400 block">Stationery Basket Bundle</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {currentSlip.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                  <span className="truncate pr-2">
                                    {item.product.title} <span className="font-mono text-[10px] text-slate-400">x{item.quantity}</span>
                                  </span>
                                  <span className="font-mono text-emerald-950">₹{item.product.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Total */}
                          <div className="pt-4 border-t border-dashed border-slate-200 mt-4 flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-900">COLLECTION AMOUNT DT.</span>
                            <span className="text-lg font-black font-mono text-emerald-950">₹{currentSlip.total}</span>
                          </div>

                          {/* Simulated QR Code for campus scanning */}
                          <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100">
                            <div className="w-24 h-24 bg-slate-50 border-4 border-slate-200 p-2.5 rounded-xl text-[#0A261D] flex flex-col items-center justify-center font-mono text-[8px] leading-tight select-none">
                              {/* Clean css-drawn grid simulated QR Code representation */}
                              <div className="w-full h-full border-2 border-[#0A261D] p-1 flex flex-col justify-between">
                                <div className="flex justify-between">
                                  <div className="w-4 h-4 bg-[#0A261D] rounded-xs" />
                                  <div className="w-4 h-4 bg-[#0A261D] rounded-xs" />
                                </div>
                                <div className="text-[6px] tracking-tight text-center font-extrabold text-emerald-950">
                                  SPHN RECEIPT
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="w-4 h-4 bg-[#0A261D] rounded-xs" />
                                  <div className="w-4 h-2 bg-[#0A261D] rounded-xs" />
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                              Scan at counter to pick up
                            </span>
                          </div>

                        </div>

                        {/* Help Desk info */}
                        <div className="text-xs text-emerald-100/80 bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-2.5 leading-relaxed">
                          <Info size={16} className="text-lime-400 flex-shrink-0 mt-0.5" />
                          <p>
                            Present this authenticated pass at Sphoorthy Engineering College stationery house desk. Items are securely bubble packed with strict quality standards. Returns are serviced inside 48 hrs.
                          </p>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20">
                        <ShoppingBag size={48} className="text-emerald-800 mb-4" />
                        <h4 className="font-display font-medium text-lg text-emerald-200">No Slip Selected</h4>
                        <p className="text-xs text-emerald-300/70 mt-1 max-w-xs leading-relaxed">
                          Click on any pickup receipt summary on the left to review its detailed printable slip or check QR pass scanning credentials.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-[#04281E]/5 text-[#0B4C38] rounded-2xl flex items-center justify-center mb-4 border border-[#04281E]/10">
                    <ShoppingBag size={22} />
                  </div>
                  <h4 className="font-display font-bold text-base text-emerald-950">No Active Pickup Passes</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You haven't placed any stationery pickup orders yet in this session. Head to our main catalog to browse notebooks, records, printouts and bags.
                  </p>
                  <button 
                    onClick={() => setActiveTab('stationery')}
                    className="mt-5 text-xs font-bold text-[#0B4C38] bg-lime-400 px-5 py-2.5 rounded-full transition hover:bg-lime-300 uppercase tracking-wider"
                  >
                    Start Browsing
                  </button>
                </div>
              )}

            </motion.div>

          )}

        </AnimatePresence>
      </main>

      {/* ----------------- MODAL DIALOGS ----------------- */}

      {/* Checkout / Student Registration Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-[#04281E]/75 backdrop-blur-md"
            />

            {/* Panel box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative z-50 border border-slate-100 flex flex-col"
            >
              
              {/* Header inside checkout */}
              <div className="bg-[#0B4C38] text-white p-5 flex justify-between items-center relative">
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-lime-400 font-bold block">COLLEGE VERIFICATION</span>
                  <h3 className="font-display font-bold text-base tracking-tight">Sphoorthy Store Pickup Details</h3>
                </div>
                
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handlePlaceOrderCheckout} className="p-6 space-y-4">
                
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-[#0B4C38] font-medium leading-relaxed">
                  📢 <strong>Student Notice:</strong> This order can only be picked up physically at the Sphoorthy Stationery House on campus. Showing this voucher pass is mandatory for discount validation. No advance cash online requested! Card matching is absolute.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-950 uppercase block">Student Name</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] focus:bg-white"
                      placeholder="e.g. Akshith"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A261D] uppercase block">College Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#0B4C38] focus:bg-white"
                      placeholder="e.g. 22881A0501"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A261D] uppercase block">Academic Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] focus:bg-white animate-none"
                  >
                    <option>General CSE</option>
                    <option>Artificial Intelligence & Machine Learning</option>
                    <option>Cyber Security</option>
                    <option>Data Science</option>
                    <option>Electronics & Comm Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Civil Engineering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A261D] uppercase block">Mobile Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] focus:bg-white"
                    placeholder="e.g. +91 93963 63123"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A261D] uppercase block">Preferred Pickup Time Slot</label>
                  <select
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] focus:bg-white animate-none"
                  >
                    <option>Before 1:30</option>
                    <option>Before 4:00</option>
                  </select>
                </div>

                {/* Bill verification in checkout */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 font-mono text-[11px] text-slate-500 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Summary Basket Subtotal:</span>
                    <span className="text-slate-800">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>10% SPHN Student Waiver:</span>
                    <span className="text-lime-600">-₹{Math.round(cartSubtotal * 0.1)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>CGST/SGST (5%):</span>
                    <span className="text-slate-800">+₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-950 pt-2 border-t border-slate-200 mt-2">
                    <span>FINAL COLLECTION DUE:</span>
                    <span>₹{Math.max(0, cartTotal - Math.round(cartSubtotal * 0.1))}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0B4C38] hover:bg-[#073c2e] text-lime-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Proceed to Payment Options
                  </button>
                </div>

              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Razorpay UPI simulated checkout modal */}
      <AnimatePresence>
        {isRazorpayOpen && pendingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePaymentView}
              className="absolute inset-0 bg-[#021217]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-50 border border-slate-100 flex flex-col"
            >
              {/* SPHN Header styling */}
              <div className="bg-[#0b2447] text-white p-5 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 font-display font-black flex items-center justify-center text-white text-xs select-none">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-tight text-white animate-pulse">SPHN Secure Checkout</h3>
                    <p className="text-[9px] font-mono tracking-wider text-emerald-300">AUTOMATED UPI PAYMENT SWIFT</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#ffffff]/60 block uppercase font-mono font-bold">TOTAL AMOUNT</span>
                  <span className="text-sm font-black font-mono text-lime-400">₹{pendingOrder.total}</span>
                </div>
              </div>

              {/* Secure checkout clock indicator */}
              <div className="bg-red-50 px-5 py-2 flex items-center justify-between border-b border-red-100 text-left">
                <span className="text-[10px] font-mono font-bold text-red-700 flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Secure Session Ends In
                </span>
                <span className="text-xs font-mono font-black text-red-900 bg-red-100 px-2 py-0.5 rounded">
                  {formatTimer(paymentTimeLeft)}
                </span>
              </div>

              {/* UPI Payment body details */}
              <div className="p-6 space-y-4">
                {razorpayStep === 'OPTIONS' && (
                  <>
                    <div className="text-center pb-2">
                      <p className="text-xs text-slate-500 font-medium font-sans">Select your preferred UPI application to complete payment instantly:</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2 font-sans">
                      {[
                        { name: 'Google Pay', iconBg: 'bg-blue-600', color: 'text-white', brand: 'GPay' },
                        { name: 'PhonePe', iconBg: 'bg-purple-600', color: 'text-white', brand: 'PhonePe' },
                        { name: 'Paytm', iconBg: 'bg-sky-500', color: 'text-white', brand: 'Paytm' },
                        { name: 'BHIM UPI', iconBg: 'bg-orange-500', color: 'text-white', brand: 'BHIM' }
                      ].map(app => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => handleTriggerSimulatedPayment(app.name)}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-[#0b2447] bg-white transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm group hover:scale-[1.02]"
                        >
                          <div className={`w-10 h-10 rounded-full ${app.iconBg} flex items-center justify-center text-xs font-black tracking-tighter ${app.color} uppercase select-none`}>
                            {app.brand}
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#0b2447]">{app.name}</span>
                          <span className="text-[8px] text-emerald-600 font-mono tracking-widest leading-none font-bold">LAUNCH INSTANT</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1.5 text-xs text-slate-700 font-sans">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-500">Merchant Name:</span>
                        <strong className="text-slate-900 font-bold">SPHN CampusBites</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-500">Reference:</span>
                        <span className="font-mono text-slate-800 font-bold">{pendingOrder.orderId}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 mt-1.5 font-sans">
                        <span className="font-bold text-slate-900">Registered Student:</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{pendingOrder.studentName}</span>
                      </div>
                    </div>
                  </>
                )}

                {razorpayStep === 'PROCESSING' && (
                  <div className="py-8 text-center flex flex-col items-center space-y-4 font-sans">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-150 border-t-purple-600 animate-spin" />
                      <span className="absolute text-lg font-mono font-bold text-purple-700 animate-pulse">📱</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-850">Connecting to {paymentSelectedApp}...</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">Launching secure inline app redirection protocol. Do not close or press back.</p>
                    </div>

                    <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-[10px] font-mono font-bold">
                      🔐 INTEGRATED UPI INLINE HANDSHAKE ACTIVE
                    </div>
                  </div>
                )}

                {razorpayStep === 'SUCCESS' && (
                  <div className="py-8 text-center flex flex-col items-center space-y-4 font-sans">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce scale-110">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-lg text-emerald-950">Payment Completed!</h4>
                      <p className="text-xs text-emerald-600 font-bold font-mono tracking-wider uppercase">₹{pendingOrder.total} RECEIVED VIA {paymentSelectedApp.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto">Your pickup pass is now approved and READY in SPHN system.</p>
                    </div>

                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-mono font-bold border border-emerald-150">
                      TRANS-REF: SPHN-{pendingOrder.orderId}PAY
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slip Display Modal on successful order reservation */}
      <AnimatePresence>
        {currentSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCurrentSlip(null)}
              className="absolute inset-0 bg-[#04281E]/80 backdrop-blur-md"
            />

            {/* Slip box container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0F3227] text-white rounded-3xl w-full max-w-md p-6 overflow-hidden relative z-50 border border-emerald-950 flex flex-col items-center"
            >
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

              <div className="w-full text-right relative z-10 mb-2">
                <button
                  onClick={() => {
                    setCurrentSlip(null);
                    setActiveTab('orders');
                  }}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center leading-none mb-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 text-lime-400 rounded-full flex items-center justify-center mb-2.5">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-display font-extrabold text-[#ffffff] text-lg">Voucher Reserve Success!</h3>
                <p className="text-[10px] text-emerald-200 mt-1 uppercase tracking-widest font-mono">Pass generated & registered</p>
              </div>

              {/* Precise Printable Card representation */}
              <div className="bg-white text-[#0A261D] rounded-2xl p-5 space-y-3.5 shadow-inner relative overflow-hidden text-left w-full animate-none">
                
                {/* Receipt slip shape cutout details */}
                <div className="absolute -left-3 top-[32%] w-6 h-6 bg-[#0F3227] rounded-full" />
                <div className="absolute -right-3 top-[32%] w-6 h-6 bg-[#0F3227] rounded-full" />

                <div className="text-center pb-3 border-b border-slate-100">
                  <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400">Order pickup Code</p>
                  <div className="text-lg font-mono font-black tracking-widest text-[#0B4C38] my-0.5">{currentSlip.orderId}</div>
                  <span className="bg-lime-100 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    READY FOR COUNTER COLLECT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 text-xs pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Student Name</span>
                    <strong className="text-[#0B4C38] font-bold">{currentSlip.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Roll Number</span>
                    <strong className="text-slate-800 font-mono">{currentSlip.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Department</span>
                    <span className="text-slate-700 text-xs font-semibold block truncate leading-tight mt-0.5">{currentSlip.department}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Time Slot</span>
                    <span className="text-slate-700 text-xs font-semibold block leading-tight mt-0.5">{currentSlip.pickupTimeSlot}</span>
                  </div>
                  <div className="col-span-2 bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-left">
                    <span className="text-[9px] font-mono uppercase text-emerald-800 font-extrabold block">Collection Venue</span>
                    <span className="text-[#0B4C38] text-xs font-bold block mt-0.5">Campus Stationery (Store Main Counter)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Bundle Basket</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {currentSlip.items.map((item, id) => (
                      <div key={id} className="flex justify-between text-xs text-slate-600 font-medium font-sans">
                        <span className="truncate pr-2">
                          {item.product.title} <span className="font-mono text-[9px] text-slate-400">x{item.quantity}</span>
                        </span>
                        <span className="font-mono text-[#0B4C38]">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-200 mt-2 flex justify-between items-baseline font-sans">
                  <span className="text-xs font-extrabold text-slate-900">COLLECTION AMOUNT DUE</span>
                  <span className="text-lg font-black font-mono text-emerald-950">₹{currentSlip.total}</span>
                </div>

                {/* Live CSS Barcode representation */}
                <div className="flex flex-col items-center justify-center pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-[3px] h-10 w-44 bg-white/5 mx-auto select-none">
                    <div className="w-[2px] h-full bg-[#0A261D]" />
                    <div className="w-[1px] h-full bg-transparent" />
                    <div className="w-[3px] h-full bg-[#0A261D]" />
                    <div className="w-[1px] h-full bg-[#0A261D]" />
                    <div className="w-[2px] h-full bg-transparent" />
                    <div className="w-[4px] h-full bg-[#0A261D]" />
                    <div className="w-[1px] h-full bg-transparent" />
                    <div className="w-[2px] h-full bg-[#0A261D]" />
                    <div className="w-[3px] h-full bg-transparent" />
                    <div className="w-[1px] h-full bg-[#0A261D]" />
                    <div className="w-[3px] h-full bg-[#0A261D]" />
                    <div className="w-[2px] h-full bg-transparent" />
                    <div className="w-[2px] h-full bg-[#0A261D]" />
                    <div className="w-[4px] h-full bg-[#0A261D]" />
                    <div className="w-[1px] h-full bg-transparent" />
                    <div className="w-[3px] h-full bg-[#0A261D]" />
                    <div className="w-[1px] h-full bg-[#0A261D]" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 mt-1 text-center font-bold">
                    SPHN-{currentSlip.orderId.split('-')[1] || '64125'}
                  </span>
                </div>

              </div>

              {/* View/Print actions */}
              <div className="flex gap-3 justify-center w-full mt-5 relative z-10">
                <button
                  onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-emerald-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  onClick={() => {
                    setCurrentSlip(null);
                    setActiveTab('orders');
                  }}
                  className="bg-lime-400 hover:bg-lime-300 text-emerald-950 px-5 py-2 rounded-xl transition text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  View All Active Passes
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Full-screen Administrative Portal Console Panel */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden text-slate-800 font-sans">
            
            {/* Panel box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-between overflow-hidden bg-white"
            >
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Console Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B4C38] text-lime-400 font-display font-black flex items-center justify-center text-sm shadow shrink-0">
                    ADM
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base tracking-tight text-slate-900 leading-tight">
                      SPHN Administrative Portal
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-emerald-800 font-mono tracking-wider uppercase font-bold">
                      Products & Student Orders Hub
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="bg-[#0B4C38] hover:bg-[#073326] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <X size={14} /> Close
                  </button>
                </div>
              </div>

              {/* SPHN Administrative Sub-tab workspace selector */}
              <div className="bg-slate-50 px-6 py-1 border-b border-slate-200 flex gap-6 select-none shrink-0">
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('catalog')}
                  className={`text-xs font-bold uppercase tracking-wider pb-3 border-b-2 pt-2 transition-all cursor-pointer ${
                    adminActiveTab === 'catalog' 
                      ? 'border-[#0B4C38] text-[#0B4C38]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Edit Catalog ({productsList.length} items)
                </button>
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('orders')}
                  className={`text-xs font-bold uppercase tracking-wider pb-3 border-b-2 pt-2 transition-all cursor-pointer ${
                    adminActiveTab === 'orders' 
                      ? 'border-[#0B4C38] text-[#0B4C38]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pickup Passes ({orders.length} tickets)
                </button>
              </div>

              {/* Console Main Workspace */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {adminActiveTab === 'catalog' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left portion: Form to Add / Edit product */}
                    <div className="lg:col-span-5">
                      <form onSubmit={handleAddOrEditProduct} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm text-left">
                        <h4 className="text-xs font-bold tracking-wider text-[#0B4C38] uppercase flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <span>{editId ? '⚙️ Edit Selected Catalogue Item' : '➕ Register New Stationery Item'}</span>
                        </h4>

                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold">Item Title</label>
                            <input
                              type="text"
                              required
                              value={adminTitle}
                              onChange={(e) => setAdminTitle(e.target.value)}
                              placeholder="e.g. Premium SPHN Record Book"
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] text-slate-900 shadow-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold">Price (₹)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={adminPrice || ''}
                                onChange={(e) => setAdminPrice(Number(e.target.value))}
                                placeholder="e.g. 120"
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#0B4C38] text-slate-900 shadow-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block mb-1">Stock Status</label>
                              <button
                                type="button"
                                onClick={() => setAdminInStock(!adminInStock)}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm border ${
                                  adminInStock 
                                    ? 'bg-emerald-50 text-emerald-850 border-emerald-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${adminInStock ? 'bg-emerald-600 animate-pulse' : 'bg-red-500'}`} />
                                {adminInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold">Category Segment</label>
                            <select
                              value={adminCategory}
                              onChange={(e) => setAdminCategory(e.target.value)}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4C38] text-slate-900 shadow-sm"
                            >
                              <option value="notebooks">Notebooks / Lab Records</option>
                              <option value="pens">Pens, Markers & Pencils</option>
                              <option value="printouts">Digital Printouts</option>
                              <option value="essentials">Daily Student Essentials</option>
                            </select>
                          </div>

                          {/* Selected Image & Device Upload */}
                          <div className="space-y-2">
                            <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">Product Image</label>
                            
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                              {/* Selected Image Thumbnail */}
                              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0 shadow-sm">
                                <img src={adminImage} className="w-full h-full object-contain" alt="Preview" />
                              </div>

                              {/* Upload Controls */}
                              <div className="flex-grow space-y-1.5 font-sans">
                                <span className="text-[9px] text-slate-400 font-sans leading-none block">Only showing currently active image.</span>
                                
                                <input
                                  type="file"
                                  ref={imageFileInputRef}
                                  onChange={handleDeviceImageUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => imageFileInputRef.current?.click()}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B4C38] text-white hover:bg-[#073326] transition-colors text-[10px] font-bold shadow-sm cursor-pointer border-none"
                                >
                                  <Upload size={12} className="shrink-0" />
                                  Upload from Device
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-2 justify-end border-t border-slate-100 mt-2">
                            {editId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditId(null);
                                  setAdminTitle('');
                                  setAdminPrice(0);
                                  setAdminInStock(true);
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel Edit
                              </button>
                            )}
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-xl bg-[#0B4C38] hover:bg-[#073326] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {editId ? 'Apply Edit Changes' : 'Register New Item'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Right portion: List of current memorized products */}
                    <div className="lg:col-span-7 space-y-3">
                      <h4 className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">Current Catalogue List ({productsList.length} items)</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                        {productsList.map(product => (
                          <div 
                            key={product.id}
                            className={`p-3.5 rounded-2xl bg-white border hover:border-slate-300 transition-all flex items-center justify-between gap-4 shadow-sm ${
                              editId === product.id ? 'border-[#0B4C38] bg-emerald-50/20' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={product.image} className="w-10 h-10 object-contain rounded-lg p-0.5 bg-slate-50 flex-shrink-0" alt="" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold truncate text-slate-900">{product.title}</h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-semibold">{product.category}</span>
                                  <span className="text-[11px] font-mono font-extrabold text-[#0B4C38]">₹{product.price}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Stock status badge click-to-toggle directly */}
                              <button
                                onClick={() => handleToggleStockDirect(product.id)}
                                className={`px-2 py-1 rounded text-[9.5px] font-mono font-bold uppercase transition border shadow-sm cursor-pointer ${
                                  product.inStock !== false 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-150 hover:bg-emerald-100' 
                                    : 'bg-red-50 text-red-700 border-red-150 hover:bg-red-105'
                                }`}
                                title="Click to toggle Stock availability"
                              >
                                {product.inStock !== false ? 'In Stock' : 'Out Stock'}
                              </button>

                              {/* Edit select trigger */}
                              <button
                                onClick={() => handleEditSelect(product)}
                                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition border border-slate-200 cursor-pointer"
                                title="Edit details"
                              >
                                <Edit size={12} />
                              </button>

                              {/* Delete select trigger */}
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.title)}
                                className="bg-slate-100 hover:bg-red-50 p-1.5 rounded-lg text-slate-500 hover:text-red-650 transition border border-slate-200 cursor-pointer"
                                title="Delete from list"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ----------------- ADMIN PICKUP TICKETS MANAGEMENT ----------------- */
                  <div className="space-y-4">
                    {/* Switch Tabs: Active VS Completed Archives */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-150 pb-3 items-center">
                      <button
                        type="button"
                        onClick={() => setAdminOrdersTab('active')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          adminOrdersTab === 'active'
                            ? 'bg-[#0B4C38] text-white border-[#0B4C38] shadow-sm font-extrabold'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 font-medium'
                        }`}
                      >
                        🎟️ Active Passes ({orders.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminOrdersTab('history')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          adminOrdersTab === 'history'
                            ? 'bg-[#0B4C38] text-white border-[#0B4C38] shadow-sm font-extrabold'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 font-medium'
                        }`}
                      >
                        📦 History Book ({pickupHistory.length})
                      </button>

                      {adminOrdersTab === 'active' && orders.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllOrders}
                          className="ml-auto text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 font-mono uppercase bg-red-50 border border-red-155 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          <Trash2 size={12} /> Clear Passes Hub
                        </button>
                      )}

                      {adminOrdersTab === 'history' && pickupHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            promptConfirm('Clear the entire historically collected pickup passes records? This cannot be undone.', () => {
                              setPickupHistory([]);
                              addNotification('🧹 Historical archives purged.', 'update');
                            });
                          }}
                          className="ml-auto text-[10px] font-bold text-red-650 hover:text-red-700 flex items-center gap-1.5 font-mono uppercase bg-red-50 border border-red-155 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          <Trash2 size={12} /> Wipe History logs
                        </button>
                      )}
                    </div>

                    {(adminOrdersTab === 'active' ? orders.length : pickupHistory.length) === 0 ? (
                      <div className="text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-xs font-semibold">
                        {adminOrdersTab === 'active' 
                          ? 'No active student pickup passes currently active in memory.' 
                          : 'No collected passes recorded in SPHN History registry.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(adminOrdersTab === 'active' ? orders : pickupHistory).map((slip) => (
                          <div 
                            key={slip.orderId}
                            className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-sm text-left relative hover:border-slate-300 transition"
                          >
                            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                              <div>
                                <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono font-bold tracking-wide border border-slate-200">
                                  {slip.orderId}
                                </span>
                                <h5 className="text-[13px] font-black text-slate-900 mt-1.5 font-sans">
                                  {slip.studentName}
                                </h5>
                                <span className="text-[10px] text-slate-500 font-mono block mt-0.5 font-bold">
                                  {slip.rollNumber} • {slip.department}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] font-mono text-slate-400 block font-bold uppercase">Total Due</span>
                                <strong className="text-[#0B4C38] text-xs font-bold font-mono">₹{slip.total}</strong>
                                <div className="mt-1">
                                  {adminOrdersTab === 'history' ? (
                                    <span className="text-[8.5px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-black uppercase">Collected 📦</span>
                                  ) : (
                                    <>
                                      {slip.status === 'ACCEPTED' && (
                                        <span className="text-[8.5px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded font-black uppercase font-extrabold">Accepted ✅</span>
                                      )}
                                      {slip.status === 'HOLD' && (
                                        <span className="text-[8.5px] font-mono bg-amber-50 text-amber-800 border border-amber-250 px-2 py-0.5 rounded font-black uppercase font-extrabold">On Hold ⚠️</span>
                                      )}
                                      {slip.status === 'CANCELLED' && (
                                        <span className="text-[8.5px] font-mono bg-red-50 text-red-700 border border-red-250 px-2 py-0.5 rounded font-black uppercase font-extrabold">Cancelled ❌</span>
                                      )}
                                      {(!slip.status || slip.status === 'PENDING' || slip.status === 'READY') && (
                                        <span className="text-[8.5px] font-mono bg-blue-50 text-blue-800 border border-blue-250 px-2 py-0.5 rounded font-black uppercase font-extrabold">Pending ⏳</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Ticket Basket Items list */}
                            <div className="text-xs text-slate-700 space-y-1.5 font-mono bg-slate-50 p-3 rounded-xl border border-slate-150">
                              <span className="text-[9.5px] text-slate-500 font-extrabold block uppercase mb-1">Goods to Collect:</span>
                              {slip.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between font-medium">
                                  <span className="truncate max-w-[180px] text-slate-800">
                                    • {it.product.title} <span className="text-slate-500 font-sans text-xs">x{it.quantity}</span>
                                  </span>
                                  <span className="font-bold">₹{it.product.price * it.quantity}</span>
                                </div>
                              ))}
                              <div className="text-[10px] text-slate-500 mt-2.5 pt-2.5 border-t border-dashed border-slate-200 flex justify-between font-sans shrink-0 font-semibold">
                                <span>Time Slot: <strong className="text-slate-700">{slip.pickupTimeSlot}</strong></span>
                                <span className="text-[#0B4C38] font-bold">Venue: Mall Store Gate</span>
                              </div>
                            </div>

                            {adminOrdersTab === 'active' && (
                              <>
                                {/* Mark Picked Up CTA */}
                                <button
                                  type="button"
                                  onClick={() => handleMarkPickedUp(slip.orderId)}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mt-2 border-none"
                                >
                                  <CheckCircle size={13} />
                                  Mark Picked Up (Disappear to History)
                                </button>

                                {/* Administration control decisions */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                                  <div className="flex gap-1.5 flex-grow">
                                    <button
                                      type="button"
                                      onClick={() => handleChangeOrderStatus(slip.orderId, 'ACCEPTED')}
                                      className={`flex-1 text-[9.5px] py-1.5 rounded-lg font-bold uppercase transition border cursor-pointer ${
                                        slip.status === 'ACCEPTED' 
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm' 
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleChangeOrderStatus(slip.orderId, 'HOLD')}
                                      className={`flex-1 text-[9.5px] py-1.5 rounded-lg font-bold uppercase transition border cursor-pointer ${
                                        slip.status === 'HOLD' 
                                          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' 
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      Hold
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleChangeOrderStatus(slip.orderId, 'CANCELLED')}
                                      className={`flex-1 text-[9.5px] py-1.5 rounded-lg font-bold uppercase transition border cursor-pointer ${
                                        slip.status === 'CANCELLED' 
                                          ? 'bg-red-50 text-red-700 border-red-300 shadow-sm' 
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      Cancel
                                    </button>
                                  </div>

                                  {/* Delete specific active order data permanently */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(slip.orderId)}
                                    className="bg-red-50 hover:bg-red-105 text-red-600 p-2.5 border border-red-150 rounded-xl hover:text-red-700 transition shrink-0 cursor-pointer shadow-sm flex items-center justify-center"
                                    title="Delete this ticket data from SPHN Registry"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </>
                            )}

                            {adminOrdersTab === 'history' && (
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>🔒 Collected Pass Logged</span>
                                <span>No edits permitted</span>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Console Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center font-mono text-[9px] text-slate-400 shrink-0">
                🔒 SPHN Administration Panel Console • Actions immediately synchronize memory caching buffers. Authorized Access.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding of Sphoorthy Engineering College */}
      <footer className="bg-[#031d16] text-[#cbf3e4]/60 py-10 px-6 border-t border-emerald-950 mt-16 text-xs selection:bg-lime-400 selection:text-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-[#031d16] font-display font-black flex items-center justify-center text-xs">
              S
            </div>
            <div>
              <p className="font-bold text-white tracking-wide">SPHN CampusBites Store</p>
              <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase">STATIONERY & BOOKS MARKETPLACE</p>
            </div>
          </div>

          <div className="text-center md:text-right font-sans space-y-1">
            <p className="text-[#cbf3e4]/80 font-medium">Sphoorthy Engineering College Network</p>
            <p className="text-[10px]">Hyderabad • Approved by AICTE & Affiliated to JNTUH</p>
            <p className="text-[9px] font-mono text-emerald-500/80 mt-2">© 2026 CampusBites. Developed purely for SPHN student convenience. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[85%] max-w-[340px] z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-full flex items-center justify-around py-2 px-3">
        {/* SHOP/CATALOG TRAY */}
        <button
          onClick={() => { setActiveTab('stationery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider transition border-none bg-transparent cursor-pointer ${
            activeTab === 'stationery' ? 'text-[#0B4C38]' : 'text-slate-400'
          }`}
        >
          <Home size={18} />
          <span>Catalog</span>
        </button>

        {/* PASSES / ORDERS TRAY */}
        <button
          onClick={() => { setActiveTab('orders'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider transition relative border-none bg-transparent cursor-pointer ${
            activeTab === 'orders' ? 'text-[#0B4C38]' : 'text-slate-400'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Passes</span>
          {orders.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-lime-500 text-[#04281E] text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
              {orders.length}
            </span>
          )}
        </button>

        {/* CART TRAY OVERLAY SELECTOR */}
        <button
          onClick={() => setMobileCartOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 relative border-none bg-transparent cursor-pointer"
        >
          <ShoppingCart size={18} />
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
              {cart.reduce((acc, c) => acc + c.quantity, 0)}
            </span>
          )}
        </button>

        {/* PROFILE CONTROL TOGGLE */}
        <button
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNotificationsOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider transition border-none bg-transparent cursor-pointer ${
            isProfileOpen ? 'text-[#0B4C38]' : 'text-slate-400'
          }`}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>

      {/* MOBILE PROFILE DETAILS DRAWER OVERLAY */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer sheet box */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[2.5rem] shadow-2xl relative z-50 flex flex-col max-h-[80vh] overflow-hidden border-t border-slate-100 font-sans p-6 text-left"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              
              <div className="flex items-center gap-4 pb-4 border-b border-slate-150 mb-5">
                <div className="w-16 h-16 rounded-full bg-[#0B4C38] text-lime-400 font-mono font-bold flex items-center justify-center text-xl shadow">
                  {studentName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-black text-slate-900 text-lg">{studentName}</h4>
                  <p className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">{rollNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block font-bold">College Department</span>
                  <span className="text-sm text-slate-800 font-semibold block mt-0.5">{selectedDept}</span>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block font-bold">Contact Phone</span>
                  <span className="text-sm text-slate-800 font-semibold block mt-0.5">{contactNumber}</span>
                </div>

                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-mono block font-bold">Pickup Verification Code</span>
                    <span className="text-xs text-slate-500 mt-0.5 block leading-tight">Present verification details at counter.</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm shrink-0">
                    <CheckCircle size={14} className="text-lime-500" /> SPHN Student
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="mt-6 w-full bg-[#0B4C38] hover:bg-[#073326] text-white py-3 rounded-2xl text-xs font-bold uppercase transition shadow-sm border-none cursor-pointer text-center"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE CART DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileCartOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileCartOpen(false)}
              className="absolute inset-0 bg-[#021217]/75 backdrop-blur-sm"
            />

            {/* Slider Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[2.5rem] shadow-2xl relative z-50 flex flex-col max-h-[85vh] overflow-hidden border-t border-slate-100 font-sans"
            >
              {/* Grab handle indicator */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3" />

              {/* Header inside drawer */}
              <div className="px-6 pb-4 border-b border-slate-150 flex items-center justify-between">
                <div className="text-left animate-fade-in">
                  <h3 className="font-display font-extrabold text-slate-850 text-base leading-tight">Your Stationery Basket</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">SPHN CAMPUS EXCLUSIVE</p>
                </div>
                
                <button
                  onClick={() => setMobileCartOpen(false)}
                  className="p-2 bg-slate-50 rounded-full transition hover:bg-slate-100 text-slate-500 border-none cursor-pointer flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Items List body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div
                      key={`mob-cart-${item.product.id}`}
                      className="flex gap-3 pb-4 border-b border-slate-50 group last:border-0 border-dashed items-center"
                    >
                      {/* Image thumbnail */}
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                        <img src={item.product.image} className="w-full h-full object-contain" alt="" />
                      </div>

                      {/* Detail text */}
                      <div className="flex-grow min-w-0 text-left">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{item.product.title}</h5>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5 leading-none">
                          {item.product.subtitle || item.product.category}
                        </p>
                        <span className="text-xs font-bold text-emerald-750 font-mono block mt-1">₹{item.product.price}</span>
                      </div>

                      {/* Quantity adjustment buttons */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-full px-2 py-1 gap-2 border border-slate-200">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="p-0.5 rounded-full hover:bg-white text-slate-700 transition"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="text-xs font-bold font-mono text-[#0B4C38] w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="p-0.5 rounded-full hover:bg-white text-slate-700 transition"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1 text-slate-350 hover:text-red-500 transition border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3 border border-slate-50">
                      <ShoppingBag size={18} />
                    </div>
                    <h4 className="font-display font-bold text-xs text-slate-500">Cart is Empty</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                      Select stationery or digital printout items to populate basket.
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive checkout action inside mobile drawer */}
              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-150 space-y-4">
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between text-xs text-slate-450">
                      <span>Subtotal amount</span>
                      <span className="font-mono font-bold text-slate-705">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-450">
                      <span>10% SPHN Discount</span>
                      <span className="font-mono font-bold text-lime-600">-₹{Math.round(cartSubtotal * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-850 pt-2 border-t border-slate-150">
                      <span>Estimated Total</span>
                      <span className="font-mono text-[#0B4C38] text-base">₹{Math.max(0, cartTotal - Math.round(cartSubtotal * 0.1))}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-[#0B4C38] hover:bg-[#073c2e] text-lime-400 font-display font-semibold py-3.5 rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 text-xs uppercase tracking-wider border-none cursor-pointer"
                  >
                    View Cart & Pick-up Info
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM ACTION CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-[#021217]/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-50 p-6 border border-slate-100 flex flex-col font-sans"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">Action Confirmation</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmAction.message}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-500 transition border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmAction.onConfirm();
                    setConfirmAction(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0B4C38] text-white hover:bg-[#073c2e] text-xs font-bold transition shadow-sm cursor-pointer border-none"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Xerox CUSTOM PRINT JOB OVERLAY MODAL */}
      <AnimatePresence>
        {showXeroxCustomizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowXeroxCustomizeModal(false)}
              className="absolute inset-0 bg-[#021217]/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-50 border border-slate-100 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-[#0B4C38] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-lime-400 font-display font-black flex items-center justify-center text-[#0B4C38] text-xs leading-none">
                    <Printer size={16} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-sm tracking-tight text-white">Customize Xerox Copy</h3>
                    <p className="text-[9px] font-mono tracking-wider text-lime-300">STATIONERY PRINTING OPTIONS</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowXeroxCustomizeModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white border-none cursor-pointer flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body Form */}
              <div className="p-6 space-y-5 text-left max-h-[70vh] overflow-y-auto">
                
                {/* 📂 DOCUMENT / IMAGE UPLOAD SEGMENT */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">
                    Step 1: Upload Document or Image (PDF, PNG, JPG):
                  </label>
                  
                  {!xeroxUploadedFile ? (
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setXeroxUploadedFile({
                              name: file.name,
                              type: file.type,
                              url: reader.result as string
                            });
                            addNotification(`📎 Dropped: ${file.name}`, 'update');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 hover:border-[#0B4C38] rounded-2xl p-6 text-center cursor-pointer transition bg-white space-y-2 relative"
                    >
                      <input 
                        type="file" 
                        id="xerox-file-upload" 
                        accept=".pdf,.png,.jpg,.jpeg,text/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={handleFileChange}
                      />
                      <div className="w-10 h-10 rounded-full bg-[#0B4C38]/5 text-[#0B4C38] flex items-center justify-center mx-auto">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">Click or drag & drop file here</p>
                        <p className="text-[10px] text-slate-400 font-medium">Supports PDF, PNG, JPG, JPEG</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setXeroxUploadedFile({
                            name: "SPHN_Syllabus_Sample.pdf",
                            type: "application/pdf",
                            url: "dummy"
                          });
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-lg text-slate-600 font-semibold cursor-pointer relative z-10"
                      >
                        ⚡ Use Demo File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Document Preview Box */}
                      <div className="relative w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden min-h-[160px]">
                        
                        {/* Dynamic GrayScale / Color class applied based on user selection */}
                        <div className={`w-full flex flex-col items-center justify-center transition-all duration-350 ${
                          xeroxPrintType === 'bw' ? 'grayscale contrast-125 saturate-0' : 'grayscale-0'
                        }`}>
                          {xeroxUploadedFile.type.startsWith('image/') || (xeroxUploadedFile.url !== 'dummy' && !xeroxUploadedFile.type.includes('pdf')) ? (
                            <img 
                              src={xeroxUploadedFile.url} 
                              alt="Uploaded printout file preview" 
                              className="max-h-36 rounded-lg object-contain shadow border border-slate-150"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            /* PDF / Document visual representation */
                            <div className="w-28 h-36 bg-white rounded-lg shadow-md border-t-4 border-[#0B4C38] p-3 flex flex-col justify-between relative overflow-hidden font-mono text-[6px] text-slate-400 select-none leading-[1.3]">
                              <div className="absolute right-1 top-1 bg-red-150 text-red-700 font-bold text-[7px] px-1 rounded">
                                PDF
                              </div>
                              <div className="space-y-2 mt-4 text-left">
                                <div className="font-extrabold text-[#0B4C38] text-[8px] whitespace-nowrap overflow-hidden text-ellipsis">
                                  {xeroxUploadedFile.name}
                                </div>
                                <div className="border-b border-dashed border-slate-200 pb-1" />
                                <div className="text-[7px] text-slate-800 font-bold">SPHOORTHY ENG COLLEGE</div>
                                <div className="space-y-1">
                                  <p>• LAB ASSIGNMENT MODULE</p>
                                  <p>• AUTHORIZED COPIES</p>
                                  <p>• TOTAL PAGES: {xeroxPageCount}</p>
                                </div>
                              </div>
                              <div className="text-[5px] text-slate-350 text-right font-bold mt-2">
                                SPHN SECURITY CODE #8391
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Top corner file actions */}
                        <button
                          type="button"
                          onClick={() => setXeroxUploadedFile(null)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 p-1.5 rounded-full shadow border-none cursor-pointer flex items-center justify-center"
                          title="Remove uploaded file"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* File Info Details */}
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-white p-2.5 rounded-xl border border-slate-150">
                        <span className="truncate font-bold text-slate-800 max-w-[190px]">
                          📄 {xeroxUploadedFile.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {xeroxUploadedFile.type.includes('pdf') ? 'PDF Document' : 'Raster Image'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 📄 NUMBER OF PAGES / IMAGES COUNTER */}
                <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">
                        Step 2: Enter Number of Pages/Images:
                      </label>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">₹5 per page (B&W) / ₹10 (Colour)</p>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setXeroxPageCount(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm select-none cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono font-extrabold text-sm text-[#0B4C38] bg-white border border-slate-200 py-1 rounded-lg">
                        {xeroxPageCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setXeroxPageCount(prev => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm select-none cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* option-1 / option-2: PRINT TYPE */}
                <div className="space-y-2">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">Step 3: Choose printout format:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setXeroxPrintType('bw')}
                      className={`p-3.5 rounded-2xl border text-center transition flex flex-col justify-center items-center gap-1.5 cursor-pointer ${
                        xeroxPrintType === 'bw'
                          ? 'border-[#0B4C38] bg-emerald-50/40 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className="text-xs">Black and white option-1</span>
                      <span className="text-[10px] text-slate-400 font-medium font-semibold">Standard ₹5 / page</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setXeroxPrintType('color')}
                      className={`p-3.5 rounded-2xl border text-center transition flex flex-col justify-center items-center gap-1.5 cursor-pointer ${
                        xeroxPrintType === 'color'
                          ? 'border-[#0B4C38] bg-[#0B4C38]/5 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className="text-xs">Colour option-2</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Premium ₹10 / page</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans italic font-medium">
                    {xeroxPrintType === 'bw' ? 'Base option: Black and White (₹5 per page)' : 'Colour Option: Selected (₹10 per page)'}
                  </p>
                </div>

                {/* FORMAT: ONE SIDE OR DOUBLE SIDE */}
                <div className="space-y-2">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">Next ask for format:</label>
                  <div className="grid grid-cols-2 gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setXeroxFormat('one-side')}
                      className={`p-3 rounded-xl border text-center transition text-xs font-semibold cursor-pointer ${
                        xeroxFormat === 'one-side'
                          ? 'border-[#0B4C38] bg-emerald-50/40 text-emerald-950'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      One side
                    </button>
                    <button
                      type="button"
                      onClick={() => setXeroxFormat('double-side')}
                      className={`p-3 rounded-xl border text-center transition text-xs font-semibold cursor-pointer ${
                        xeroxFormat === 'double-side'
                          ? 'border-[#0B4C38] bg-[#0B4C38]/5 text-emerald-950 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Double side
                    </button>
                  </div>
                </div>

                {/* HEADING ADDITIONAL: */}
                <div className="space-y-3 pt-3 border-t border-slate-150 font-sans">
                  <span className="text-[10px] tracking-wider uppercase text-slate-500 font-mono font-bold block">additional:</span>
                  
                  {/* Spiral Binding (+100 rs) */}
                  <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 cursor-pointer hover:bg-slate-100/70 transition">
                    <input
                      type="checkbox"
                      checked={xeroxSpiralBinding}
                      onChange={(e) => setXeroxSpiralBinding(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#0B4C38] focus:ring-[#0B4C38] w-4.5 h-4.5"
                    />
                    <div className="flex-grow text-left">
                      <span className="text-xs font-bold text-slate-800 block leading-tight">Spiral binding option</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">additional +100 rs below this option</span>
                    </div>
                  </label>

                  {/* Stick File (+25 rs) */}
                  <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 cursor-pointer hover:bg-slate-100/70 transition">
                    <input
                      type="checkbox"
                      checked={xeroxStickFile}
                      onChange={(e) => setXeroxStickFile(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#0B4C38] focus:ring-[#0B4C38] w-4.5 h-4.5"
                    />
                    <div className="flex-grow text-left">
                      <span className="text-xs font-bold text-slate-800 block leading-tight">Stick file option</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">+25 rs below it</span>
                    </div>
                  </label>

                  {/* Staple or not with yes or no */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-155 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Staple or not</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-semibold">
                        <input
                          type="radio"
                          name="staple"
                          checked={xeroxStaple === 'yes'}
                          onChange={() => setXeroxStaple('yes')}
                          className="text-[#0B4C38] focus:ring-[#0B4C38] w-4 h-4"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-semibold">
                        <input
                          type="radio"
                          name="staple"
                          checked={xeroxStaple === 'no'}
                          onChange={() => setXeroxStaple('no')}
                          className="text-[#0B4C38] focus:ring-[#0B4C38] w-4 h-4"
                        />
                        No
                      </label>
                    </div>
                  </div>

                </div>

                {/* CALCULATIONS AND SUBMIT */}
                <div className="p-4 bg-lime-50 rounded-2xl border border-lime-200 flex flex-col gap-3 mt-3 font-sans">
                  <div className="text-left w-full">
                    <span className="text-[9px] text-[#2c5234] font-mono tracking-wider block uppercase font-bold">CALCULATED PRICE:</span>
                    <div className="text-xs text-slate-500 font-semibold mt-0.5">
                      ₹{xeroxPrintType === 'color' ? 10 : 5} × {xeroxPageCount} page{xeroxPageCount > 1 ? 's' : ''} 
                      {xeroxSpiralBinding ? ' + ₹100 binding' : ''}
                      {xeroxStickFile ? ' + ₹25 file' : ''}
                    </div>
                    <span className="text-xl font-mono font-black text-[#0B4C38]">
                      ₹{(xeroxPrintType === 'color' ? 10 : 5) * xeroxPageCount + (xeroxSpiralBinding ? 100 : 0) + (xeroxStickFile ? 25 : 0)}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const finalPrice = (xeroxPrintType === 'color' ? 10 : 5) * xeroxPageCount + (xeroxSpiralBinding ? 100 : 0) + (xeroxStickFile ? 25 : 0);
                      const customXeroxItem: CartItem = {
                        product: {
                          id: 'print-1',
                          category: 'printouts',
                          title: 'Xerox Custom Printout',
                          subtitle: `Xerox (${xeroxPageCount} page${xeroxPageCount > 1 ? 's' : ''}, ${xeroxPrintType === 'color' ? 'Colour' : 'B&W'}, ${xeroxFormat === 'double-side' ? 'Double' : 'Single'}${xeroxSpiralBinding ? ', Spiral' : ''}${xeroxStickFile ? ', Stick' : ''}${xeroxStaple === 'yes' ? ', Staple' : ''})`,
                          price: finalPrice,
                          image: '/src/assets/images/product_clear_bag_1781436305926.jpg'
                        },
                        quantity: 1,
                        customization: {
                          printType: xeroxPrintType,
                          format: xeroxFormat,
                          spiralBinding: xeroxSpiralBinding,
                          stickFile: xeroxStickFile,
                          staple: xeroxStaple === 'yes',
                          customPrice: finalPrice,
                          uploadedFileName: xeroxUploadedFile ? xeroxUploadedFile.name : undefined
                        }
                      };

                      setCart(prev => [...prev, customXeroxItem]);
                      setShowXeroxCustomizeModal(false);
                      addNotification('📑 Custom Xerox Added to Stationery Basket', 'success');
                    }}
                    className="w-full bg-[#0B4C38] hover:bg-[#073326] text-white py-2.5 px-5 rounded-xl text-xs font-bold uppercase shadow-sm transition cursor-pointer border-none text-center"
                  >
                    Add to Cart
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
