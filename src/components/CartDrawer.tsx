import React, { useState } from 'react';
import { ShoppingBag, Trash2, ShieldCheck, CreditCard, FileText, ArrowRight, X, AlertCircle, ExternalLink, Sparkles, Percent } from 'lucide-react';
import { FoodItem, CartItem, Order, OrderCartItem } from '../types';

interface CartDrawerProps {
  user: { id: string; name: string; email: string; role: 'customer' | 'admin' };
  cart: { [key: string]: number };
  menuItems: FoodItem[];
  onUpdateCart: (item: FoodItem, quantity: number) => void;
  onClearCart: () => void;
  onOrderPlacement: (order: Order) => void;
  onExploreMenu?: () => void;
}

export function CartDrawer({
  user,
  cart,
  menuItems,
  onUpdateCart,
  onClearCart,
  onOrderPlacement,
  onExploreMenu
}: CartDrawerProps) {
  const [paymentMethod] = useState<'razorpay'>('razorpay');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; msg: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Simulated Razorpay Interactive Modal State
  const [showRzpSimulator, setShowRzpSimulator] = useState<boolean>(false);
  const [simulatedOrderId, setSimulatedOrderId] = useState<string>('');
  const [simulatedAmount, setSimulatedAmount] = useState<number>(0);

  // Razorpay Diagnostic Configuration/Auth Error details
  const [rzpCredError, setRzpCredError] = useState<{
    error: string;
    details: string;
    diagnosis: {
      isKeyIdConfigured: boolean;
      isKeySecretConfigured: boolean;
      keyIdFormatValid: boolean;
      keyIdMasked: string;
      keySecretMasked: string;
      suggestion: string;
    };
  } | null>(null);

  // Derive cart list
  const cartItems: CartItem[] = Object.keys(cart)
    .map(id => {
      const foodItem = menuItems.find(item => item.id === id);
      if (!foodItem) return null;
      return {
        foodItem,
        quantity: Math.max(0, cart[id])
      };
    })
    .filter((v): v is CartItem => v !== null && v.quantity > 0);

  // Bill calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.foodItem.price * item.quantity), 0);
  
  // Coupon trigger
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CAMPUS20' || code === 'SPHN20' || code === 'WELCOME20') {
      setAppliedCoupon({
        code,
        discountPercent: 20,
        msg: '20% Swiggy-style redesign coupon applied!'
      });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon. Try CAMPUS20 for 20% OFF!');
    }
  };

  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const taxes = 0; // Removed: Student IGST & CGST (5%)
  const platformFee = 0; // Removed: Fixed Platform Fee
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Initialize the payment transaction
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Ask Server to initiate payment order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, userId: user.id, purpose: 'order_checkout' })
      });

      let data: any = {};
      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (isJson) {
        try {
          data = await response.json();
        } catch (_) {}
      }

      if (!response.ok) {
        if (response.status === 401 && data.isAuthError) {
          setRzpCredError(data);
          setIsProcessing(false);
          return;
        }
        throw new Error(data.error || `HTTP error ${response.status} initiating order`);
      }

      if (data.mock) {
        // Run sandbox simulation interface
        setSimulatedOrderId(data.orderId);
        setSimulatedAmount(totalAmount);
        setShowRzpSimulator(true);
        setIsProcessing(false);
      } else {
        // Live Razorpay SDK workflow
        const loadScript = () => {
          return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadScript();
        if (!loaded) {
          throw new Error("Razorpay payment gateway SDK failed to load. Try checking your internet connection.");
        }

        const options = {
          key: data.keyId || "YOUR_RAZORPAY_KEY_ID", // Dynamic key from server configurations
          amount: data.amount,
          currency: data.currency,
          name: "Campus Canteen Checkout",
          description: "Pay for wholesome freshly cooked meals",
          order_id: data.orderId,
          handler: async (resp: any) => {
            await submitCompletedOrder(resp.razorpay_payment_id, 'razorpay', 'Paid', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature
            });
          },
          prefill: {
            name: user.name,
            email: user.email,
            method: data.prefillMethod || 'upi'
          },
          config: data.checkoutConfig || {
            display: {
              blocks: {
                upi: {
                  name: "UPI / Google Pay / PhonePe",
                  instruments: [
                    {
                      method: "upi",
                      flows: ["intent", "qr", "collect"]
                    }
                  ]
                }
              },
              sequence: ["block.upi"],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          theme: { color: "#1B4D3E" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      }
    } catch (err: any) {
      alert("Checkout sequence error: " + err.message);
      setIsProcessing(false);
    }
  };

  // Complete local simulation verify bypass
  const handleSimulatedPayment = async (status: 'Success' | 'Failed') => {
    setShowRzpSimulator(false);
    if (status === 'Failed') {
      alert("Simulated Razorpay transaction was declined by simulated gateway.");
      return;
    }

    setIsProcessing(true);
    const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 10)}`;
    await submitCompletedOrder(mockPaymentId, 'razorpay', 'Paid', {
      razorpay_order_id: simulatedOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: "simulated_sig"
    });
  };

  const submitCompletedOrder = async (payId: string, method: 'razorpay', payStatus: 'Paid' | 'Unpaid', rzpParams?: any) => {
    try {
      const orderItems: OrderCartItem[] = cartItems.map(item => ({
        id: item.foodItem.id,
        name: item.foodItem.name,
        price: item.foodItem.price,
        quantity: item.quantity,
        category: item.foodItem.category,
        customInstructions: customInstructions || undefined
      }));

      const newOrder: Partial<Order> = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        items: orderItems,
        totalAmount: totalAmount,
        paymentStatus: payStatus,
        paymentMethod: method,
        paymentId: payId,
        status: 'Pending'
      };

      const resp = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order: newOrder,
          ...rzpParams 
        })
      });

      let data: any = {};
      if (resp.headers.get("content-type")?.includes("application/json")) {
        try {
          data = await resp.json();
        } catch (_) {}
      }

      if (resp.ok && data.success) {
        onOrderPlacement(data.order);
        onClearCart();
        setCustomInstructions('');
        setAppliedCoupon(null);
      } else {
        alert("Failed to submit active kitchen order: " + (data.error || `HTTP ${resp.status}`));
      }
    } catch (e) {
      console.error(e);
      alert("Communication error registering with order desks.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with clear counts */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#E8F5E9] p-2 rounded-xl text-[#1B4D3E]">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-black text-slate-800 text-base leading-none">Your Canteen Tray</h3>
            <span className="text-[11px] font-mono font-bold text-slate-400 mt-1 block uppercase">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 2. Cart Items or Blank State */}
      {cartItems.length === 0 ? (
        <div className="text-center py-10 space-y-4">
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto relative">
            {/* Swiggy Style Tray Illustration inside SVG */}
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#1B4D3E]">
              <path fill="currentColor" opacity="0.15" d="M20,65 C20,75 30,85 50,85 C70,85 80,75 80,65 L20,65 Z" />
              <circle cx="50" cy="40" r="12" fill="currentColor" opacity="0.3" />
              <rect x="25" y="60" width="50" height="6" rx="3" fill="currentColor" />
              <path stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M35,35 L45,45 M65,35 L55,45" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-[9px] font-black font-mono h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
              !
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-slate-800 text-sm">Your CampusBites Cart is Empty</h4>
            <p className="text-xs text-slate-400 max-w-[220px] mx-auto font-medium">Order food or essentials from your campus canteen.</p>
          </div>
          <button
            onClick={onExploreMenu}
            className="px-5 py-2.5 bg-[#1B4D3E] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#2E7D5A] transition-all cursor-pointer shadow-md inline-block"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Scrollable list of Items exactly like Swiggy */}
          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.foodItem.id} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex-1 text-left space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {/* Tiny veg/nonweg symbol */}
                    <span className={`w-2.5 h-2.5 border rounded-sm flex items-center justify-center p-[1px] ${
                      item.foodItem.tags?.includes('Vegetarian') || item.foodItem.category === 'Desserts' || item.foodItem.category === 'Beverages' || item.foodItem.id.includes('bev') ? 'border-emerald-500 bg-emerald-50/10' : 'border-rose-500 bg-rose-50/10'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        item.foodItem.tags?.includes('Vegetarian') || item.foodItem.category === 'Desserts' || item.foodItem.category === 'Beverages' || item.foodItem.id.includes('bev') ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    </span>
                    <h5 className="font-sans font-black text-slate-800 leading-tight text-xs">
                      {item.foodItem.name}
                    </h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {item.quantity} x ₹{item.foodItem.price}
                  </span>
                </div>
                
                {/* Micro Plus/Minus and grand price */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white text-xs h-7">
                    <button
                      onClick={() => onUpdateCart(item.foodItem, item.quantity - 1)}
                      className="px-2 h-full hover:bg-slate-50 font-black cursor-pointer text-[#1B4D3E]"
                    >
                      -
                    </button>
                    <span className="px-1 text-center font-mono font-black text-slate-700 select-none min-w-[14px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateCart(item.foodItem, item.quantity + 1)}
                      className="px-2 h-full hover:bg-slate-50 font-black cursor-pointer text-[#1B4D3E]"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono font-black text-slate-800 text-xs w-12 text-right">
                    ₹{item.foodItem.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Special Instructions panel */}
          <div className="space-y-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Special Instructions
            </span>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra sauce, don't boil..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full bg-white border border-slate-200 outline-none p-2 text-xs rounded-lg focus:border-[#1B4D3E]/50 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* 4. Swiggy coupon promo core */}
          <div className="space-y-2 text-left pt-1">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Apply Coupon Code
            </span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (e.g. CAMPUS20)"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                className="w-full bg-slate-50 border border-slate-200 outline-none px-3 py-2 text-xs rounded-lg uppercase font-mono font-bold tracking-widest text-slate-800"
              />
              <button
                type="submit"
                className="bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white text-[11px] font-black px-4 rounded-lg transition-all cursor-pointer uppercase"
              >
                Apply
              </button>
            </form>
            {appliedCoupon && (
              <div className="flex items-center justify-between text-[11px] bg-[#E8F5E9] text-[#1B4D3E] px-3 py-1.5 rounded-lg font-bold">
                <span>Code <strong>{appliedCoupon.code}</strong> applied</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">
                  [remove]
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-[10px] text-rose-500 font-bold">{couponError}</p>
            )}
          </div>

          {/* 5. Swiggy detailed bill breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-500 text-left">
            <div className="flex justify-between">
              <span className="font-medium text-slate-400">Tray Subtotal</span>
              <span className="font-mono font-bold text-slate-700">₹{subtotal}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Swiggy Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                <span className="font-mono">-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-black text-slate-800 border-t border-dashed border-slate-200 pt-3 mt-1.5 font-sans">
              <span>Total billable amount</span>
              <span className="font-mono text-base text-[#1B4D3E]">₹{totalAmount}</span>
            </div>
          </div>

          {/* 6. Checkout CTA Button with integrated processing */}
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Place Order & Pay
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Secure indicator with fine Razorpay branding */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4CAF50] opacity-60" />
            <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 opacity-60">
              Secured Checkout via <span className="text-[#002B49] bg-slate-100 py-0.5 px-1.5 rounded font-black italic">Razorpay</span>
            </p>
          </div>
        </div>
      )}

      {/* Razorpay Simulation Sandbox Overlaid Dialog */}
      {showRzpSimulator && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden text-left">
            
            {/* Header decoration matches college secondary dark green */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#2E7D5A]" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[8px] bg-[#2E7D5A] text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest leading-none">
                  Secure Intercept
                </span>
                <h4 className="text-base font-bold mt-2 text-white">Razorpay Secure Sandbox</h4>
              </div>
              <button 
                onClick={() => setShowRzpSimulator(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-slate-850 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-450 text-[11px]">
                  <span>Merchant</span>
                  <span className="text-white font-medium">CampusBites Hub (SPHN)</span>
                </div>
                <div className="flex justify-between text-slate-450 text-[11px]">
                  <span>Order ID</span>
                  <span className="text-white font-mono text-[9px] uppercase">{simulatedOrderId}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-white border-t border-slate-850 pt-2.5 mt-2.5">
                  <span>Amount due</span>
                  <span className="text-[#4CAF50] text-base font-mono">₹{simulatedAmount}</span>
                </div>
              </div>

              <div className="p-3 bg-[#E8F5E9]/5 border border-[#4CAF50]/15 rounded-xl text-slate-350 leading-normal">
                💡 No active Razorpay API Keys are configured in your `.env` file yet. We have securely intercepted the SDK to let you examine order pick-up workflows seamlessly.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleSimulatedPayment('Failed')}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-400 font-extrabold rounded-xl cursor-pointer active:scale-[0.98] transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleSimulatedPayment('Success')}
                  className="w-full py-3 bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white font-extrabold rounded-xl cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                >
                  Authorize
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 pt-2.5 border-t border-slate-850">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>PCI-DSS Secured Virtual Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Troubleshooter & Diagnostics Screen */}
      {rzpCredError && (
        <div id="rzp-troubleshooter" className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden my-8 text-left">
            <div className="bg-red-950/40 p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-sm">Razorpay Integration Center</h3>
                  <p className="text-[10px] text-slate-400">Authenticated keys diagnostics & developer help desk</p>
                </div>
              </div>
              <button 
                onClick={() => setRzpCredError(null)}
                className="text-slate-400 hover:text-white bg-slate-850 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 space-y-5 font-sans text-xs">
              <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl space-y-2">
                <p className="text-red-350 font-bold">Error: {rzpCredError.error}</p>
                <p className="text-slate-300 leading-relaxed">{rzpCredError.details}</p>
              </div>

              {/* Status Audit Analysis */}
              <div className="bg-slate-950/65 rounded-xl border border-slate-850 p-4 space-y-3">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Credential Deployment Audit</span>
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400">RAZORPAY_KEY_ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-300">{rzpCredError.diagnosis.keyIdMasked}</span>
                      {rzpCredError.diagnosis.isKeyIdConfigured ? (
                        rzpCredError.diagnosis.keyIdFormatValid ? (
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded">✔ Valid Prefix</span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-bold bg-amber-950/30 px-1.5 py-0.5 rounded">⚠ Invalid Prefix Format</span>
                        )
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold bg-red-950/30 px-1.5 py-0.5 rounded">✘ Empty</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400">RAZORPAY_KEY_SECRET</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-300">{rzpCredError.diagnosis.keySecretMasked}</span>
                      {rzpCredError.diagnosis.isKeySecretConfigured ? (
                        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded">✔ Configured</span>
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold bg-red-950/30 px-1.5 py-0.5 rounded">✘ Empty</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Diagnostics Guideline */}
              <div className="space-y-3 text-slate-300">
                <h4 className="text-xs font-bold text-slate-200">🛠️ How to configure details to make live payment work:</h4>
                <ul className="text-slate-400 list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
                  <li>
                    <strong>Get Both Credentials:</strong> Both credentials must be set in your platform environment. The <code className="text-blue-400 font-mono">RAZORPAY_KEY_ID</code> must have target format <code className="text-slate-400 font-mono">rzp_test_...</code> / <code className="text-slate-400 font-mono">rzp_live_...</code>.
                  </li>
                  <li>
                    <strong>App URL Check:</strong> Your platform is deployed at <code className="text-blue-400 break-all font-mono font-bold text-xs">https://ais-dev-a2yoctkjnbrie2ylzauvna-636748092027.asia-east1.run.app</code>. The webhook handles responses directly.
                  </li>
                </ul>
              </div>

              {/* Instant Actions Fallback */}
              <div className="border-t border-slate-850 pt-5 space-y-3">
                <p className="text-[11px] text-slate-400 italic">Don't want to configure live keys right now? Bypassing the gateway with the sandbox is 100% supported:</p>
                <div>
                  <button
                    onClick={() => {
                      setRzpCredError(null);
                      // Force local simulated fallback trigger
                      setSimulatedOrderId(`rzp_sim_${Math.random().toString(36).substring(2, 10)}`);
                      setSimulatedAmount(totalAmount);
                      setShowRzpSimulator(true);
                    }}
                    className="w-full py-3.5 bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white font-extrabold rounded-xl text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Bypass with Sandbox SDK
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
