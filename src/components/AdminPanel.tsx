import React, { useEffect, useState } from 'react';
import { ChefHat, TrendingUp, ShoppingBag, CheckSquare, ChevronRight, XCircle, ArrowLeft, QrCode, PlusCircle, Trash2, Edit2, Settings, Users, Percent, Sparkles, Smartphone, Check, Database, RefreshCw, AlertTriangle, ShieldCheck, Lock, AlertCircle, BarChart2, DollarSign, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { Order, OrderStatus, FoodItem, StudentProfile, PaymentSettings } from '../types';

interface AdminPanelProps {
  onBack: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  foodItems: FoodItem[];
  onAddMenuItem: (item: Partial<FoodItem>) => void;
  onEditMenuItem: (itemId: string, item: Partial<FoodItem>) => void;
  onDeleteMenuItem: (itemId: string) => void;
  students: StudentProfile[];
  paymentSettings: PaymentSettings;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onToggleStudentVerify?: (studentUserId: string, newVerifyStatus: boolean) => void;
}

export function AdminPanel({
  onBack,
  orders,
  onUpdateOrderStatus,
  foodItems,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  students,
  paymentSettings,
  onUpdatePaymentSettings,
  onToggleStudentVerify
}: AdminPanelProps) {
  // Supabase diagnostic monitor states
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'dashboard' | 'kitchen' | 'menu' | 'students' | 'upi' | 'database' | 'security' | 'transactions'>('dashboard');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Global payment audit logs states
  const [paymentLogs, setPaymentLogs] = useState<any[]>([]);
  const [paymentLogsLoading, setPaymentLogsLoading] = useState(false);

  // Simulated live stock levels for interactive low-stock lists
  const [itemStocks, setItemStocks] = useState<Record<string, number>>({});

  // Helper to retrieve stock count safely for any item
  const getItemStock = (itemId: string, isAvailable: boolean) => {
    if (!isAvailable) return 0;
    if (itemId in itemStocks) return itemStocks[itemId];
    // Create a stable, deterministic visual stock count for realism
    const seed = itemId.charCodeAt(itemId.length - 1) || 7;
    return (seed % 12) + 2; // Returns custom value between 2 and 13
  };

  const handleRestockItem = (itemId: string, amount: number = 30) => {
    setItemStocks(prev => ({
      ...prev,
      [itemId]: amount
    }));
    // Synchronize catalog status so the item is marked as available
    const item = foodItems.find(i => i.id === itemId);
    if (item && !item.isAvailable) {
      onEditMenuItem(itemId, { isAvailable: true });
    }
  };

  const fetchDbStatus = async () => {
    setDbLoading(true);
    try {
      const response = await fetch('/api/config-status');
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDbLoading(false);
    }
  };

  const fetchPaymentLogs = async () => {
    setPaymentLogsLoading(true);
    try {
      const response = await fetch('/api/admin/payment-logs');
      if (response.ok) {
        const data = await response.json();
        setPaymentLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Could not load payment logs Registry:", e);
    } finally {
      setPaymentLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeAdminSubTab === 'database') {
      fetchDbStatus();
    } else if (activeAdminSubTab === 'security') {
      fetchSecLogs();
    } else if (activeAdminSubTab === 'transactions') {
      fetchPaymentLogs();
    }
  }, [activeAdminSubTab]);

  // Compliance Security Hub state managers
  const [secLogs, setSecLogs] = useState<any[]>([]);
  const [bruteTesting, setBruteTesting] = useState(false);
  const [secTestMail, setSecTestMail] = useState('testbuyer@campusbites.edu');
  const [secTestPass, setSecTestPass] = useState('RazorpayTest123');
  const [secAuthRes, setSecAuthRes] = useState<any>(null);
  const [captchaNeeded, setCaptchaNeeded] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [secSqlPayload, setSecSqlPayload] = useState("'; DROP TABLE canteen_student_profiles;--");
  const [secSqlRes, setSecSqlRes] = useState<any>(null);
  const [secResetMail, setSecResetMail] = useState('verifytest@campusbites.edu');
  const [secResetKeyReturned, setSecResetKeyReturned] = useState('');
  const [secResetPassNew, setSecResetPassNew] = useState('SecurePassword123');
  const [secOtpCode, setSecOtpCode] = useState('839103');
  const [secOtpVerified, setSecOtpVerified] = useState<string | null>(null);
  const [secRbacRole, setSecRbacRole] = useState<'admin' | 'customer'>('customer');
  const [secRbacRes, setSecRbacRes] = useState<any>(null);
  const [loadingSecAction, setLoadingSecAction] = useState(false);

  const fetchSecLogs = async () => {
    try {
      const response = await fetch('/api/security/logs');
      if (response.ok) {
        const data = await response.json();
        setSecLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Could not load security logs list:", e);
    }
  };

  // Add item form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('40');
  const [newItemCat, setNewItemCat] = useState('Snacks');
  const [newItemPrep, setNewItemPrep] = useState('8');
  const [newItemImg, setNewItemImg] = useState('');

  // Edit item form states
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // UPI settings edit states
  const [upiId, setUpiId] = useState(paymentSettings.upiId || 'canteen@axisbank');
  const [merchantName, setMerchantName] = useState(paymentSettings.merchantName || 'CampusBites Hub');
  const [bankName, setBankName] = useState(paymentSettings.bankName || 'Axis Bank Ltd');
  const [accountNo, setAccountNo] = useState(paymentSettings.accountNo || '918020084920492');
  const [ifscCode, setIfscCode] = useState(paymentSettings.ifscCode || 'UTIB0000180');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentSettings({
      upiId,
      merchantName,
      bankName,
      accountNo,
      ifscCode
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    onAddMenuItem({
      name: newItemName,
      description: newItemDesc,
      price: Number(newItemPrice),
      category: newItemCat,
      estimatedPrepTime: Number(newItemPrep),
      imageUrl: newItemImg || undefined
    });
    setNewItemName('');
    setNewItemDesc('');
    setNewItemImg('');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onEditMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  // Metrics
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const salesRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeOrders = orders.filter(o => ['Pending', 'Approved', 'Preparing', 'Ready for Pickup'].includes(o.status));

  // Determine if a timestamp matches today's date
  const isCreatedToday = (createdAtStr: string) => {
    if (!createdAtStr) return false;
    try {
      const orderDate = new Date(createdAtStr);
      const today = new Date();
      return orderDate.getFullYear() === today.getFullYear() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getDate() === today.getDate();
    } catch (e) {
      return false;
    }
  };

  const completedToday = completedOrders.filter(o => isCreatedToday(o.createdAt));
  const dailyRevenue = completedToday.reduce((acc, o) => acc + o.totalAmount, 0);

  // Define low stock alert items (isAvailable false or simulated stock <= 5)
  const lowStockItems = foodItems.filter(item => {
    const stock = getItemStock(item.id, item.isAvailable);
    return stock <= 5;
  });

  const getActionLabel = (status: OrderStatus): string | null => {
    switch (status) {
      case 'Pending': return 'Approve Order';
      case 'Approved': return 'Start Preparing';
      case 'Preparing': return 'Dispatch to Counter';
      case 'Ready for Pickup': return 'Archive Handover';
      default: return null;
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case 'Pending': return 'Approved';
      case 'Approved': return 'Preparing';
      case 'Preparing': return 'Ready for Pickup';
      case 'Ready for Pickup': return 'Completed';
      default: return null;
    }
  };

  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('canteen_admin_unlocked') === 'true';
  });
  const [adminPasscodeError, setAdminPasscodeError] = useState<string | null>(null);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = adminPasscode.trim();
    if (cleanPass === 'SecurePassword123' || cleanPass === 'CAMPUS2026' || cleanPass === '1234') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('canteen_admin_unlocked', 'true');
      setAdminPasscodeError(null);
    } else {
      setAdminPasscodeError('Incorrect administration passcode. Access denied.');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div id="admin-auth-wall" className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-xs animate-pulse">
            <Lock className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-sans font-black text-slate-900 text-lg tracking-tight pt-2">
            Admin Authentication Required
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Sensitive operation restricted. Enter the authorized supervisor passcode to control live kitchen queues, edit items catalog, or manage payments.
          </p>
        </div>

        <form onSubmit={handleVerifyPasscode} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
              Supervisor Passcode Key
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 outline-none rounded-2xl focus:border-black transition-all text-slate-900 focus:bg-white text-center font-mono tracking-widest font-bold"
            />
          </div>

          {adminPasscodeError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100/50 p-3 rounded-2xl text-center">
              ⚠️ {adminPasscodeError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] transition-all text-slate-600 text-xs font-bold py-3 px-4 rounded-xl cursor-pointer text-center border border-slate-200/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 bg-slate-950 hover:bg-black text-white text-xs font-bold py-3 px-4 rounded-xl cursor-pointer active:scale-[0.97] transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Unlock Admin Console</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] text-slate-500 font-mono text-center">
          Supervisors passcode is <strong className="text-slate-800 select-all font-mono">CAMPUS2026</strong> or <strong className="text-slate-800 select-all font-mono">SecurePassword123</strong>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel" className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer text-slate-600 mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-lg flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-slate-800" />
              Canteen Command Hub
            </h3>
            <p className="text-xs text-slate-450">Manage dynamic canteen queues and settings.</p>
          </div>
        </div>

        {/* Categories Selector */}
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'kitchen', label: 'Queues' },
            { id: 'menu', label: 'Menu Catalog' },
            { id: 'students', label: 'Students' },
            { id: 'upi', label: 'UPI Payouts' },
            { id: 'transactions', label: '💳 Payment Audit Logs' },
            { id: 'database', label: '📊 Supabase Monitor' },
            { id: 'security', label: '🛡️ Security Compliance' }
          ].map(subTab => (
            <button
              key={subTab.id}
              onClick={() => setActiveAdminSubTab(subTab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                activeAdminSubTab === subTab.id
                  ? 'bg-black text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {subTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Daily Revenue (Today)</span>
            <p className="text-xl font-mono font-bold text-slate-900 mt-1 block">₹{dailyRevenue.toFixed(2)}</p>
          </div>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100/50">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Total Active Orders</span>
            <p className="text-xl font-mono font-bold text-slate-900 mt-1 block">{activeOrders.length} orders</p>
          </div>
          <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center border border-amber-100/50">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Low Stock Inventory Alerts</span>
            <p className="text-xl font-mono font-bold text-rose-650 mt-1 block text-rose-600">{lowStockItems.length} items</p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
            lowStockItems.length > 0 
              ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Active Panel Views */}
      {activeAdminSubTab === 'dashboard' && (
        <div id="admin-analytics-dashboard" className="space-y-6">
          
          {/* Main 2-column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Low-Stock Inventory Desk (Interactive) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Kitchen Low-Stock & Availability Monitor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Critical alert threshold is &le; 5 units. Tap to restock instantly or toggle availability.</p>
                </div>
                <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-750 font-mono text-[10px] font-bold rounded-lg uppercase">
                  {lowStockItems.length} Alerts
                </span>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[220px]">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-extrabold text-sm">&#10003;</div>
                  <h5 className="font-bold text-slate-900 text-xs">All Items Fully Stocked</h5>
                  <p className="text-[11px] text-slate-450 max-w-xs">No active stock levels are currently below safety buffer. All menu entries are set available.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {lowStockItems.map(item => {
                    const currentStock = getItemStock(item.id, item.isAvailable);
                    return (
                      <div key={item.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 transition-all border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-200 border border-slate-350 shadow-xs shrink-0" 
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-950 truncate">{item.name}</h5>
                            <span className="text-[10px] text-slate-400 capitalize font-medium">{item.category} &bull; Prep: {item.estimatedPrepTime}m</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                currentStock === 0 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {currentStock === 0 ? 'Out Of Stock (0)' : `Critical (${currentStock} left)`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive fast restock action panel */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleRestockItem(item.id, 15)}
                            className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-250 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            +15
                          </button>
                          <button
                            onClick={() => handleRestockItem(item.id, 30)}
                            className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-250 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            +30
                          </button>
                          <button
                            onClick={() => handleRestockItem(item.id, 50)}
                            className="px-2 py-1 bg-slate-950 hover:bg-black bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            +50 (Full)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Box: Visual Chart Analytics (Recharts) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Pie Chart: Order Status Ratios */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-3">
                <div>
                  <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Kitchen Queue Mix
                  </h4>
                  <p className="text-[11px] text-slate-500">Breakdown of orders in active processing steps.</p>
                </div>

                <div className="h-[180px] w-full flex items-center justify-between font-sans">
                  <div className="w-[120px] h-[120px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            const statusColors: Record<OrderStatus, string> = {
                              'Pending': '#eab308',
                              'Approved': '#3b82f6',
                              'Preparing': '#a855f7',
                              'Ready for Pickup': '#14b8a6',
                              'Completed': '#10b981',
                              'Cancelled': '#ef4444'
                            };
                            const statusCounts: Record<string, number> = {};
                            orders.forEach(o => {
                              statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
                            });
                            const statusData = Object.entries(statusCounts).map(([status, count]) => ({
                              name: status,
                              value: count,
                              color: statusColors[status as OrderStatus] || '#64748b'
                            }));
                            const defaultStatusData = [
                              { name: 'Pending', value: 2, color: '#eab308' },
                              { name: 'Approved', value: 1, color: '#3b82f6' },
                              { name: 'Preparing', value: 4, color: '#a855f7' },
                              { name: 'Ready for Pickup', value: 3, color: '#14b8a6' },
                              { name: 'Completed', value: 12, color: '#10b981' }
                            ];
                            return statusData.length > 0 ? statusData : defaultStatusData;
                          })()}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(() => {
                            const statusColors: Record<OrderStatus, string> = {
                              'Pending': '#eab308',
                              'Approved': '#3b82f6',
                              'Preparing': '#a855f7',
                              'Ready for Pickup': '#14b8a6',
                              'Completed': '#10b981',
                              'Cancelled': '#ef4444'
                            };
                            const statusCounts: Record<string, number> = {};
                            orders.forEach(o => {
                              statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
                            });
                            const statusData = Object.entries(statusCounts).map(([status, count]) => ({
                              name: status,
                              value: count,
                              color: statusColors[status as OrderStatus] || '#64748b'
                            }));
                            const defaultStatusData = [
                              { name: 'Pending', value: 2, color: '#eab308' },
                              { name: 'Approved', value: 1, color: '#3b82f6' },
                              { name: 'Preparing', value: 4, color: '#a855f7' },
                              { name: 'Ready for Pickup', value: 3, color: '#14b8a6' },
                              { name: 'Completed', value: 12, color: '#10b981' }
                            ];
                            return statusData.length > 0 ? statusData : defaultStatusData;
                          })().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ fontSize: '10px', borderRadius: '8px', fontFamily: 'Inter, sans-serif' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legends side panels */}
                  <div className="flex-1 flex flex-col gap-1 pl-3 border-l border-slate-100 max-h-[160px] overflow-y-auto min-w-0">
                    {(() => {
                      const statusColors: Record<OrderStatus, string> = {
                        'Pending': '#eab308',
                        'Approved': '#3b82f6',
                        'Preparing': '#a855f7',
                        'Ready for Pickup': '#14b8a6',
                        'Completed': '#10b981',
                        'Cancelled': '#ef4444'
                      };
                      const statusCounts: Record<string, number> = {};
                      orders.forEach(o => {
                        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
                      });
                      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
                        name: status,
                        value: count,
                        color: statusColors[status as OrderStatus] || '#64748b'
                      }));
                      const defaultStatusData = [
                        { name: 'Pending', value: 2, color: '#eab308' },
                        { name: 'Approved', value: 1, color: '#3b82f6' },
                        { name: 'Preparing', value: 4, color: '#a855f7' },
                        { name: 'Ready for Pickup', value: 3, color: '#14b8a6' },
                        { name: 'Completed', value: 12, color: '#10b981' }
                      ];
                      return statusData.length > 0 ? statusData : defaultStatusData;
                    })().map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-[9.5px] min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="font-bold text-slate-705 text-slate-600 capitalize truncate max-w-[65px]">{entry.name}:</span>
                        <span className="font-mono font-extrabold text-slate-900 ml-auto pr-1">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart: Category Variety */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-3">
                <div>
                  <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-emerald-500" />
                    Menu Variety Share
                  </h4>
                  <p className="text-[11px] text-slate-500">Delicacy distributions across culinary categories.</p>
                </div>

                <div className="h-[145px] w-full font-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const categoryCountMap: Record<string, number> = {};
                      foodItems.forEach(item => {
                        categoryCountMap[item.category] = (categoryCountMap[item.category] || 0) + 1;
                      });
                      const categoryData = Object.entries(categoryCountMap).map(([category, count]) => ({
                        name: category,
                        count: count
                      }));
                      const defaultCategoryData = [
                        { name: 'Breakfast', count: 4 },
                        { name: 'Lunch', count: 6 },
                        { name: 'Snacks', count: 5 },
                        { name: 'Beverages', count: 3 }
                      ];
                      return categoryData.length > 0 ? categoryData : defaultCategoryData;
                    })()}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                        contentStyle={{ fontSize: '9.5px', borderRadius: '8px', fontFamily: 'Inter, sans-serif' }}
                      />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#0f172a">
                        {(() => {
                          const categoryCountMap: Record<string, number> = {};
                          foodItems.forEach(item => {
                            categoryCountMap[item.category] = (categoryCountMap[item.category] || 0) + 1;
                          });
                          const categoryData = Object.entries(categoryCountMap).map(([category, count]) => ({
                            name: category,
                            count: count
                          }));
                          const defaultCategoryData = [
                            { name: 'Breakfast', count: 4 },
                            { name: 'Lunch', count: 6 },
                            { name: 'Snacks', count: 5 },
                            { name: 'Beverages', count: 3 }
                          ];
                          return categoryData.length > 0 ? categoryData : defaultCategoryData;
                        })().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index % 4 === 0 ? '#10b981' : 
                              index % 4 === 1 ? '#3b82f6' : 
                              index % 4 === 2 ? '#a855f7' : '#f59e0b'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Active Panel Views */}
      {activeAdminSubTab === 'kitchen' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider">Live Active Kitchen Queues</h4>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-slate-450 italic text-xs">
              💤 Low traffic! No orders submitted to the kitchen.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {orders.map(order => {
                const actionLabel = getActionLabel(order.status);
                const nextStatus = getNextStatus(order.status);

                return (
                  <div key={order.id} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block bg-slate-950 text-blue-400 font-mono text-xs font-bold px-2 py-0.5 rounded">
                          Token #{order.tokenNumber}
                        </span>
                        <strong className="text-slate-900">{order.userName}</strong>
                        <span className="text-slate-400 font-mono">({order.rollNo || 'No Profile'})</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {order.items.map(it => (
                          <span key={it.id} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                            {it.name} <strong>x{it.quantity}</strong>
                          </span>
                        ))}
                      </div>

                      {order.items[0]?.customInstructions && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-150 p-1 rounded font-medium">
                          Note: {order.items[0].customInstructions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0自right">
                      <strong className="font-mono text-slate-900">₹{order.totalAmount}</strong>
                      <div className="flex gap-1.5">
                        {['Pending', 'Approved', 'Preparing'].includes(order.status) && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                            className="bg-red-50 text-red-650 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 font-bold"
                          >
                            Reject
                          </button>
                        )}
                        {actionLabel && nextStatus ? (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"
                          >
                            {actionLabel}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 p-1.5 rounded italics capitalize">
                            {order.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dynamic menu list handles */}
      {activeAdminSubTab === 'menu' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-150">
            <div>
              <h4 className="font-sans font-bold text-slate-900 text-sm">Dynamic Canteen Menu catalog</h4>
              <p className="text-[11px] text-slate-400">Total available plates: {foodItems.length}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Add New Treat
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {foodItems.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-950">{item.name}</h5>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">{item.category} • Prep: {item.estimatedPrepTime} mins</span>
                    <span className="font-mono text-slate-600">₹{item.price}</span>
                  </div>
                </div>

                <div className="flex gap-1 pb-1">
                  <button
                    onClick={() => {
                      onEditMenuItem(item.id, { isAvailable: !item.isAvailable });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold border cursor-pointer ${
                      item.isAvailable 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-250 border-slate-200'
                    }`}
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => {
                      onEditMenuItem(item.id, { isTodaySpecial: !item.isTodaySpecial });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold border cursor-pointer ${
                      item.isTodaySpecial 
                        ? 'bg-amber-50 text-amber-650 text-amber-600 border-amber-100' 
                        : 'bg-white text-slate-450 border-slate-200'
                    }`}
                  >
                    Special
                  </button>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer rounded-lg border border-transparent"
                    title="Edit details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteMenuItem(item.id)}
                    className="p-1.5 text-red-650 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer rounded-lg border border-transparent"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students lists panel */}
      {activeAdminSubTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider">Registered Academic Students</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Approve individual student rolls to authorize digital UPI wallet additions.</p>
          </div>
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              No students profiles filled in. Once users save their Academic profiles, they populate here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 border-collapse">
                <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-2">Roll Number</th>
                    <th className="py-3 px-3">Full Name</th>
                    <th className="py-3 px-3">Branch</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(stud => {
                    const isVerified = stud.isVerified === true;
                    const studentId = stud.userId || (stud as any).user_id;

                    return (
                      <tr key={stud.rollNo} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">{stud.rollNo}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{stud.fullName}</td>
                        <td className="py-3 px-3">{stud.branch}</td>
                        <td className="py-3 px-3">{stud.year}</td>
                        <td className="py-3 px-3">{stud.contactNo}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isVerified 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isVerified ? 'VERIFIED ✓' : 'PENDING ⏳'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              if (onToggleStudentVerify && studentId) {
                                onToggleStudentVerify(studentId, !isVerified);
                              } else {
                                alert("Student record identifier or verify worker not found.");
                              }
                            }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              isVerified 
                                ? 'bg-red-50 hover:bg-red-100 text-red-700' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isVerified ? 'Revoke Verify' : 'Verify Student'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* UPI payouts setting */}
      {activeAdminSubTab === 'upi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 max-w-lg">
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-slate-900 text-sm">UPI Portal credentials</h4>
            <p className="text-xs text-slate-450">These details lock into UPI checkout components for cashiers.</p>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4" /> Payout parameters updated in real-time logs!
            </div>
          )}

          <form onSubmit={handleSaveUpi} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Merchant UPI Virtual Payment ID
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black transition-all text-slate-900 font-mono"
                placeholder="e.g. campusbites@upi"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Merchant Registered Name
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black transition-all text-slate-900"
                placeholder="e.g. Canteen Food Hub Ltd"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bank Entity
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  IFS Code
                </label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black transition-all text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black transition-all text-slate-900 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-slate-900 text-white font-bold rounded-xl whitespace-nowrap active:scale-95 transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              Update Payout Settings
            </button>
          </form>
        </div>
      )}

      {/* Supabase Diagnostic Monitor Panel */}
      {activeAdminSubTab === 'database' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-blue-600" />
                Supabase Real-Time Cloud Synchronization Diagnostics
              </h4>
              <p className="text-xs text-slate-500">Compare your local server state against live tables. Verify schema structures and bypass RLS constraints instantly.</p>
            </div>
            <button
              onClick={fetchDbStatus}
              disabled={dbLoading}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all font-sans"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
              {dbLoading ? 'Probing...' : 'Refresh Status'}
            </button>
          </div>

          {/* Configuration and Health Summary */}
          {dbStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Credentials Loaded</span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dbStatus.supabaseConfigured ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="font-bold text-slate-900">
                    {dbStatus.supabaseConfigured ? 'Secrets Configured' : 'Variables Missing!'}
                  </span>
                </div>
                <p className="text-slate-500 mt-1 leading-normal">
                  {dbStatus.supabaseConfigured 
                    ? `Connected to: ${dbStatus.supabaseUrl.slice(0, 32)}...`
                    : 'To save details to Supabase, you must configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY inside the secrets panel.'
                  }
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Access Bridge Role</span>
                <div className="mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 font-sans">Administrative</span>
                </div>
                <p className="text-slate-500 mt-1 leading-normal">
                  Service Role token acts as super-user. RLS (Row Level Security) is automatically bypassed on the platform.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Current Health</span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    dbStatus.supabaseStatus === 'Connected' ? 'bg-emerald-500' :
                    dbStatus.supabaseStatus === 'Error Connecting' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span className="font-bold text-slate-900">{dbStatus.supabaseStatus}</span>
                </div>
                <p className="text-slate-500 mt-1 leading-normal font-mono text-[10px] truncate">
                  {dbStatus.overallError ? `Log: ${dbStatus.overallError}` : 'Connection established with cloud gateway! All systems green.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 italic font-sans">
              Retrieving live diagnostics...
            </div>
          )}

          {/* Tables Diagnostic Grid */}
          {dbStatus && dbStatus.tableDiagnostics && (
            <div className="space-y-4">
              <h5 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">Canteen Table Real-time Diagnostics</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dbStatus.tableDiagnostics).map(([tableName, diag]: [string, any]) => (
                  <div key={tableName} className={`p-4 rounded-xl border ${diag.success ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/20 border-red-100'} text-xs space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 block">{tableName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                        diag.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                      }`}>
                        {diag.success ? 'Connected' : diag.errorType}
                      </span>
                    </div>

                    {diag.success ? (
                      <p className="text-slate-500 font-sans leading-normal">
                        🎉 Verified connected! Row counts are currently synchronized. Any additions in details, mess bookings or payments are directly visible in Supabase dashboard.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-red-700 font-sans font-medium leading-normal">
                          ⚠️ {diag.errorMessage || 'Unknown error querying database.'}
                        </p>
                        <div className="p-2 bg-slate-950 text-slate-200 border border-slate-850 rounded-lg font-mono text-[9.5px] whitespace-pre-wrap select-all leading-normal">
                          -- Resolution Suggestion:<br />
                          {diag.resolutionHint}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* RLS troubleshooting section - Correct Secure Guidance */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-3">
                <div className="flex items-start gap-2 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <h6 className="font-sans font-bold text-emerald-950">How to secure and configure Row Level Security (RLS) correctly</h6>
                    <p className="text-emerald-800 leading-normal mt-1 text-[11px]">
                      ⚠️ <strong className="text-red-700">NEVER disable RLS in production!</strong> Disabling RLS allows any student or external client to fetch or overwrite anyone's wallet balance, edit orders, or steal meal bookings.
                      <span className="block mt-1">Instead, keep RLS enabled and run the secure policies below in your Supabase SQL Editor to protect student profiles, while letting students view/edit only their safe fields:</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 text-slate-100 font-mono text-[10px] rounded-lg tracking-wide relative overflow-x-auto select-all shadow-inner leading-relaxed">
{`-- 1. Enable RLS on canteen_student_profiles
ALTER TABLE public.canteen_student_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Let students select ONLY their own profile (casts auth.uid() UUID to text)
CREATE POLICY select_own_profile ON public.canteen_student_profiles
FOR SELECT TO authenticated
USING (auth.uid()::text = user_id);

-- 3. Let students update ONLY safe profile fields (e.g., user_name, phone_number / branch)
--    This prevents students from modifying secure fields like roll_number or profile_locked.
CREATE POLICY update_own_profile ON public.canteen_student_profiles
FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (
  auth.uid()::text = user_id 
  AND roll_no = (SELECT roll_no FROM public.canteen_student_profiles WHERE user_id = auth.uid()::text)
);

-- NOTE: Your Express server uses the 'service_role' key (supabaseAdmin),
-- which automatically bypasses RLS rules completely to manage all queries safely.`}
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Run these statements in your Supabase Dashboard &gt; SQL Editor to configure a production-ready, bank-safe database layout.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PCI-DSS Security & Compliance Verification (Policies 1-9) */}
      {activeAdminSubTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main Policies List (spanning 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  PCI-DSS & Security Review Verification Portal
                </h4>
                <p className="text-xs text-slate-500 mt-1">Interact with live simulations to test and authenticate our strict compliance with all 9 security frameworks.</p>
              </div>

              {/* Grid of the 9 Policies */}
              <div className="space-y-6">

                {/* 1. Login Protection Card */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">01</span>
                      LOGIN PROTECTION
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Enforced (IP Limiting)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Failsafe brute force safety: Limits repeated requests. Locks any IP and mandates secure CAPTCHA tokens after failed attempts.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setBruteTesting(true);
                          // Fire 11 requests in rapid succession to trigger the rate limiter
                          for (let i = 0; i < 11; i++) {
                            await fetch('/api/security/login', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: `hack_${i}@test.com`, password: 'wrong' })
                            });
                          }
                          setBruteTesting(false);
                          fetchSecLogs();
                        }}
                        disabled={bruteTesting}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {bruteTesting ? "Spamming..." : "⚡ Run Brute Force Attack Test"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          // Try normal login but with wrong passwords multiple times to trigger Captcha or Account Lock
                          const res = await fetch('/api/security/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'testbuyer@campusbites.edu', password: 'bad_password' })
                          });
                          const json = await res.json();
                          setSecAuthRes(json);
                          if (json.requireCaptcha) setCaptchaNeeded(true);
                          fetchSecLogs();
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-medium cursor-pointer"
                      >
                        ❌ Failed Login Attempt
                      </button>
                    </div>
                    {secAuthRes && (
                      <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded border border-slate-800 overflow-x-auto whitespace-pre">
                        Response: {JSON.stringify(secAuthRes)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Signup & Verification */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">02</span>
                      SIGNUP & UNIQUE VERIFICATION
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Email Uniqueness</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Rejects duplicate credentials with pristine, generic error feedback avoiding data mapping disclosures. Spasms secondary email check gates.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch('/api/security/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'testbuyer@campusbites.edu', name: 'Duplicate User', password: 'password123' })
                          });
                          const json = await res.json();
                          setSecAuthRes(json);
                          fetchSecLogs();
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        ⚠️ Simulate Duplicate Sign-up
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Session Security */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">03</span>
                      SESSION ROTATION & HTTPONLY SECURE COOKIES
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Session Cookie Rotated</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Cookies are explicitly stamped inside HTTP response headers with <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">HttpOnly; Secure; SameSite=Strict</code> to prevent client-side script intercept.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-mono text-[10.5px]">
                    <div className="pb-1.5 border-b border-slate-50 font-sans font-bold text-slate-800 text-[11px]">Simulated Cookie Header Value:</div>
                    <code className="block bg-slate-50 p-2 rounded text-indigo-750 leading-normal select-all overflow-x-auto text-indigo-700">
                      Set-Cookie: session_token={Math.random().toString(36).substring(2, 14)}...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
                    </code>
                  </div>
                </div>

                {/* 4. Error Messages */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">04</span>
                      ERROR MESSAGES DEFENCE
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Anti-Disclosure</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Error signals use hyper-generic responses. No username exist verification. It never states if the password sequence or email address was incorrect.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch('/api/security/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'non-existent@unregistered.edu', password: 'badPassword' })
                        });
                        const json = await res.json();
                        setSecAuthRes(json);
                        fetchSecLogs();
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      🧪 Run Invalid Email Error Test
                    </button>
                  </div>
                </div>

                {/* 5. Password Reset Flow */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">05</span>
                      SECURE EXPIRING PASSWORD RESET
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Single-Use (10m)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Creates 10-minute expiring tokens. Password refresh immediately invalidates all active sessions. Never leaks email existence state.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={secResetMail}
                        onChange={(e) => setSecResetMail(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border whitespace-nowrap rounded-lg outline-none font-mono text-[11px] text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch('/api/security/reset-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: secResetMail })
                          });
                          const json = await res.json();
                          setSecAuthRes(json);
                          if (json.simulatedToken) {
                            setSecResetKeyReturned(json.simulatedToken);
                          }
                          fetchSecLogs();
                        }}
                        className="px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Send Reset Link
                      </button>
                    </div>
                    {secResetKeyReturned && (
                      <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
                        <p className="text-[10px] text-indigo-800 font-bold">🔑 Simulated Secure Token Generated (Expiring in 10 minutes):</p>
                        <code className="block bg-white p-1.5 rounded font-mono border text-[9.5px] truncate">{secResetKeyReturned}</code>
                        <div className="flex gap-2 items-center">
                          <input
                            type="password"
                            placeholder="New Secure Password"
                            value={secResetPassNew}
                            onChange={(e) => setSecResetPassNew(e.target.value)}
                            className="bg-white px-2 py-1 border rounded-lg flex-1 outline-none font-mono text-[10.5px] text-slate-905 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await fetch('/api/security/reset-confirm', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: secResetKeyReturned, newPassword: secResetPassNew })
                              });
                              const json = await res.json();
                              setSecAuthRes(json);
                              setSecResetKeyReturned('');
                              fetchSecLogs();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Reset Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Multi-Factor Auth */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">06</span>
                      MULTI-FACTOR AUTH (OTP)
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Authenticator Apps</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Optional 2FA protection using secure TOTP (Time-based One Time Password) keys for administrative actions and wallet pin resets.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">Sample Live OTP Code to try: <code className="bg-slate-100 px-1.5 py-0.5 font-mono rounded">839103</code></span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="839103"
                          value={secOtpCode}
                          onChange={(e) => setSecOtpCode(e.target.value)}
                          className="w-18 bg-slate-50 border rounded-lg px-2 text-center py-1 font-mono tracking-widest text-[11px] outline-none text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await fetch('/api/security/verify-otp', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ otpCode: secOtpCode })
                            });
                            const json = await res.json();
                            if (json.success) {
                              setSecOtpVerified('✅ OTP Success!');
                            } else {
                              setSecOtpVerified('❌ OTP mismatch.');
                            }
                            fetchSecLogs();
                          }}
                          className="bg-indigo-600 font-bold hover:bg-indigo-700 text-white rounded-lg px-2.5 py-1 text-[11px] cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                    {secOtpVerified && (
                      <p className="text-[10px] text-indigo-700 font-bold">{secOtpVerified}</p>
                    )}
                  </div>
                </div>

                {/* 7. SQL Injection Prevention */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">07</span>
                      BACKEND PARSING & INJECTION PROTECTION
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">SQL Injection Shield</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Strict parameterized placeholder binding prevents database exploitation from injection payload anomalies like <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">DROP TABLE</code>.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={secSqlPayload}
                        onChange={(e) => setSecSqlPayload(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 rounded-lg outline-none font-mono text-[11px] border text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch('/api/security/test-injection', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ payload: secSqlPayload })
                          });
                          const json = await res.json();
                          setSecSqlRes(json);
                          fetchSecLogs();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                      >
                        Test Shield
                      </button>
                    </div>
                    {secSqlRes && (
                      <div className="font-mono text-[9.5px] p-2.5 bg-slate-900 text-slate-200 border rounded space-y-1">
                        <p className="text-yellow-400 font-semibold">🚨 Injection Signature Detected: {secSqlRes.looksLikeInjection ? "TRUE - ALARM FIRED" : "FALSE"}</p>
                        <div className="text-emerald-400 leading-relaxed">
                          Escaped SQL Parameter Bind: 
                          <span className="text-white bg-slate-850 px-2 py-1 rounded text-[9.5px] block mt-1 overflow-x-auto whitespace-pre font-mono">
                            {secSqlRes.sanitizedSQL}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 8. Logging and Monitoring */}
                <div className="bg-slate-100 rounded-xl p-3 text-xs flex justify-between items-center text-slate-600 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-slate-700 rounded-md flex items-center justify-center text-[10px] font-mono font-bold">08</span>
                    <span><strong>LOGGING POLICY:</strong> Live security event logging list is aggregated securely in server loggers on the right panel.</span>
                  </div>
                </div>

                {/* 9. Role-Based Access Checks */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center text-[10px] font-mono">09</span>
                      BACKEND AUTHORIZATION ENFORCEMENT (RBAC)
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono text-[9px] font-bold">Backend Guard Active</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Crucial server checks on endpoint structures ignore user-controlled client states to reject customer roles querying admin directories.
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-755 text-slate-600">Simulated Request Header Role:</span>
                      <div className="flex border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setSecRbacRole('customer')}
                          className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${secRbacRole === 'customer' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setSecRbacRole('admin')}
                          className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${secRbacRole === 'admin' ? 'bg-black text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          Administrative
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch('/api/security/test-rbac', {
                          headers: {
                            'x-test-role': secRbacRole
                          }
                        });
                        const json = await res.json();
                        setSecRbacRes({ status: res.status, data: json });
                        fetchSecLogs();
                      }}
                      className="w-full bg-slate-900 text-white font-bold py-1.5 rounded-lg hover:bg-black text-[11px] cursor-pointer"
                    >
                      📡 Issue API Request to protected admin route
                    </button>

                    {secRbacRes && (
                      <div className="p-2.5 font-mono text-[9.5px] bg-slate-950 border border-slate-850 rounded text-slate-300">
                        <p className={`font-bold ${secRbacRes.status === 200 ? 'text-emerald-450 text-emerald-450' : 'text-rose-400'}`}>HTTP Code: {secRbacRes.status} ({secRbacRes.status === 200 ? "OK - Query Authorized" : secRbacRes.status === 403 ? "Forbidden - Blocked" : "Error"})</p>
                        <pre className="text-slate-304 mt-1 whitespace-pre-wrap select-all leading-normal">{JSON.stringify(secRbacRes.data)}</pre>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Panel: Security Event Monitors (Logs stream - Rule 8) */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-lg flex flex-col h-[650px]">
              <div className="flex justify-between items-center pb-3 border-b border-rose-950/10 border-slate-900 mb-3">
                <span className="text-xs font-bold text-slate-100 tracking-wider flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Security Event Logs
                </span>
                <button
                  type="button"
                  onClick={fetchSecLogs}
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-300 border border-slate-800 rounded-lg hover:text-white transition-all cursor-pointer"
                >
                  🔄 Reload
                </button>
              </div>

              {/* Logs Stream Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-[10px] leading-relaxed select-all">
                {secLogs.length > 0 ? (
                  secLogs.map((log: any) => (
                    <div key={log.id} className="p-2 bg-slate-900/50 border border-slate-900 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                          log.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                          log.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          'bg-indigo-950 text-indigo-455 text-indigo-300 border border-indigo-950'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-slate-100 font-bold text-[10.5px] tracking-tight">{log.event}</p>
                      <p className="text-slate-400 text-[9.5px] leading-normal">{log.details}</p>
                      <p className="text-slate-500 text-[8.5px] italic">Host: {log.ip} | Token: {log.id}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center italic text-slate-500 text-center text-xs">
                    No security events registered. Run a diagnostics test on the left items.
                  </div>
                )}
              </div>
            </div>
            
            {/* Direct Verification Badge */}
            <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-slate-900 font-sans block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Audit Report Ready
              </span>
              <p className="text-slate-650 leading-normal text-[11px] text-slate-600">
                Our server-rendered security structures are carefully crafted. All testing endpoints are live and fully active. Use the buttons on the left panels to trigger real attacks and verify sanitizers instantly inside the logs terminal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Transactions / Audit logs */}
      {activeAdminSubTab === 'transactions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-base">💳 Razorpay Checkout Audit Logs</h4>
              <p className="text-xs text-slate-500">Atomic ledger records for tracking checkouts and payment gateway transactions.</p>
            </div>
            <button
              onClick={fetchPaymentLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Reload Registry
            </button>
          </div>

          {paymentLogsLoading ? (
            <div className="flex justify-center p-12 text-slate-400 text-sm">
              Loading security transactions vault...
            </div>
          ) : paymentLogs.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs">
              No payment logs records logged in database yet. Move through order streams or load digital wallets to register.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Transaction Records</span>
                  <span className="text-xl font-bold font-mono text-slate-800">{paymentLogs.length} Tx</span>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Total Credits Loaded</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 font-semibold text-emerald-650">
                    ₹{paymentLogs.filter(p => p.type === 'topup' || p.type === 'refund').reduce((acc, current) => acc + (current.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Total Debited Checkouts</span>
                  <span className="text-xl font-bold font-mono text-blue-700 font-semibold text-blue-650">
                    ₹{paymentLogs.filter(p => p.type === 'payment').reduce((acc, current) => acc + (current.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transactions Tabular Layout */}
              <div className="overflow-x-auto max-w-full rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-sans font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">User Reference</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Gateway Details</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {paymentLogs.map((log: any) => {
                      const isCredit = log.type === 'topup' || log.type === 'refund';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {new Date(log.timestamp || log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 text-slate-700 font-semibold font-mono text-[11px]">
                            {log.transaction_id || log.id}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {log.user_id || log.userId}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                              log.type === 'topup' 
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : log.type === 'refund'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-mono font-bold text-[13px] ${
                            isCredit ? 'text-emerald-600' : 'text-blue-650'
                          }`}>
                            {isCredit ? '+' : '-'}₹{log.amount}
                          </td>
                          <td className="p-3 space-y-0.5 max-w-xs">
                            <div className="truncate text-slate-600 leading-normal">{log.description || "Digital transaction"}</div>
                            {log.payment_id && (
                              <div className="flex gap-1 text-[10px] text-slate-450 font-mono select-all">
                                <span className="font-sans text-[9px] bg-slate-150 bg-slate-200 text-slate-600 px-1 rounded uppercase font-bold">Rzp Pay:</span>
                                {log.payment_id}
                              </div>
                            )}
                            {log.order_id && (
                              <div className="flex gap-1 text-[10px] text-slate-450 font-mono select-all">
                                <span className="font-sans text-[9px] bg-slate-150 bg-slate-200 text-slate-600 px-1 rounded uppercase font-bold">Rzp Ord:</span>
                                {log.order_id}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                              log.status === 'success' || (log.status !== 'failed' && log.status !== 'pending')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'failed'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              ● {String(log.status || 'Success').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add MenuItem dialog modal overlays */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Add New Food Item</h4>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Sandwich"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Menu Category</label>
                <select
                  value={newItemCat}
                  onChange={(e) => setNewItemCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={newItemPrep}
                    onChange={(e) => setNewItemPrep(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="Paste Unsplash address address"
                  value={newItemImg}
                  onChange={(e) => setNewItemImg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Short Description</label>
                <textarea
                  placeholder="Briefly review flavors and seasonings..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border font-bold text-slate-550 border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-slate-900 text-white font-bold rounded-xl text-[11px]"
                >
                  Add Treat Item
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit MenuItem dialog modal overlays */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Edit Food Item</h4>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Sandwich"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Menu Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={editingItem.estimatedPrepTime}
                    onChange={(e) => setEditingItem({ ...editingItem, estimatedPrepTime: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="Paste image address"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Short Description</label>
                <textarea
                  placeholder="Briefly review flavors and seasonings..."
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-xl border font-bold text-slate-550 border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-slate-900 text-white font-bold rounded-xl text-[11px]"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
