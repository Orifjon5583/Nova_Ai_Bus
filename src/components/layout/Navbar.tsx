'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../../lib/store';
import { UserRole } from '../../types/database';
import { 
  Bus, Shield, User, Bell, ChevronDown, CheckCircle, AlertTriangle, 
  MapPin, Clock, Phone, Smartphone, Monitor, ShieldAlert, LogOut, KeyRound, UserCheck, Sparkles, Check, Navigation, Map
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, role, logout, notifications, emergencyAlerts, markNotificationRead } = useSystem();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const activeEmergency = emergencyAlerts.find(e => e.status === 'active');

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    parent: { label: 'Ota-ona Portali', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    driver: { label: 'Haydovchi Paneli', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    admin: { label: 'Maktab Admini', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-white/10 shadow-2xl transition-all" suppressHydrationWarning>
      
      {/* Active SOS Warning Bar if emergency exists and user is admin */}
      {activeEmergency && role === 'admin' && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-4 py-2.5 text-xs font-black flex items-center justify-between animate-pulse shadow-inner">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            <span>🚨 FAVQULODDA SOS HAMLA: Avtobus #{activeEmergency.vehicle_id} haydovchisi favqulodda signal yoqdi!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-white/20">
            <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                Nova Maktab Bus
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intellektual Transport Boshqaruv Tizimi</p>
          </div>
        </div>

        {/* User Profile, Role & Actions */}
        {mounted && currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Live Map Page Navigation Link */}
            <a
              href="/map"
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/30 border border-white/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jonli Xarita</span>
            </a>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-white/10 transition shadow-inner"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-950 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      Bildirishnomalar ({notifications.length})
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} yangi
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-center py-6">Bildirishnomalar mavjud emas</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer ${
                            n.is_read ? 'bg-slate-800/40 border-slate-800/80 text-slate-400' : 'bg-indigo-950/40 border-indigo-500/40 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-xs">{n.title}</h5>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{n.message}</p>
                          <span className="text-[9px] text-slate-500 mt-1.5 block">
                            {new Date(n.sent_at || n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info & Logout */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-white/10 p-1.5 pl-3 rounded-2xl shadow-inner">
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-bold text-xs text-white">{currentUser.first_name} {currentUser.last_name}</span>
                </div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadges[role].bg} ${roleBadges[role].text} ${roleBadges[role].border}`}>
                  {roleBadges[role].label}
                </span>
              </div>

              {/* Explicit Logout Button (Required for Account Switching) */}
              <button
                onClick={logout}
                title="Tizimdan chiqish"
                className="px-3 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Tizimga kirilmagan</span>
          </div>
        )}

      </div>
    </header>
  );
}
