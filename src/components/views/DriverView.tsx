'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../../lib/store';
import QRScannerModal from '../qr/QRScannerModal';
import FaceRecognitionModal from '../face/FaceRecognitionModal';
import BusMap from '../map/BusMap';
import { 
  Bus, QrCode, Camera, AlertOctagon, CheckCircle2, Phone, MapPin, 
  Navigation, UserCheck, ShieldAlert, Sparkles, RefreshCw, Sun, Moon, Ban, AlertTriangle, Smartphone, Compass
} from 'lucide-react';
import { TripType } from '../../types/database';

export default function DriverView() {
  const { 
    currentUser, drivers, students, tripStudents, busLocations, vehicles, confirmStudentPickup, 
    confirmSchoolArrival, startEveningTrip, confirmHomeArrival, triggerSOS, 
    toggleBusSimulation, updateBusLocationManually
  } = useSystem();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [activeTripType, setActiveTripType] = useState<TripType>('morning');
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string>('');

  const currentDriverObj = drivers.find(d => d.user_id === currentUser?.id) || drivers[0];
  const vehicle = vehicles.find(v => v.id === currentDriverObj.id) || vehicles[0];
  const busLoc = busLocations[vehicle.id] || busLocations[1];

  // Current route's students (Yunusobod Route: Ali, Madina, Jasur)
  const routeStudents = students.slice(0, 3);

  // Real Phone Geolocation Sensor Integration (navigator.geolocation)
  useEffect(() => {
    if (!isRealGpsActive) return;

    if (!('geolocation' in navigator)) {
      setGpsStatusMessage("Telefoningizda Geolocation sensori qo'llab-quvvatlanmaydi!");
      setIsRealGpsActive(false);
      return;
    }

    setGpsStatusMessage("Telefon GPS ulanmoqda...");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const speedKmH = speed ? Math.round(speed * 3.6) : Math.floor(Math.random() * 15) + 30;
        updateBusLocationManually(vehicle.id, latitude, longitude, speedKmH);
        setGpsStatusMessage(`Telefon GPS aktiv: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setGpsStatusMessage("Telefon GPS joylashuviga ruxsat berilmadi yoki qidirilmoqda...");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRealGpsActive, vehicle.id]);

  const handleScanCodeSuccess = (studentId: number, code: string) => {
    confirmStudentPickup(studentId, 'qr');
    setIsQrModalOpen(false);
  };

  const handleFaceSuccess = (studentId: number) => {
    confirmStudentPickup(studentId, 'face');
    setIsFaceModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 sm:p-6 space-y-4 sm:space-y-6">
      
      {/* Driver Header Card (Mobile Phone Driving Optimized) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border-2 border-indigo-400 shrink-0">
              <Bus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                {activeTripType === 'morning' ? (
                  <><Sun className="w-3.5 h-3.5 text-amber-400" /> ERTALABKI MARSHRUT</>
                ) : (
                  <><Moon className="w-3.5 h-3.5 text-indigo-300" /> KECHKI MARSHRUT</>
                )}
              </span>
              <h2 className="text-lg sm:text-2xl font-black">{currentUser?.first_name} {currentUser?.last_name}</h2>
              <p className="text-xs text-slate-300">Avtobus: <strong className="text-white">{vehicle.plate_number}</strong> • Sig'imi: {vehicle.capacity} kishi</p>
            </div>
          </div>

          {/* Trip Type Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTripType('morning')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTripType === 'morning' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" /> Ertalab
            </button>
            <button
              onClick={() => setActiveTripType('evening')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTripType === 'evening' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" /> Kechqurun
            </button>
          </div>
        </div>

        {/* Real Phone GPS & Simulation Controls */}
        <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRealGpsActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isRealGpsActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-xs">
                GPS Rejimi: <strong>{isRealGpsActive ? '📱 Telefon Real GPS Sensori' : '🔄 Avto Simulyatsiya'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Real Phone Geolocation Sensor */}
              <button
                onClick={() => {
                  setIsRealGpsActive(!isRealGpsActive);
                  if (busLoc?.isSimulating) toggleBusSimulation(vehicle.id);
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  isRealGpsActive 
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                {isRealGpsActive ? "GPS To'xtatish" : "📱 Telefon GPS Yoqish"}
              </button>

              {/* Simulation fallback button */}
              <button
                onClick={() => {
                  toggleBusSimulation(vehicle.id);
                  if (isRealGpsActive) setIsRealGpsActive(false);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {busLoc?.isSimulating ? "Simulyatsiyani To'xtatish" : "Simulyatsiya Yoqish"}
              </button>
            </div>

          </div>

          {gpsStatusMessage && (
            <p className="text-[11px] text-emerald-400 font-mono bg-slate-800/80 p-2 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
              <span>{gpsStatusMessage}</span>
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Route Change Alert Banner for Driver when Parent answers "Yo'q" */}
      {tripStudents.some(ts => ts.status === 'cancelled') && (
        <div className="bg-amber-500 text-slate-950 rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-amber-400 animate-in fade-in zoom-in duration-300 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-slate-950 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">📢 MARSHRUT O'ZGARDI (07:00 SO'ROVNOMA)</h4>
            <p className="text-xs font-semibold mt-1">
              Ota-ona 07:00 so'rovnomasida "Yo'q" deb javob berdi. O'quvchi bugun olib ketilmaydi. Avtobus marshrut chizig'i va bekatlar ro'yxati avtomatik qayta hisoblandi.
            </p>
          </div>
        </div>
      )}

      {/* Prominent Action Bar: QR Scan & Emergency SOS (Large Touch Targets for Mobile Driving) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Large QR Scan Button */}
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-3xl shadow-xl flex items-center justify-between group transition transform active:scale-95 border-2 border-blue-400/40"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">ASOSIY TASDIQLASH</span>
            <h3 className="font-extrabold text-base sm:text-xl">QR Kod Skaner qilish</h3>
            <p className="text-xs text-blue-100 mt-0.5">O'quvchini avtobusga olish / topshirish</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </button>

        {/* Large Face Recognition Button */}
        <button
          onClick={() => setIsFaceModalOpen(true)}
          className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-3xl shadow-xl flex items-center justify-between group transition transform active:scale-95 border-2 border-purple-400/40"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">QO'SHIMCHA USUL</span>
            <h3 className="font-extrabold text-base sm:text-xl">Yuz orqali Aniqlash</h3>
            <p className="text-xs text-purple-100 mt-0.5">Maxfiylik roziligi bilan taniyish</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </button>

      </div>

      {/* Prominent Emergency SOS Panic Button */}
      <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-black text-red-900 dark:text-red-200 text-base flex items-center justify-center sm:justify-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              FAVQULODDA HOLAT (SOS)
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300">YTH yoki favqulodda hodisa yuz berganda admin paneliga tezkor signal yuboradi</p>
          </div>
        </div>

        <button
          onClick={() => triggerSOS(101, 1, 1)}
          className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition border-2 border-red-400 flex items-center justify-center gap-2"
        >
          <AlertOctagon className="w-6 h-6" />
          <span>🚨 SOS TUGMASI</span>
        </button>
      </div>

      {/* Driver's Assigned Student List for Today */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              Bugungi Marshrut O'quvchilari ({routeStudents.length})
            </h3>
            <p className="text-xs text-slate-500">Ketma-ketlik bo'yicha olib ketiladigan o'quvchilar ro'yxati</p>
          </div>

          {activeTripType === 'morning' ? (
            <button
              onClick={() => confirmSchoolArrival(101)}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Maktabga Yetib Keldik
            </button>
          ) : (
            <button
              onClick={() => startEveningTrip(101)}
              className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Kechki Safarni Boshlash
            </button>
          )}
        </div>

        <div className="space-y-3">
          {routeStudents.map((st, index) => {
            const stState = tripStudents.find(ts => ts.student_id === st.id);
            const isPickedUp = stState?.status === 'picked_up';
            const isArrivedSchool = stState?.status === 'arrived_school';
            const isArrivedHome = stState?.status === 'arrived_home';
            const isCancelled = stState?.status === 'cancelled';

            return (
              <div 
                key={st.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isPickedUp || isArrivedSchool || isArrivedHome 
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                    : isCancelled
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-70'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                    {index + 1}
                  </div>
                  <img src={st.photo_url} alt={st.first_name} className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {st.first_name} {st.last_name}
                      </h4>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">
                        {st.class_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{st.address?.address_text}</span>
                    </p>
                    <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                      {st.primary_parent?.user?.phone} ({st.primary_parent?.user?.first_name})
                    </p>
                  </div>
                </div>

                {/* Individual Action Buttons for Driver (Full width on mobile) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  {isCancelled ? (
                    <span className="text-xs bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 w-full sm:w-auto">
                      <Ban className="w-4 h-4 text-slate-500" /> Bugun Olib Ketilmaydi
                    </span>
                  ) : activeTripType === 'morning' ? (
                    isPickedUp || isArrivedSchool ? (
                      <span className="text-xs bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 shadow w-full sm:w-auto">
                        <CheckCircle2 className="w-4 h-4" /> {isArrivedSchool ? 'Maktabda' : 'Uyidan Olindi'}
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmStudentPickup(st.id, 'manual')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Manual Tasdiqlash
                      </button>
                    )
                  ) : (
                    isArrivedHome ? (
                      <span className="text-xs bg-teal-600 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 w-full sm:w-auto">
                        <CheckCircle2 className="w-4 h-4" /> Uyiga Topshirildi
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmHomeArrival(st.id)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Uyiga Topshirildi
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Map Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600" />
          Marshrut Navigatsiyasi
        </h3>
        <BusMap 
          buses={[{ vehicle, lat: busLoc?.lat || 41.3490, lng: busLoc?.lng || 69.2815, speed: busLoc?.speed || 40 }]}
          students={routeStudents}
          center={[busLoc?.lat || 41.3490, busLoc?.lng || 69.2815]}
          zoom={13}
          height="300px"
        />
      </div>

      {/* QR & Face Modals */}
      <QRScannerModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        students={routeStudents}
        onScanSuccess={handleScanCodeSuccess}
      />

      <FaceRecognitionModal 
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        students={routeStudents}
        onFaceMatchSuccess={handleFaceSuccess}
      />

    </div>
  );
}
