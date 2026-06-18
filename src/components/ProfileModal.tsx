import React, { useState } from 'react';
import { User, Mail, Phone, Check, X, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { StudentProfile } from '../types';

interface ProfileModalProps {
  initialProfile?: StudentProfile;
  userEmail: string;
  defaultName: string;
  onSave: (profile: StudentProfile) => void;
  onClose?: () => void;
  forceComplete?: boolean;
}

export function ProfileModal({
  initialProfile,
  userEmail,
  defaultName,
  onSave,
  onClose,
  forceComplete = false
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(initialProfile?.fullName || defaultName);
  const [contactNo, setContactNo] = useState(initialProfile?.contactNo || '');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.fullName || defaultName);
      setContactNo(initialProfile.contactNo || '');
    }
  }, [initialProfile, defaultName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactNo.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (contactNo.length !== 10) {
      setError("Please enter a valid 10-digit mobile contact number.");
      return;
    }

    setError(null);
    onSave({
      fullName: fullName.trim(),
      rollNo: initialProfile?.rollNo,
      branch: initialProfile?.branch,
      year: initialProfile?.year,
      contactNo: contactNo.trim(),
      email: userEmail || initialProfile?.email || '',
      collegeName: "Spoorthy Engineering College"
    });
  };

  return (
    <div id="profile-container" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto relative"
      >
        {onClose && (
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col mb-6">
          <div className="w-12 h-12 bg-[#E8F5E9] text-swiggy-orange rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-[#C8E6C9]">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-black text-slate-950 text-xl tracking-tight">
            My Profile Details
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Manage your canteen access credentials and delivery contact details.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100/50 text-red-650 text-xs p-3.5 rounded-xl border border-red-200/50 font-sans font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black focus:bg-white transition-all text-slate-900 font-medium"
                placeholder="Your Full Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
              Email Address (Verified Account)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                disabled
                value={userEmail || initialProfile?.email || ''}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-100 border border-slate-200 outline-none rounded-xl text-slate-500 font-medium cursor-not-allowed"
                placeholder="Verified email address"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified account email address
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="tel"
                required
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-black focus:bg-white transition-all text-slate-900 font-bold font-mono"
                placeholder="e.g. 9876543210"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-98"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-swiggy-orange hover:bg-swiggy-orange-hover text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save Profile View
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
