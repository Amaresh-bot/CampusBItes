import React, { memo } from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';
import { StudentProfile } from '../types';
import { getAvatarEmoji } from '@/lib/utils';

interface ProfileTabProps {
  user: { id: string; name: string; email: string; role: 'customer' | 'admin' };
  studentProfile: StudentProfile | null;
  isProfileLoading: boolean;
  onEditProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const ProfileTab = memo(function ProfileTab({
  user,
  studentProfile,
  isProfileLoading,
  onEditProfile,
  onOpenAdmin,
  onLogout,
}: ProfileTabProps) {
  return (
    <motion.div
      key="profile-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className="p-4 bg-slate-50 min-h-[75vh] space-y-4"
    >
      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 bg-[#1B4D3E]/10 rounded-xl flex items-center justify-center border border-[#1B4D3E]/10 text-[#1B4D3E]">
            <span className="text-xl select-none">{getAvatarEmoji(studentProfile?.fullName || user.name)}</span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-950 text-sm">Canteen User Profile</h4>
            <p className="text-slate-400 text-[11px]">Manage your food delivery details</p>
          </div>
        </div>

        {isProfileLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-12 animate-pulse" />
            ))}
          </div>
        ) : studentProfile ? (
          <div className="space-y-3 font-sans">
            <ProfileField label="Your Full Name" value={studentProfile.fullName} />
            <ProfileField label="Verified Email Address" value={studentProfile.email || user.email} mono={false} breakAll />
            <ProfileField label="Contact Mobile Number" value={studentProfile.contactNo} mono />

            <button
              onClick={onEditProfile}
              className="w-full py-2.5 bg-[#1B4D3E] hover:bg-[#2E7D5A] active:scale-95 text-white font-bold rounded-xl transition-all cursor-pointer text-center text-xs"
            >
              Modify Profile Details
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-slate-500 font-medium text-xs">No profile found. Set up your profile to order food.</p>
            <button
              onClick={onEditProfile}
              className="bg-[#1B4D3E] text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 cursor-pointer transition-all"
            >
              Set Up My Profile Now
            </button>
          </div>
        )}
      </div>

      {/* Account Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-3 text-left">
        <h3 className="font-bold text-slate-950 text-sm">Account Settings</h3>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Logged in as{' '}
          <strong className="text-slate-600 font-mono">{user.email}</strong>
          {' '}• Access level:{' '}
          <strong className="capitalize text-[#1B4D3E]">{user.role}</strong>
        </p>

        <div className="flex gap-2 pt-2 flex-wrap">
          {user.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex-1 py-2.5 border border-slate-200 bg-slate-50 text-slate-800 text-center rounded-xl font-bold cursor-pointer hover:bg-slate-100 text-xs"
            >
              Open Admin Box (PC view)
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-center cursor-pointer border border-red-100 hover:bg-red-100 text-xs"
          >
            Log Out Session
          </button>
        </div>
      </div>
    </motion.div>
  );
});

function ProfileField({
  label,
  value,
  mono = false,
  breakAll = false,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
  breakAll?: boolean;
}) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
      <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
        {label}
      </span>
      <strong className={`text-slate-900 text-xs ${mono ? 'font-mono' : ''} ${breakAll ? 'break-all' : ''}`}>
        {value || '—'}
      </strong>
    </div>
  );
}
