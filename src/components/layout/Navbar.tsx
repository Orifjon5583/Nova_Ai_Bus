'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../../lib/store';
import { UserRole } from '../../types/database';
import { 
  Bus, Shield, User, Bell, ChevronDown, CheckCircle, AlertTriangle, 
  MapPin, Clock, Phone, Smartphone, Monitor, ShieldAlert, LogOut, KeyRound, UserCheck
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

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    parent: { label: 'Ota-ona', bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400' },
    driver: { label: 'Haydovchi', bg: 'bg-indigo-500/20 border-indigo-500/40', text: 'text-indigo-400' },
    admin: { label: 'Maktab Admini', bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400' }
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-lg" suppressHydrationWarning>
      
      {/* Active SOS Warning Bar if emergency exists and user is admin */}
      {activeEmergency && role === 'admin' && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>🚨 FAVQULODDA SOS OGOHLANTIRISH: Avtobus haydovchisi Jasur Raximov SOS tugmasini bosdi!</span>
          </div>
          <span className="bg-white text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase shadow">
            Admin Paneli
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              Nova Maktab Bus
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Xususiy maktab xavfsiz transport tizimi</p>
          </div>
        </div>

        {/* Right side: Logged in User Profile & Logout Button */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-800/90 px-3.5 py-1.5 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                {currentUser.first_name[0]}
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white leading-tight">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleBadges[currentUser.role].bg} ${roleBadges[currentUser.role].text}`}>
                    {roleBadges[currentUser.role].label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Tel: {currentUser.phone}
                </p>
              </div>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                title="Bildirishnomalar"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      Bildirishnomalar ({notifications.length})
                    </h4>
                    <span className="text-xs text-blue-600 font-semibold">{unreadCount} yangi</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">Hozircha xabarlar yo'q</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                            !n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition border border-red-500/30 flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            Tizimga kirilmagan
          </div>
        )}

      </div>
    </header>
  );
}
