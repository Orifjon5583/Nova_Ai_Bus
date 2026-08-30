'use client';

import React, { useState } from 'react';
import { useSystem } from '../../lib/store';
import { Phone, Lock, Eye, EyeOff, Bus, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { MOCK_USERS } from '../../lib/mock-data';

export default function LoginModal() {
  const { login } = useSystem();
  
  const [phone, setPhone] = useState('+998905556677');
  const [password, setPassword] = useState('parent123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const success = login(phone, password);
    if (!success) {
      setErrorMessage("Telefon raqami yoki parol noto'g'ri kiritildi!");
    }
  };

  const handleSelectQuickAccount = (phoneNum: string, pass: string) => {
    setPhone(phoneNum);
    setPassword(pass);
    setErrorMessage('');
    login(phoneNum, pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Glow Elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Header */}
        <div className="text-center space-y-2 relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30 border border-white/20">
            <Bus className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 pt-1">
            Nova Maktab Bus
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400">Tizimga kirish uchun telefon raqam va parolingizni kiriting</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Telefon Raqam
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                required
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-mono"
                placeholder="+998901234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-mono"
                placeholder="Parolingiz..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition"
                title={showPassword ? "Parolni berkitish" : "Parolni ko'rish"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-600/25 active:scale-95 transition flex items-center justify-center gap-2 border border-white/10"
          >
            <ShieldCheck className="w-4 h-4" />
            Tizimga Kirish
          </button>
        </form>

        {/* Quick Demo Account Selector (1-Click Login) */}
        <div className="border-t border-slate-800 pt-5 space-y-3 relative">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            Tezkor Demo Hisoblar (1-Click Demo)
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleSelectQuickAccount('+998905556677', 'parent123')}
              className="w-full p-3 bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">👨‍👩‍👧 Ota-ona (Aziz Valiyev)</span>
                <p className="text-[10px] text-slate-400 font-mono">+998905556677 • parent123</p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Ota-ona</span>
            </button>

            <button
              onClick={() => handleSelectQuickAccount('+998906667788', 'parent123')}
              className="w-full p-3 bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">👩‍👧 Ota-ona (Nigora Tursunova)</span>
                <p className="text-[10px] text-slate-400 font-mono">+998906667788 • parent123</p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Ota-ona</span>
            </button>

            <button
              onClick={() => handleSelectQuickAccount('+998902223344', 'driver123')}
              className="w-full p-3 bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition">🚌 Haydovchi (Jasur Raximov)</span>
                <p className="text-[10px] text-slate-400 font-mono">+998902223344 • driver123</p>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">Haydovchi</span>
            </button>

            <button
              onClick={() => handleSelectQuickAccount('+998901112233', 'admin123')}
              className="w-full p-3 bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition">🏫 Maktab Admini (Dilshod Karimov)</span>
                <p className="text-[10px] text-slate-400 font-mono">+998901112233 • admin123</p>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">Admin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
