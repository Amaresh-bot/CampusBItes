import React, { useState } from 'react';
import { Bell, Check, Mail, AlertTriangle, ShieldAlert, Sparkles, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemNotification } from '../types';

interface NotificationsDrawerProps {
  notifications: SystemNotification[];
  onMarkRead: (notifId: string) => void;
  onClearAll: () => void;
}

export function NotificationsDrawer({
  notifications,
  onMarkRead,
  onClearAll
}: NotificationsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'emails'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100"><CheckCircle2 className="w-4 h-4" /></div>;
      case 'alert':
        return <div className="w-8 h-8 rounded-full bg-red-50 text-red-605 text-red-650 flex items-center justify-center shrink-0 border border-red-100"><AlertTriangle className="w-4 h-4 text-red-600" /></div>;
      case 'email':
        return <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center shrink-0 border border-blue-100"><Mail className="w-4 h-4 text-blue-600" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200"><Bell className="w-4 h-4" /></div>;
    }
  };

  const filteredNotifs = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === 'email');

  return (
    <div id="notif-drawer-component" className="relative">
      {/* Visual Indicator Bell Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl text-slate-700 hover:text-black hover:bg-slate-100/50 cursor-pointer active:scale-95 transition-all outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-mono leading-none flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Overlay Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-all"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification panel card */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-900" />
                  <h4 className="font-sans font-bold text-slate-950 text-sm">Canteen Communication Box</h4>
                </div>
                
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-[10px] uppercase font-bold text-slate-450 hover:text-black cursor-pointer"
                    >
                      Sweep All
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-605"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-tabs selector for system alerts vs. dispatched emails */}
              <div className="grid grid-cols-2 text-center text-xs border-b border-slate-100 bg-white">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-3 font-semibold border-b-2 cursor-pointer ${
                    activeTab === 'all' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  System Logs ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`py-3 font-semibold border-b-2 cursor-pointer ${
                    activeTab === 'emails' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Dispatched Mail Confirms
                </button>
              </div>

              {/* Lists */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-16 text-slate-450 text-xs italic space-y-2">
                    <p>Canteen inbox is peaceful!</p>
                    <p className="text-[11px] text-slate-400 font-sans">Submit orders to trigger automated dispatcher alerts here.</p>
                  </div>
                ) : (
                  filteredNotifs.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-3.5 rounded-xl border flex gap-3.5 items-start transition-all relative ${
                        notif.read ? 'bg-white border-slate-150 opacity-75' : 'bg-slate-50/70 border-slate-200 shadow-3xs'
                      }`}
                    >
                      {getNotifIcon(notif.type)}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-slate-900 leading-snug text-xs truncate">{notif.title}</h5>
                          {!notif.read && (
                            <button
                              onClick={() => onMarkRead(notif.id)}
                              className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer shrink-0"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed text-slate-600 font-sans ${notif.type === 'email' ? 'bg-blue-50/40 p-2.5 rounded-lg border border-blue-105 border-blue-100/50 text-[10.5px] font-mono break-all' : ''}`}>
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono tracking-wider block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom legal text */}
              <div className="p-4 border-t border-slate-150 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Simulated campus SMS-push & SMTP systems active</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
