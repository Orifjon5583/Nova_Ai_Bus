'use client';

import React, { useState } from 'react';
import { Camera, X, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Student } from '../../types/database';

interface FaceRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onFaceMatchSuccess: (studentId: number) => void;
}

export default function FaceRecognitionModal({ isOpen, onClose, students, onFaceMatchSuccess }: FaceRecognitionModalProps) {
  const [hasParentConsent, setHasParentConsent] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);

  if (!isOpen) return null;

  const handleSimulateFaceMatch = (student: Student) => {
    if (!hasParentConsent) return;
    setAnalyzing(true);
    setMatchedStudent(null);

    setTimeout(() => {
      setAnalyzing(false);
      setMatchedStudent(student);
      onFaceMatchSuccess(student.id);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Yuz orqali Aniqlash (Biometrik)</h3>
              <p className="text-xs text-purple-100">Maxfiylik roziligi asosida o'quvchi yuzini aniqlash</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Privacy Consent Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3.5 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 dark:text-purple-200">
              <p className="font-semibold">Ota-ona maxfiylik roziligi talabi</p>
              <p className="mt-0.5 opacity-90">Ushbu biometrik yuzni aniqlash tizimi faqat ota-ona tomonidan tasdiqlangan maxfiylik kelishuvi asosida ishlaydi.</p>
              <label className="flex items-center gap-2 mt-2 font-medium cursor-pointer text-purple-800 dark:text-purple-300">
                <input 
                  type="checkbox" 
                  checked={hasParentConsent} 
                  onChange={(e) => setHasParentConsent(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Ota-onaning biometrik roziligi mavjud</span>
              </label>
            </div>
          </div>

          {/* Camera Frame View */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 min-h-[220px] flex flex-col items-center justify-center border-2 border-indigo-500/30">
            {analyzing ? (
              <div className="flex flex-col items-center gap-3 text-white">
                <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
                <p className="text-xs font-semibold text-purple-200">Yuz chizgilari skaner qilinmoqda...</p>
                <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 animate-pulse w-full" />
                </div>
              </div>
            ) : matchedStudent ? (
              <div className="flex flex-col items-center text-center p-4 text-white">
                <img 
                  src={matchedStudent.photo_url} 
                  alt={matchedStudent.first_name} 
                  className="w-20 h-20 rounded-full border-4 border-emerald-500 object-cover shadow-lg mb-2"
                />
                <h4 className="font-bold text-lg text-emerald-400">{matchedStudent.first_name} {matchedStudent.last_name}</h4>
                <p className="text-xs text-slate-300">Moslik: 99.4% • {matchedStudent.class_name}</p>
              </div>
            ) : (
              <div className="text-center p-4 text-slate-400 text-xs">
                <Camera className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p>Kamerani o'quvchi yuziga to'g'rilang</p>
              </div>
            )}
          </div>

          {/* Simulator options for testing */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-500" />
              Yuz orqali aniqlash test qilish:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {students.map(s => (
                <button
                  key={s.id}
                  disabled={!hasParentConsent}
                  onClick={() => handleSimulateFaceMatch(s)}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-xl transition text-left disabled:opacity-50"
                >
                  <img src={s.photo_url} alt={s.first_name} className="w-9 h-9 rounded-full object-cover border" />
                  <div>
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{s.first_name} {s.last_name}</p>
                    <p className="text-[10px] text-purple-600 font-medium">Yuzni aniqlash</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
