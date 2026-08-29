'use client';

import React, { useState } from 'react';
import { useSystem } from '../../lib/store';
import BusMap from '../map/BusMap';
import QRCodeDisplay from '../qr/QRCodeDisplay';
import { 
  Bus, CheckCircle2, Clock, MapPin, AlertCircle, Phone, 
  Calendar, Check, X, ShieldCheck, Sparkles, Navigation, History, Zap, User, School, HomeIcon, QrCode, Compass, CheckSquare, Edit3
} from 'lucide-react';
import { SCHOOL_LOCATION } from '../../lib/mock-data';

export default function ParentView() {
  const { 
    currentUser, students, tripStudents, busLocations, vehicles, drivers, 
    dailyConfirmations, handleMorningPromptAnswer, notifications, confirmStudentAddress 
  } = useSystem();

  // Resolve child belonging to logged-in parent user
  const student = students.find(s => s.primary_parent?.user_id === currentUser?.id) || students[0];
  const primaryParent = student?.primary_parent;
  const todayStr = new Date().toISOString().split('T')[0];

  const todayConfirmation = dailyConfirmations.find(
    c => c.student_id === student?.id && c.confirmation_date === todayStr
  );

  const tripStudentState = tripStudents.find(ts => ts.student_id === student?.id);
  const busState = busLocations[1]; // Bus 1
  const vehicle = vehicles[0];
  const driver = drivers[0];

  // Location Confirmation Wizard Modal States
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [locAddressText, setLocAddressText] = useState(student?.address?.address_text || 'Toshkent sh., Yunusobod tumani');
  const [locLat, setLocLat] = useState(student?.address?.latitude || 41.3650);
  const [locLng, setLocLng] = useState(student?.address?.longitude || 69.2850);
  const [locNote, setLocNote] = useState(student?.address?.pickup_note || 'Darvoza oldida kutadi');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(false);

  const handleDetectCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert("Qurilmangizda Geolocation sensori topilmadi");
      return;
    }
    setIsDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setLocLng(parseFloat(pos.coords.longitude.toFixed(4)));
        setIsDetectingLoc(false);
      },
      (err) => {
        console.warn("Location fetch error:", err.message);
        setIsDetectingLoc(false);
        alert("Hozirgi joylashuvni olishga ruxsat berilmadi yoki sensor vaqti tugadi");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmedCheckbox) {
      alert("Iltimos, manzil to'g'riligiga ishonch hosil qilganingizni tasdiqlang!");
      return;
    }
    confirmStudentAddress(student.id, locAddressText, locLat, locLng, locNote);
    setIsLocModalOpen(false);
  };

  // Calculate distance & ETA based on bus position vs student house
  const studentAddress = student?.address;
  let etaMinutes = 4;
  if (busState && studentAddress) {
    const latDiff = Math.abs(busState.lat - studentAddress.latitude);
    const lngDiff = Math.abs(busState.lng - studentAddress.longitude);
    const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    etaMinutes = Math.max(1, Math.round(dist * 200));
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'picked_up':
        return { label: 'Uyidan olindi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Bus };
      case 'arrived_school':
        return { label: 'Maktabga yetib keldi', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2 };
      case 'left_school':
        return { label: 'Maktabdan chiqdi (Uyga yo\'lda)', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Navigation };
      case 'arrived_home':
        return { label: 'Uyiga xavfsiz yetkazildi', color: 'bg-teal-100 text-teal-800 border-teal-300', icon: ShieldCheck };
      case 'cancelled':
        return { label: 'Bugun foydalanmaydi', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: X };
      default:
        return { label: 'Avtobus kutilmoqda', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
    }
  };

  const currentStatusInfo = getStatusBadge(tripStudentState?.status);
  const StatusIcon = currentStatusInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      
      {/* 1. Unconfirmed Location Alert Banner for Parent */}
      {student && (!student.address || !student.address.is_confirmed) && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-blue-400 animate-in fade-in zoom-in duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <MapPin className="w-3.5 h-3.5 text-blue-200" /> UY MANZILINI BELGILASH TALAB ETILADI
            </span>
            <h3 className="font-extrabold text-base sm:text-xl">
              Farzandingiz ({student.first_name}) uchun avtobus bekatini tasdiqlang!
            </h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Avtobus haydovchisi uyingiz oldiga kelishi uchun telefoningiz GPS sensoridan foydalanib hozirgi joylashuvingizni biriktiring va xaritada tekshiring.
            </p>
          </div>

          <button
            onClick={() => setIsLocModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-950 hover:bg-blue-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            Hozirgi Joylashuvni Belgilash
          </button>
        </div>
      )}

      {/* 2. 07:00 Morning Prompt Card (Mobile First) */}
      {(!todayConfirmation || todayConfirmation.responded_at === undefined) && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-100">
                <Clock className="w-3.5 h-3.5" /> 07:00 Avtomatik Bildirishnoma
              </span>
              <h3 className="font-extrabold text-lg sm:text-2xl mt-1 leading-snug">
                Bugun {student?.first_name} maktab transportidan foydalanadimi?
              </h3>
              <p className="text-xs text-amber-100 max-w-xl">
                Javobingizga qarab haydovchining kunlik marshrutiga va xaritasiga avtomatik kiritiladi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => handleMorningPromptAnswer(student.id, true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 font-black text-sm text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Ha, foydalanadi
              </button>
              <button
                onClick={() => handleMorningPromptAnswer(student.id, false)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/20 hover:bg-white/30 font-bold text-sm text-white rounded-2xl active:scale-95 transition flex items-center justify-center gap-2 border border-white/40"
              >
                <X className="w-5 h-5" /> Yo'q, bugun bormaydi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Top Student Overview Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src={student?.photo_url} 
            alt={student?.first_name} 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {student?.first_name} {student?.last_name}
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200">
                {student?.class_name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{studentAddress?.address_text}</span>
            </p>
          </div>
        </div>

        {/* Status Badge & Location Change Button */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap w-full md:w-auto justify-between sm:justify-start pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsLocModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Manzilni O'zgartirish
          </button>

          <div className={`px-3.5 py-2 rounded-2xl border ${currentStatusInfo.color} font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm`}>
            <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{currentStatusInfo.label}</span>
          </div>
        </div>

      </div>

      {/* 4. Permanent Student QR Badge Card for Parent */}
      {student && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5" /> O'zgarmas Doimiy QR Kod Guvohnomasi
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
              {student.first_name} {student.last_name} ({student.student_code})
            </h3>
            <p className="text-xs text-slate-500 max-w-lg">
              Ushbu QR kod farzandingiz uchun 1 marta biriktirilgan bo'lib, <strong>butun o'quv yili davomida o'zgarmaydi</strong>. Haydovchi har kuni transportga chiqishda faqat shu QR kodni skaner qiladi.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <QRCodeDisplay value={student.qr_code} size={110} />
            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              {student.qr_code}
            </span>
          </div>
        </div>
      )}

      {/* 5. Main Grid: Live Map & Status Step Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left 2 Cols: Live Map & Bus Location */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  Jonli Transport Kuzatuvi (GPS Map)
                </h3>
                <p className="text-xs text-slate-500">Real vaqt rejimida avtobus harakati</p>
              </div>

              {/* ETA Badge */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-200" />
                <span>ETA: ~{etaMinutes} daqiqa qoldi</span>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <BusMap 
              buses={[{
                vehicle,
                lat: busState?.lat || 41.3490,
                lng: busState?.lng || 69.2815,
                speed: busState?.speed || 42
              }]}
              students={students}
              center={[busState?.lat || 41.3490, busState?.lng || 69.2815]}
              zoom={14}
              height="320px"
            />

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Hozirgi koordinata: <strong>{busState?.lat.toFixed(4)}, {busState?.lng.toFixed(4)}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Avtobus tezligi: <strong>{busState?.speed} km/h</strong>
              </span>
            </div>

          </div>
        </div>

        {/* Right Col: Today's Transport Status Timeline */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b pb-3">
              <History className="w-5 h-5 text-indigo-600 shrink-0" />
              Bugungi Holat Bosqichlari
            </h3>

            {/* Steps Timeline */}
            <div className="relative pl-6 space-y-5 sm:space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              
              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${todayConfirmation ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">07:00 - Ertalabki Tasdiq</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {todayConfirmation?.will_use_transport ? 'Ota-ona foydalanishini tasdiqladi (Ha)' : '07:00 Avtomatik so\'rovnoma'}
                </p>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${tripStudentState?.pickup_time ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-slate-300'}`}>
                  <Bus className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Uyidan Olinishi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5" suppressHydrationWarning>
                  {tripStudentState?.pickup_time ? `Vaqti: ${new Date(tripStudentState.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (QR kod)` : 'Kutilmoqda (Taxminan 07:30)'}
                </p>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${tripStudentState?.school_arrival_time ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-300'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Maktabga Yetib Kelish</h4>
                <p className="text-[11px] text-slate-500 mt-0.5" suppressHydrationWarning>
                  {tripStudentState?.school_arrival_time ? `Vaqti: ${new Date(tripStudentState.school_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Kutilmoqda (Taxminan 07:55)'}
                </p>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${tripStudentState?.school_departure_time ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-300 text-slate-300'}`}>
                  <Navigation className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Kechki Maktabdan Chiqish</h4>
                <p className="text-[11px] text-slate-500 mt-0.5" suppressHydrationWarning>
                  {tripStudentState?.school_departure_time ? `Vaqti: ${new Date(tripStudentState.school_departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reja: 15:30'}
                </p>
              </div>

              <div className="relative">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${tripStudentState?.home_arrival_time ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 text-slate-300'}`}>
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Uyga Yetkazildi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5" suppressHydrationWarning>
                  {tripStudentState?.home_arrival_time ? `Vaqti: ${new Date(tripStudentState.home_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reja: 16:10'}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Parent Location Setup Wizard Modal */}
      {isLocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="space-y-1">
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Uy Joylashuvini Belgilash va Tasdiqlash
              </span>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {student.first_name} ning Bekat Manzili
              </h3>
              <p className="text-xs text-slate-500">
                Telefoningiz GPS sensorini yoqing yoki koordinatani belgilang.
              </p>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              
              {/* Detect Current Phone GPS button */}
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingLoc}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Compass className={`w-4 h-4 ${isDetectingLoc ? 'animate-spin' : ''}`} />
                {isDetectingLoc ? 'GPS Joylashuv Aniqlanmoqda...' : '📱 Hozirgi Telefon GPS Joylashuvimni Aniqlash'}
              </button>

              {/* Interactive Preview Map */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Xaritada Joylashuvni Tekshirish</label>
                <BusMap 
                  center={[locLat, locLng]}
                  zoom={15}
                  height="220px"
                  onMapClick={(lat, lng) => {
                    setLocLat(parseFloat(lat.toFixed(4)));
                    setLocLng(parseFloat(lng.toFixed(4)));
                  }}
                />
                <p className="text-[10px] text-slate-400">💡 Xaritaning istalgan joyiga bosib pinni o'zgartirishingiz mumkin</p>
              </div>

              {/* Address inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Manzil Nomi (Ko'cha, Uy raqami)</label>
                  <input 
                    type="text"
                    required
                    value={locAddressText}
                    onChange={(e) => setLocAddressText(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs mt-1"
                    placeholder="Toshkent sh., Yunusobod 11-mavze 24-uy"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Haydovchi Uchun Eslatma</label>
                  <input 
                    type="text"
                    value={locNote}
                    onChange={(e) => setLocNote(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs mt-1"
                    placeholder="Darvoza oldida kutadi / Dom pod'yezdi"
                  />
                </div>
              </div>

              {/* Double Confirmation Checkbox */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-2.5">
                <input 
                  type="checkbox"
                  id="confirmCheck"
                  checked={isConfirmedCheckbox}
                  onChange={(e) => setIsConfirmedCheckbox(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded"
                />
                <label htmlFor="confirmCheck" className="text-xs text-amber-900 dark:text-amber-200 font-semibold cursor-pointer">
                  Manzil va koordinatalar 100% to'g'riligiga ishonchim komil va tasdiqlayman.
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" /> Manzilni Tasdiqlash va Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocModalOpen(false)}
                  className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-300 transition"
                >
                  Bekor Qilish
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
