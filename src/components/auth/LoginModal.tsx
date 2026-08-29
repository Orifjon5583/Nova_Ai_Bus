'use client';

import React, { useState } from 'react';
import { useSystem } from '../../lib/store';
import { Bus, Lock, Phone, UserCheck, KeyRound, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../../types/database';

export default function LoginModal() {
  const { login, users } = useSystem();
  
  const [phone, setPhone] = useState('+998905556677');
  const [password, setPassword] = useState('parent123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = login(phone, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Kirishda xatolik yuz berdi!');
    }
  };

  const handleQuickSelectUser = (userPhone: string, userPass: string) => {
    setPhone(userPhone);
    setPassword(userPass);
    login(userPhone, userPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl">
            <Bus className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nova Maktab Bus</h2>
          <p className="text-xs text-slate-500">Tizimga kirish uchun telefon raqam va parolingizni kiriting</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Telefon Raqam
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
                title={showPassword ? "Parolni berkitish" : "Parolni ko'rsatish"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-blue-500" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Tizimga Kirish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts Selection */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-500" />
            1-Bosishda Tezkor Kirish (Demo Hisoblar):
          </p>

          <div className="space-y-2">
            
            {/* Parent 1 */}
            <button
              onClick={() => handleQuickSelectUser('+998905556677', 'parent123')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-2xl transition flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700">Aziz Valiyev (Ota-ona)</span>
                <p className="text-[10px] text-slate-500">Tel: +998905556677 • Parol: parent123 (Farzand: Ali)</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold">Ota-ona</span>
            </button>

            {/* Parent 2 */}
            <button
              onClick={() => handleQuickSelectUser('+998906667788', 'parent123')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-2xl transition flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700">Nigora Tursunova (Ota-ona)</span>
                <p className="text-[10px] text-slate-500">Tel: +998906667788 • Parol: parent123 (Farzand: Madina)</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold">Ota-ona</span>
            </button>

            {/* Driver 1 */}
            <button
              onClick={() => handleQuickSelectUser('+998902223344', 'driver123')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-2xl transition flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700">Jasur Raximov (Haydovchi)</span>
                <p className="text-[10px] text-slate-500">Tel: +998902223344 • Parol: driver123 (Bus: 01 777 NVA)</p>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-bold">Haydovchi</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleQuickSelectUser('+998901112233', 'admin123')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-2xl transition flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700">Dilshod Karimov (Admin)</span>
                <p className="text-[10px] text-slate-500">Tel: +998901112233 • Parol: admin123 (Barcha boshqaruv)</p>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-bold">Admin</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
