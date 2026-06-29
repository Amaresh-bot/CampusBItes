import React, { useRef } from 'react';
import { CheckCircle2, Receipt, Package, Clock, CreditCard, QrCode, Download, ArrowRight, Star } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationProps {
  order: Order;
  onTrackOrder: () => void;
  onDismiss: () => void;
}

export function OrderConfirmation({ order, onTrackOrder, onDismiss }: OrderConfirmationProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank', 'width=480,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusBites Receipt - ${order.tokenNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; padding: 20px; max-width: 380px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
            .header h1 { font-size: 20px; font-weight: 900; letter-spacing: 2px; }
            .header p { font-size: 10px; margin-top: 2px; }
            .section { margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .label { color: #555; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-size: 16px; font-weight: 900; }
            .token { text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 4px; border: 2px solid #000; padding: 8px; margin: 12px 0; }
            .footer { text-align: center; font-size: 10px; color: #555; margin-top: 12px; }
            .item-row { display: flex; justify-content: space-between; padding: 3px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CAMPUSBITES</h1>
            <p>Sphoorthy Engineering College Canteen</p>
            <p>Block B Dining Hall · campusbites.in</p>
          </div>
          <div class="section">
            <div class="row"><span class="label">Receipt No:</span><span>#${order.tokenNumber || order.id?.slice(-6)}</span></div>
            <div class="row"><span class="label">Date:</span><span>${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div class="row"><span class="label">Time:</span><span>${new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div class="row"><span class="label">Customer:</span><span>${order.userName}</span></div>
            <div class="row"><span class="label">Payment:</span><span>${order.paymentMethod || 'Razorpay'} · ${order.paymentStatus}</span></div>
          </div>
          <div class="divider"></div>
          <div class="section">
            ${order.items.map(item => `
              <div class="item-row">
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="row total"><span>TOTAL</span><span>₹${order.totalAmount.toFixed(2)}</span></div>
          <div class="token">${order.tokenNumber || 'TOKEN'}</div>
          <div class="footer">
            <p>Show this token at the counter for pickup.</p>
            <p>Thank you for ordering from CampusBites! 🍽️</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Approved: 'bg-blue-100 text-blue-700 border-blue-200',
    Preparing: 'bg-orange-100 text-orange-700 border-orange-200',
    'Ready for Pickup': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Completed: 'bg-green-100 text-green-700 border-green-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-[#1B4D3E] to-[#2D6B58] p-6 text-white text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
              <CheckCircle2 className="w-9 h-9 text-white fill-white/30" />
            </div>
            <h2 className="font-black text-2xl tracking-tight">Order Confirmed!</h2>
            <p className="text-white/75 text-xs font-medium mt-1">Your order has been placed successfully</p>
          </div>

          {/* Token Number - prominent display */}
          <div className="mt-4 bg-white/15 border border-white/30 rounded-2xl p-3 backdrop-blur-sm relative">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Your Pickup Token</p>
            <p className="font-black text-3xl tracking-widest font-mono text-white">
              {order.tokenNumber || order.id?.slice(-6).toUpperCase() || 'PENDING'}
            </p>
            <p className="text-white/60 text-[9px] mt-1 font-medium">Show this at the counter</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div ref={receiptRef} className="p-5 space-y-4 max-h-96 overflow-y-auto">
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Order ID</p>
              <p className="font-mono font-black text-slate-800 text-xs mt-0.5">
                #{order.id?.slice(-8).toUpperCase() || '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Status</p>
              <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {order.status}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Date & Time</p>
              <p className="font-bold text-slate-700 text-xs mt-0.5">
                {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                {' · '}
                {new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Payment</p>
              <p className="font-bold text-slate-700 text-xs mt-0.5 capitalize">{order.paymentMethod || 'Razorpay'}</p>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Items Ordered
              </p>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
                  <div>
                    <p className="font-black text-slate-800">{item.name}</p>
                    <p className="text-slate-400 font-medium text-[10px]">×{item.quantity} @ ₹{item.price}</p>
                  </div>
                  <span className="font-mono font-black text-slate-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">Total Paid</span>
              <span className="font-mono font-black text-[#1B4D3E] text-base">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Placeholder */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1B4D3E]/10 rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8 text-[#1B4D3E]" />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-800 text-xs">QR Verification</p>
              <p className="text-slate-500 text-[10px] font-medium mt-0.5">Show your token <span className="font-black text-[#1B4D3E]">{order.tokenNumber}</span> to the canteen staff at pickup.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 space-y-2.5">
          <button
            onClick={onTrackOrder}
            className="w-full py-3.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            Track Your Order
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
            <button
              onClick={onDismiss}
              className="py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>

        {/* Canteen Info Footer */}
        <div className="px-5 pb-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            CampusBites · Sphoorthy Engineering College, Hyderabad
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[9px] text-slate-400 font-medium ml-1">Rate your meal after pickup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
