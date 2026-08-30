'use client';

import React, { useEffect, useState } from 'react';
import { QrCode, X, CheckCircle2, Camera, UserCheck } from 'lucide-react';
import { Student } from '../../types/database';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onScanSuccess: (studentId: number, code: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, students, onScanSuccess }: QRScannerModalProps) {
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    let scannerInstance: any = null;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      try {
        scannerInstance = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerInstance.render(
          (decodedText: string) => {
            handleDetectedCode(decodedText);
          },
          (error: any) => {
            // Ignore background frame noise
          }
        );
      } catch (e) {
        console.warn("Camera scanner fallback active");
      }
    }).catch(err => {
      console.warn("Html5Qrcode dynamic import failed, fallback simulator available", err);
    });

    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch((err: any) => console.error("Failed to clear scanner", err));
      }
    };
  }, [isOpen]);

  const handleDetectedCode = (code: string) => {
    const matchedStudent = students.find(s => s.qr_code === code || s.student_code === code);
    if (matchedStudent) {
      setLastScannedStudent(matchedStudent);
      setScanMessage(`${matchedStudent.first_name} ${matchedStudent.last_name} tasdiqlandi!`);
      onScanSuccess(matchedStudent.id, code);

      setTimeout(() => {
        setLastScannedStudent(null);
        setScanMessage('');
      }, 3500);
    } else {
      setScanMessage(`Noma'lum QR kod: ${code}`);
      setTimeout(() => setScanMessage(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">O'quvchi QR Skaneri</h3>
              <p className="text-xs text-blue-100">Kamerani QR kodga qarating yoki tezkor tanlang</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Banner */}
          {lastScannedStudent && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl flex items-center gap-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  {lastScannedStudent.first_name} {lastScannedStudent.last_name}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {lastScannedStudent.class_name} • Muvaffaqiyatli tasdiqlandi!
                </p>
              </div>
            </div>
          )}

          {scanMessage && !lastScannedStudent && (
            <div className="bg-amber-50 text-amber-900 text-xs font-semibold p-3 rounded-xl border border-amber-200 text-center">
              {scanMessage}
            </div>
          )}

          {/* Camera View Area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[220px] flex flex-col items-center justify-center">
            <div id="qr-reader" className="w-full text-white text-xs" />
          </div>

          {/* Fallback Simulator for quick manual testing without webcam */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              Tezkor Test uchun QR Skaner simulyatori:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleDetectedCode(s.qr_code)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {s.first_name[0]}
                    </span>
                    <div>
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-slate-500">{s.student_code}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
                    Scan QR
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
