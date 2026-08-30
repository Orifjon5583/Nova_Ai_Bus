'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../../lib/store';
import QRScannerModal from '../qr/QRScannerModal';
import FaceRecognitionModal from '../face/FaceRecognitionModal';
import BusMap from '../map/BusMap';
import { 
  Bus, QrCode, Camera, AlertOctagon, CheckCircle2, Phone, MapPin, 
  Navigation, UserCheck, ShieldAlert, Sparkles, RefreshCw, Sun, Moon, Ban, AlertTriangle, Smartphone, Compass,
  CornerUpRight, CornerUpLeft, ArrowUp, Volume2, VolumeX, ChevronDown, ChevronUp, Route, Gauge, Play, Check, ArrowRight, Flag, Warehouse, Home
} from 'lucide-react';
import { Student, TripType } from '../../types/database';
import { SCHOOL_LOCATION } from '../../lib/mock-data';

// Preset Start Locations in Urgench
const DRIVER_START_LOCATIONS = [
  { id: 'garage', name: '🏢 Urganch Avtopark Garaji', lat: 41.5510, lng: 60.6250, desc: "Shovot kanali bo'yi, Urganch" },
  { id: 'home', name: '🏠 Haydovchi Uyi (Jasur Raximov)', lat: 41.5620, lng: 60.6120, desc: "Al-Xorazmiy shoh ko'chasi 14-uy" },
  { id: 'school', name: '🏫 Nova International AI School', lat: SCHOOL_LOCATION.lat, lng: SCHOOL_LOCATION.lng, desc: SCHOOL_LOCATION.address }
];

// Calculate straight-line distance in km for Nearest-Neighbor TSP
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Automatically sort students into optimal nearest-neighbor pickup sequence from start to school
function calculateOptimalPickupSequence(
  startLat: number, 
  startLng: number, 
  studentsList: Student[], 
  schoolLat: number, 
  schoolLng: number
): Student[] {
  const remaining = [...studentsList.filter(s => s.address && s.status === 'active')];
  const ordered: Student[] = [];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const st = remaining[i];
      const dist = getDistanceKm(currentLat, currentLng, st.address!.latitude, st.address!.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nearestStudent = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nearestStudent);
    currentLat = nearestStudent.address!.latitude;
    currentLng = nearestStudent.address!.longitude;
  }

  return ordered;
}

