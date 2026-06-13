import React, { useState } from 'react';
import { Clock, CheckCircle2, RefreshCw, XSquare, MessageSquare, AlertCircle, Sparkles, MapPin, ChefHat, Check, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, OrderStatus } from '../types';

interface OrderProgressProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onRefresh: () => void;
  onGoToMenu?: () => void;
}

export function OrderProgress({ orders, onCancelOrder, onRefresh, onGoToMenu }: OrderProgressProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    onRefresh();
    setTimeout(() => setIsSyncing(false), 900);
  };

  const getStatusLabelText = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'Awaiting Approval';
      case 'Approved': return 'Canteen Accepted';
      case 'Preparing': return 'Kitchen Cooking';
      case 'Ready for Pickup': return 'Ready at Counter!';
      case 'Completed': return 'Order Collected';
      case 'Cancelled': return 'Cancelled / Refunded';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Preparing':
        return 'bg-[#E8F5E9] text-[#1B4D3E] border-[#4CAF50]/20 animate-pulse';
      case 'Ready for Pickup':
        return 'bg-emerald-500 text-white border-emerald-500 font-extrabold shadow-sm';
      case 'Completed':
        return 'bg-slate-50 text-slate-400 border-slate-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  // Convert Swiggy Stepper steps (Placed -> Cooking -> Ready -> Collected)
  const getStepperStep = (status: OrderStatus): number => {
    if (status === 'Pending' || status === 'Approved') return 1;
    if (status === 'Preparing') return 2;
    if (status === 'Ready for Pickup') return 3;
    if (status === 'Completed') return 4;
    return 0; // Cancelled
  };

  return (
    <div id="order-progress" className="space-y-6 text-left">
      
      {/* 1. Header with manual synchronization trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-slate-100 rounded-3xl shadow-xs gap-3">
        <div>
          <h3 className="font-display font-black text-slate-800 text-lg">Live Order Tracking</h3>
          <p className="text-xs text-slate-400 font-medium">Follow your wholesome SPHN kitchen preparations in real-time.</p>
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#2E7D5A] active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          Track Status
        </button>
      </div>

      {/* 2. No Orders Tracking state */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-slate-800 text-sm">No Trackable Tickets Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Place delicious meals or stationery items from the primary cafeteria menu to track execution steps here!</p>
          </div>
          <button
            onClick={onGoToMenu}
            className="px-5 py-2.5 bg-[#1B4D3E] text-white font-black text-xs rounded-xl hover:bg-[#2E7D5A] transition-all cursor-pointer"
          >
            Explore Interactive Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const stepperIndex = getStepperStep(order.status);
            const isCancelled = order.status === 'Cancelled';
            const approxWait = order.status === 'Pending' ? '12 mins' : order.status === 'Approved' ? '10 mins' : order.status === 'Preparing' ? '7 mins' : 'Ready!';
            const tokenFormatted = order.tokenNumber || `A-${10 + (idx % 80)}`;

            return (
              <div 
                key={order.id} 
                className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden space-y-6"
              >
                {/* Visual Status Indicator background bubble */}
                {order.status === 'Ready for Pickup' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CAF50]/5 rounded-full filter blur-2xl" />
                )}

                {/* Info summary header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">ORDER CODE #{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${getStatusColor(order.status)}`}>
                        {getStatusLabelText(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Via {order.paymentMethod.toUpperCase()}</p>
                  </div>

                  {/* Token ticket layout exactly like Swiggy */}
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1B4D3E] text-white rounded-xl px-4 py-2 text-center border border-[#143B2F] shrink-0">
                      <span className="block text-[8px] uppercase tracking-widest text-[#E8F5E9] font-black leading-none">Token Ticket</span>
                      <span className="text-lg font-mono font-black mt-1 block tracking-tight leading-none text-white">
                        {tokenFormatted}
                      </span>
                    </div>

                    {!isCancelled && order.status === 'Pending' && (
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="text-xs text-red-650 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold border border-red-200"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Swiggy Modern Pipeline Stepper UI */}
                {!isCancelled && stepperIndex > 0 && (
                  <div className="py-4">
                    {/* Stepper track */}
                    <div className="relative">
                      {/* Grey bar behind */}
                      <div className="absolute h-1 bg-slate-100 inset-x-8 top-3.5 -z-10 rounded-full" />
                      {/* Active green tracking line */}
                      <div 
                        className="absolute h-1 bg-[#4CAF50] inset-y-0 left-8 -z-10 transition-all duration-1000 rounded-full"
                        style={{ width: `${Math.min(100, ((stepperIndex - 1) / 3) * 85)}%` }}
                      />

                      <div className="grid grid-cols-4 text-center">
                        {['Placed', 'Cooking', 'Ready', 'Collected'].map((step, sIdx) => {
                          const stepNumber = sIdx + 1;
                          const isDone = stepNumber < stepperIndex;
                          const isActive = stepNumber === stepperIndex;
                          
                          let iconItem = <Check className="w-3.5 h-3.5" />;
                          if (step === 'Cooking') iconItem = <ChefHat className="w-3.5 h-3.5" />;

                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                                isActive ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white scale-115 shadow-md font-bold' :
                                isDone ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B4D3E] font-bold' :
                                'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isDone ? (
                                  <Check className="w-4 h-4 text-[#4CAF50] stroke-[3]" />
                                ) : (
                                  <span className="text-xs font-black">{stepNumber}</span>
                                )}
                              </div>
                              <span className={`text-[11px] mt-2.5 font-bold tracking-tight ${
                                isActive ? 'text-[#1B4D3E] font-black' : isDone ? 'text-slate-700' : 'text-slate-400'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Swiggy Estimated Waiting details */}
                {!isCancelled && stepperIndex < 3 && (
                  <div className="flex items-center gap-3 bg-[#E8F5E9] p-3.5 rounded-2xl border border-[#4CAF50]/15 text-xs text-[#1B4D3E] font-medium font-sans">
                    <Clock className="w-4 h-4 text-[#4CAF50] animate-spin" style={{ animationDuration: '4s' }} />
                    <span>
                      Preparation estimated wait time: <strong>{approxWait}</strong>. Don't worry, your food is freshly prepped.
                    </span>
                  </div>
                )}

                {/* Cancelled state notification */}
                {isCancelled && (
                  <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100 text-xs text-red-600 font-bold font-sans">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      This order was cancelled. Any online Razorpay balance has been refunded back to your transaction account.
                    </span>
                  </div>
                )}

                {/* Items list details */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Basket details
                  </span>
                  <div className="divide-y divide-slate-100 text-xs text-left">
                    {order.items.map(item => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center gap-4">
                        <div className="flex-1 space-y-0.5">
                          <span className="font-extrabold text-slate-800 text-xs block">{item.name} <span className="text-[#1B4D3E] font-black ml-1">x{item.quantity}</span></span>
                          {item.customInstructions && (
                            <span className="inline-block text-[10px] bg-[#E8F5E9] text-[#1B4D3E] font-bold px-2 py-0.5 rounded border border-[#4CAF50]/10 mt-1">
                              Note: {item.customInstructions}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-black text-slate-700">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-3.5 mt-2 flex justify-between items-center font-bold text-slate-900 border-t border-dashed border-slate-200">
                      <span className="uppercase text-[9px] text-slate-400 tracking-wider font-mono">Invoice Amount</span>
                      <span className="text-[#1B4D3E] font-mono font-black text-base">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Location pin tag */}
                <div className="flex items-center gap-2 text-xs text-slate-450 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  <span>Pickup counter location: <strong>Block B Dining Canteen counter, Main Campus</strong>.</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
