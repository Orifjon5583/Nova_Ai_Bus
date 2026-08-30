'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../../lib/store';
import QRScannerModal from '../qr/QRScannerModal';
import FaceRecognitionModal from '../face/FaceRecognitionModal';
import BusMap from '../map/BusMap';
import { 
  Bus, QrCode, Camera, AlertOctagon, CheckCircle2, Phone, MapPin, 
  Navigation, UserCheck, ShieldAlert, Sparkles, RefreshCw, Sun, Moon, Ban, AlertTriangle, Smartphone, Compass,
  CornerUpRight, CornerUpLeft, ArrowUp, Volume2, VolumeX, ChevronDown, ChevronUp, Route, Gauge
} from 'lucide-react';
import { TripType } from '../../types/database';
import { ROUTE_NAVIGATION_STEPS, NavigationManeuver } from '../../lib/mock-data';

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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showAllTurns, setShowAllTurns] = useState(false);

  const currentDriverObj = drivers.find(d => d.user_id === currentUser?.id) || drivers[0];
  const vehicle = vehicles.find(v => v.id === currentDriverObj.id) || vehicles[0];
  const busLoc = busLocations[vehicle.id] || busLocations[1];

  // Current route's students (Yunusobod Route: Ali, Madina, Jasur)
  const routeStudents = students.slice(0, 3);
  const navSteps = ROUTE_NAVIGATION_STEPS[1] || [];

  // Determine current active navigation maneuver step based on bus location
  const [currentManeuverIndex, setCurrentManeuverIndex] = useState(3);
  const currentManeuver = navSteps[currentManeuverIndex] || navSteps[0];
  const nextManeuver = navSteps[currentManeuverIndex + 1] || navSteps[navSteps.length - 1];

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
        setGpsStatusMessage("Telefon GPS joylashuviga ruxsat berilmadi yoki sensor qidirilmoqda...");
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

  const getManeuverIcon = (type: NavigationManeuver['type']) => {
    switch (type) {
      case 'turn-right':
        return <CornerUpRight className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />;
      case 'turn-left':
        return <CornerUpLeft className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />;
      case 'arrive-stop':
        return <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-bounce" />;
      case 'arrive-school':
        return <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />;
      default:
        return <ArrowUp className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 sm:p-6 space-y-4 sm:space-y-6">
      
      {/* 1. Yandex Navigator-Style Live Turn-by-Turn GPS HUD Banner */}
      <div className="backdrop-blur-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-white relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Maneuver Big Turn Icon & Main Instruction */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/80 border border-white/15 flex items-center justify-center shadow-xl shrink-0">
              {getManeuverIcon(currentManeuver.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-black text-xs uppercase tracking-wider">
                  {currentManeuver.distanceMeters} m dan so'ng
                </span>
                <span className="text-[10px] text-slate-400 font-mono">GPS Navigatsiya</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1 leading-snug">
                {currentManeuver.instruction}
              </h2>
              <p className="text-xs text-indigo-300 font-semibold mt-0.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                Hozir: <strong className="text-white">{currentManeuver.streetName}</strong>
              </p>
            </div>
          </div>

          {/* Speedometer & Audio Voice Toggle */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
            <div className="bg-slate-950/90 border border-slate-800 px-4 py-2 rounded-2xl text-center shadow-inner">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" /> Tezlik
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {busLoc?.speed || 42} <span className="text-xs text-slate-400 font-sans">km/h</span>
              </p>
              <span className="text-[9px] text-slate-400 font-semibold block">Maks: 50 km/h</span>
            </div>

            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold ${
                isVoiceEnabled ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Ovozli yo'l ko'rsatuvchi"
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isVoiceEnabled ? "Ovozli: Faol" : "Ovoz: O'chiq"}</span>
            </button>
          </div>

        </div>

        {/* Next upcoming street bar */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Keyingi burilish:</span>
            <span className="text-white font-semibold flex items-center gap-1">
              ➔ {nextManeuver?.instruction} ({nextManeuver?.streetName})
            </span>
          </div>

          <button
            onClick={() => setShowAllTurns(!showAllTurns)}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Route className="w-3.5 h-3.5" />
            {showAllTurns ? "Ko'chalarni yopish" : "Barcha ko'chalar & burilishlar"}
            {showAllTurns ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible All Turn-by-Turn Maneuvers Drawer */}
        {showAllTurns && (
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marshrut bo'yicha barcha burilishlar va ko'chalar ketma-ketligi:</p>
            <div className="divide-y divide-slate-800/60">
              {navSteps.map((st, idx) => (
                <div 
                  key={st.id} 
                  onClick={() => setCurrentManeuverIndex(idx)}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                    idx === currentManeuverIndex ? 'bg-indigo-600/30 border border-indigo-500/40 text-white font-bold' : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs">{st.instruction}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{st.streetName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{st.distanceMeters} m</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 2. Driver Profile Header & GPS Mode Controls */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                {activeTripType === 'morning' ? (
                  <><Sun className="w-3.5 h-3.5 text-amber-400" /> ERTALABKI MARSHRUT</>
                ) : (
                  <><Moon className="w-3.5 h-3.5 text-indigo-400" /> KECHKI MARSHRUT</>
                )}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">{currentUser?.first_name} {currentUser?.last_name}</h2>
              <p className="text-xs text-slate-400">Avtobus: <strong className="text-white font-mono">{vehicle.plate_number}</strong> • Sig'imi: {vehicle.capacity} kishi</p>
            </div>
          </div>

          {/* Trip Type Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTripType('morning')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTripType === 'morning' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" /> Ertalab
            </button>
            <button
              onClick={() => setActiveTripType('evening')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTripType === 'evening' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
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
              <span className="text-xs text-slate-300">
                GPS Rejimi: <strong className="text-white">{isRealGpsActive ? '📱 Telefon Real GPS Sensori' : '🔄 Avto Simulyatsiya'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsRealGpsActive(!isRealGpsActive);
                  if (busLoc?.isSimulating) toggleBusSimulation(vehicle.id);
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  isRealGpsActive 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                {isRealGpsActive ? "GPS To'xtatish" : "📱 Telefon GPS Yoqish"}
              </button>

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
            <p className="text-[11px] text-emerald-400 font-mono bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
              <span>{gpsStatusMessage}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Dynamic Route Change Alert Banner for Driver when Parent answers "Yo'q" */}
      {tripStudents.some(ts => ts.status === 'cancelled') && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 rounded-3xl p-4 sm:p-5 shadow-2xl border border-amber-300 animate-in fade-in zoom-in duration-300 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-slate-950 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider">📢 MARSHRUT O'ZGARDI (07:00 SO'ROVNOMA)</h4>
            <p className="text-xs font-bold mt-1 text-slate-900">
              Ota-ona 07:00 so'rovnomasida "Yo'q" deb javob berdi. O'quvchi bugun olib ketilmaydi. Avtobus marshrut chizig'i va bekatlar ro'yxati avtomatik qayta hisoblandi.
            </p>
          </div>
        </div>
      )}

      {/* 4. Prominent Action Bar: QR Scan & Emergency SOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-3xl shadow-2xl flex items-center justify-between group transition transform active:scale-95 border border-white/20"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">ASOSIY TASDIQLASH</span>
            <h3 className="font-extrabold text-base sm:text-xl">QR Kod Skaner qilish</h3>
            <p className="text-xs text-blue-100 mt-0.5">O'quvchini avtobusga olish / topshirish</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
            <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </button>

        <button
          onClick={() => setIsFaceModalOpen(true)}
          className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-3xl shadow-2xl flex items-center justify-between group transition transform active:scale-95 border border-white/20"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">QO'SHIMCHA USUL</span>
            <h3 className="font-extrabold text-base sm:text-xl">Yuz orqali Aniqlash</h3>
            <p className="text-xs text-purple-100 mt-0.5">Maxfiylik roziligi bilan taniyish</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </button>

      </div>

      {/* 5. Prominent Emergency SOS Panic Button */}
      <div className="bg-red-500/15 border-2 border-red-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg border border-white/20">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-black text-red-300 text-base flex items-center justify-center sm:justify-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              FAVQULODDA HOLAT (SOS)
            </h4>
            <p className="text-xs text-red-200/80">YTH yoki favqulodda hodisa yuz berganda admin paneliga tezkor signal yuboradi</p>
          </div>
        </div>

        <button
          onClick={() => triggerSOS(101, 1, 1)}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition border border-white/20 flex items-center justify-center gap-2"
        >
          <AlertOctagon className="w-6 h-6" />
          <span>🚨 SOS TUGMASI</span>
        </button>
      </div>

      {/* 6. Driver's Assigned Student List for Today */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              Bugungi Marshrut O'quvchilari ({routeStudents.length})
            </h3>
            <p className="text-xs text-slate-400">Ketma-ketlik bo'yicha olib ketiladigan o'quvchilar ro'yxati</p>
          </div>

          {activeTripType === 'morning' ? (
            <button
              onClick={() => confirmSchoolArrival(101)}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 border border-white/10"
            >
              <CheckCircle2 className="w-4 h-4" />
              Maktabga Yetib Keldik
            </button>
          ) : (
            <button
              onClick={() => startEveningTrip(101)}
              className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 border border-white/10"
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
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                    : isCancelled
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-70'
                    : 'bg-slate-950/60 border-slate-800/80 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                    {index + 1}
                  </div>
                  <img src={st.photo_url} alt={st.first_name} className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-700 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm">
                        {st.first_name} {st.last_name}
                      </h4>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                        {st.class_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{st.address?.address_text}</span>
                    </p>
                    <p className="text-[11px] text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                      {st.primary_parent?.user?.phone} ({st.primary_parent?.user?.first_name})
                    </p>
                  </div>
                </div>

                {/* Individual Action Buttons for Driver */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {isCancelled ? (
                    <span className="text-xs bg-slate-800 text-slate-400 font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 w-full sm:w-auto">
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
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition border border-white/10"
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
                        className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition border border-white/10"
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

      {/* 7. Driver Map Preview */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
        <h3 className="font-black text-white text-sm flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
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