export default function DriverView() {
  const { 
    currentUser, drivers, students, tripStudents, dailyConfirmations, busLocations, vehicles, confirmStudentPickup, 
    confirmSchoolArrival, triggerSOS, toggleBusSimulation, updateBusLocationManually, schoolLocation
  } = useSystem();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [activeTripType, setActiveTripType] = useState<TripType>('morning');
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string>('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Driver Trip State
  const [selectedStartLocationId, setSelectedStartLocationId] = useState<string>('home');
  const [tripStage, setTripStage] = useState<'idle' | 'in_progress' | 'completed'>('idle');
  const [pickupSequence, setPickupSequence] = useState<Student[]>([]);
  const [currentPickupIndex, setCurrentPickupIndex] = useState<number>(0);
  const [activeScannedStudent, setActiveScannedStudent] = useState<Student | null>(null);

  const currentDriverObj = drivers.find(d => d.user_id === currentUser?.id) || drivers[0];
  const vehicle = vehicles.find(v => v.id === currentDriverObj.id) || vehicles[0];
  const busLoc = busLocations[vehicle.id] || busLocations[1];

  const currentStartLoc = DRIVER_START_LOCATIONS.find(l => l.id === selectedStartLocationId) || DRIVER_START_LOCATIONS[0];

  // 1. Initialize & Start Trip: Calculate automatic optimal sequence (skips students whose parents answered "Yo'q")
  const handleStartTrip = () => {
    const activeConfirmedStudents = students.filter(s => {
      const conf = dailyConfirmations.find(c => c.student_id === s.id);
      return conf ? conf.will_use_transport : true;
    });

    const sortedStudents = calculateOptimalPickupSequence(
      currentStartLoc.lat,
      currentStartLoc.lng,
      activeConfirmedStudents,
      schoolLocation?.lat || SCHOOL_LOCATION.lat,
      schoolLocation?.lng || SCHOOL_LOCATION.lng
    );

    setPickupSequence(sortedStudents);
    setCurrentPickupIndex(0);
    setTripStage('in_progress');

    // Update bus starting position to driver start location
    updateBusLocationManually(vehicle.id, currentStartLoc.lat, currentStartLoc.lng, 35);
  };

  // Current active target student on the route
  const currentTargetStudent = pickupSequence[currentPickupIndex] || null;
  const isAllStudentsPickedUp = tripStage === 'in_progress' && currentPickupIndex >= pickupSequence.length;

  // 2. Open QR Scanner when arriving at student stop
  const handleArrivedAtStop = (student: Student) => {
    setActiveScannedStudent(student);
    setIsQrModalOpen(true);
  };

  // 3. Process Successful QR Scan
  const handleScanCodeSuccess = (studentId: number, code: string) => {
    confirmStudentPickup(studentId, 'qr');
    setIsQrModalOpen(false);

    // Automatically advance to the next student in the sequence!
    const nextIdx = currentPickupIndex + 1;
    setCurrentPickupIndex(nextIdx);

    if (nextIdx < pickupSequence.length) {
      const nextStudent = pickupSequence[nextIdx];
      if (nextStudent.address) {
        updateBusLocationManually(vehicle.id, nextStudent.address.latitude, nextStudent.address.longitude, 40);
      }
    } else {
      // Direct bus towards Nova School
      updateBusLocationManually(
        vehicle.id, 
        schoolLocation?.lat || SCHOOL_LOCATION.lat, 
        schoolLocation?.lng || SCHOOL_LOCATION.lng, 
        42
      );
    }
  };

  // 4. Finish Trip at School
  const handleFinishSchoolArrival = () => {
    confirmSchoolArrival(101);
    setTripStage('completed');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 sm:p-6 space-y-5 text-white">
      
      {/* 1. INTERACTIVE DRIVER MISSION CONTROL & AUTOMATED SEQUENCE HUD */}
      <div className="backdrop-blur-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
        
        {/* Top Stage Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Avtomatik Ketma-Ketlik Navigatri
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {currentDriverObj.user?.first_name || 'Jasur'} {currentDriverObj.user?.last_name || 'Raximov'} ({vehicle.plate_number})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
              tripStage === 'in_progress' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                : tripStage === 'completed'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {tripStage === 'in_progress' ? '🟢 Reys Faol' : tripStage === 'completed' ? '🏁 Yakunlandi' : '🟡 Kutilmoqda'}
            </span>
          </div>
        </div>

        {/* STAGE A: IDLE - Select Starting Point and Launch Automated Trip */}
        {tripStage === 'idle' && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Haydovchi Harakatni Qayerdan Boshlaydi?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DRIVER_START_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedStartLocationId(loc.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedStartLocationId === loc.id 
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white mb-1">{loc.name}</div>
                    <div className="text-[10px] text-slate-400">{loc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Avtomatik Optimal Ketma-Ketlik
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tizim tanlangan boshlang'ich nuqtadan eng yaqin o'quvchilarni ketma-ket hisoblab beradi.
                </p>
              </div>

              <button
                onClick={handleStartTrip}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95 border border-white/20 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>O'quvchilarni Yig'ishni Boshlash</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE B: IN PROGRESS - Active Stop & QR Scanner Workflow */}
        {tripStage === 'in_progress' && (
          <div className="space-y-4">
            
            {/* Current Active Destination Banner */}
            {!isAllStudentsPickedUp && currentTargetStudent ? (
              <div className="p-5 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900/80 border-2 border-blue-400/40 rounded-2xl space-y-4 shadow-xl">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                      {currentPickupIndex + 1}
                    </span>
                    <img 
                      src={currentTargetStudent.photo_url} 
                      alt={currentTargetStudent.first_name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Hozirgi Manzil:</span>
                      <h3 className="font-black text-lg text-white">
                        {currentTargetStudent.first_name} {currentTargetStudent.last_name} ({currentTargetStudent.class_name})
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {currentTargetStudent.address?.address_text}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={`tel:${currentTargetStudent.primary_parent?.user?.phone || '+998905556677'}`}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Qo'ng'iroq
                  </a>
                </div>

                {/* Big Action Button: Arrived at Stop & Scan QR */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => handleArrivedAtStop(currentTargetStudent)}
                    className="w-full sm:flex-1 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition flex items-center justify-center gap-2.5 active:scale-95 border-2 border-white/40 animate-pulse"
                  >
                    <QrCode className="w-5 h-5 text-slate-950" />
                    <span>🛑 Bekatga Yetib Keldik: {currentTargetStudent.first_name}ni QR Skaner Qilish</span>
                  </button>
                </div>

              </div>
            ) : (
              /* All Students Picked Up -> Heading to Nova School */
              <div className="p-5 bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900/80 border-2 border-purple-400/40 rounded-2xl space-y-4 shadow-xl text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      🏫
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Yakuniy Bosqich:</span>
                      <h3 className="font-black text-lg text-white">Barcha O'quvchilar Avtobusga Chiqdi!</h3>
                      <p className="text-xs text-slate-300">Nova International AI School Urgench tomon yo'nalmoqda</p>
                    </div>
                  </div>

                  <button
                    onClick={handleFinishSchoolArrival}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2 border border-white/20 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>🏫 Maktabga Yetib Keldik (Reysni Yakunlash)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Automated Pickup Sequence Stepper */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>O'quvchilarni Yig'ish Ketma-ketligi ({currentPickupIndex}/{pickupSequence.length})</span>
                <span className="text-indigo-400 font-normal">Optimal Marshrut</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {pickupSequence.map((st, idx) => {
                  const isPicked = idx < currentPickupIndex;
                  const isCurrent = idx === currentPickupIndex;

                  return (
                    <div 
                      key={st.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
                        isPicked 
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-400' 
                          : isCurrent 
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-md' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isPicked ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPicked ? '✓' : idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate">{st.first_name} {st.last_name}</div>
                        <div className="text-[9px] text-slate-400 truncate">{st.address?.address_text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STAGE C: COMPLETED */}
        {tripStage === 'completed' && (
          <div className="p-6 bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-black text-lg text-white">Ertalabki Qatnov Muvaffaqiyatli Yakunlandi!</h3>
            <p className="text-xs text-slate-300">Barcha o'quvchilar xavfsiz maktabga yetkazildi va ota-onalarga bildirishnomalar yuborildi.</p>
            <button
              onClick={() => setTripStage('idle')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
            >
              Yangi Reys Tayyorlash
            </button>
          </div>
        )}

      </div>

      {/* 2. LIVE MAP HUD */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-white">Jonli Navigatr Xaritasi</h3>
            <p className="text-xs text-slate-400">Urganch bo'ylab real ko'cha yo'nalishi</p>
          </div>
          <a
            href="/map"
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" /> To'liq Ekranda Ochish
          </a>
        </div>

        <BusMap 
          buses={[{
            vehicle,
            lat: busLoc?.lat || 41.5620,
            lng: busLoc?.lng || 60.6120,
            speed: busLoc?.speed || 42,
            heading: busLoc?.heading || 140
          }]}
          students={pickupSequence.length > 0 ? pickupSequence : students}
          schoolLocation={schoolLocation}
          dailyConfirmations={dailyConfirmations}
          height="380px"
          followBus={true}
        />
      </div>

      {/* 3. EMERGENCY SOS BUTTON */}
      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <h4 className="font-black text-sm text-red-300">Favqulodda Signal (SOS)</h4>
            <p className="text-xs text-red-200/70">Texnik nosozlik yoki favqulodda holatda maktab ma'muriyatiga signal yuborish</p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerSOS(101, vehicle.id, currentDriverObj.id);
            alert("🚨 SOS Favqulodda signal maktab ma'muriyatiga yuborildi!");
          }}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-red-600/40 transition active:scale-95 shrink-0"
        >
          🚨 SOS YUBORISH
        </button>
      </div>

      {/* QR SCANNER MODAL */}
      <QRScannerModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        students={activeScannedStudent ? [activeScannedStudent] : students}
        onScanSuccess={handleScanCodeSuccess}
      />

    </div>
  );
}
