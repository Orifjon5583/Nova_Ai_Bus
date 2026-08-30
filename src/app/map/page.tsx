'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSystem } from '../../lib/store';
import { SCHOOL_LOCATION } from '../../lib/mock-data';
import { 
  Bus, Navigation, MapPin, ArrowLeft, Users, ShieldCheck, 
  Activity, Clock, Compass, Layers, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';

// Dynamic import of Leaflet Map Container with SSR disabled
const BusMapContainer = dynamic(() => import('../../components/map/BusMapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Urganch OSRM Xaritasi yuklanmoqda...</p>
    </div>
  )
});

export default function FullscreenMapPage() {
  const { vehicles, students, schoolLocation, dailyConfirmations, busLocations, emergencyAlerts, routeAlerts } = useSystem();
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [followBus, setFollowBus] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.5420, 60.6350]);
  const [mapZoom, setMapZoom] = useState(14);

  const activeBus = vehicles.find(v => v.id === 1) || vehicles[0];
  const activeBusState = busLocations[activeBus?.id || 1];

  const busData = activeBus ? [{
    vehicle: activeBus,
    lat: activeBusState?.lat || 41.5620,
    lng: activeBusState?.lng || 60.6120,
    speed: activeBusState?.speed || 42,
    heading: activeBusState?.heading || 140
  }] : [];

  const handleRecenterBus = () => {
    if (activeBusState) {
      setMapCenter([activeBusState.lat, activeBusState.lng]);
      setMapZoom(16);
      setFollowBus(true);
    }
  };

  const handleRecenterSchool = () => {
    setFollowBus(false);
    setMapCenter([SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]);
    setMapZoom(16);
  };

  return (
    <div className="relative w-full h-[calc(100vh-68px)] bg-slate-950 overflow-hidden flex flex-col">
      
      {/* Top Floating Glassmorphism Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Side: Back button & Active Route Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 backdrop-blur-2xl hover:bg-slate-800 text-white rounded-2xl border border-white/10 text-xs font-black shadow-2xl transition group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition" />
            <span>Asosiy Panel</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 text-xs shadow-2xl">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{activeBus?.plate_number}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-semibold">{activeBusState?.speed || 42} km/h</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-medium">1-Yo'nalish (Urganch ➔ Nova Maktab)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Map Controls & Passengers Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Driver Navigation Follow Mode Toggle */}
          <button
            onClick={() => setFollowBus(!followBus)}
            className={`px-3.5 py-2.5 backdrop-blur-2xl rounded-2xl border text-xs font-black shadow-2xl transition flex items-center gap-1.5 ${
              followBus 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-yellow-300 animate-pulse' 
                : 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-white/10'
            }`}
            title="Haydovchi Navigatr Rejimi (Avtobusni kuzatish)"
          >
            <Compass className="w-4 h-4" />
            <span>{followBus ? '🧭 Navigatr Faol' : '🧭 Navigatr'}</span>
          </button>

          <button
            onClick={handleRecenterBus}
            className="px-3.5 py-2.5 bg-slate-900/90 backdrop-blur-2xl hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-2xl border border-white/10 text-xs font-bold shadow-2xl transition flex items-center gap-1.5"
            title="Avtobusga qaratish"
          >
            <Bus className="w-4 h-4" />
            <span className="hidden md:inline">Avtobusga O'tish</span>
          </button>

          <button
            onClick={handleRecenterSchool}
            className="px-3.5 py-2.5 bg-slate-900/90 backdrop-blur-2xl hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-2xl border border-white/10 text-xs font-bold shadow-2xl transition flex items-center gap-1.5"
            title="Maktabga qaratish"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden md:inline">Nova Maktab</span>
          </button>

          <button
            onClick={() => setShowPassengerList(!showPassengerList)}
            className={`px-3.5 py-2.5 backdrop-blur-2xl rounded-2xl border text-xs font-bold shadow-2xl transition flex items-center gap-1.5 ${
              showPassengerList 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-900/90 hover:bg-slate-800 border-white/10 text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>O'quvchilar ({students.length})</span>
          </button>

        </div>
      </div>

      {/* Right Drawer: Live Passenger Manifest */}
      {showPassengerList && (
        <div className="absolute top-20 right-4 w-80 sm:w-96 max-h-[calc(100vh-160px)] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-4 z-30 overflow-y-auto text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h4 className="font-extrabold text-white text-sm">Yo'nalishdagi O'quvchilar</h4>
              <p className="text-[10px] text-slate-400">Nova International AI School Urgench</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              {students.filter(s => s.status === 'active').length} faol
            </span>
          </div>

          <div className="space-y-2">
            {students.map((student, idx) => (
              <div key={student.id} className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-2xl transition flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <img 
                    src={student.photo_url} 
                    alt={student.first_name} 
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h5 className="font-bold text-white text-xs">{student.first_name} {student.last_name}</h5>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{student.address?.address_text}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Kutilmoqda
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Live Telemetry Strip */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-6 text-xs text-white max-w-2xl w-full justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              ETA
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Maktabga yetib borish</p>
              <h5 className="font-black text-sm text-white">07:55 <span className="text-amber-400 text-xs font-bold">(~3 daqiqa)</span></h5>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-6">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hozirgi Ko'cha</p>
              <h5 className="font-bold text-xs text-slate-200 truncate max-w-[180px]">Sanoatchilar ko'chasi</h5>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold text-xs">OSRM Live GPS</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Interactive Leaflet Map */}
      <div className="w-full h-full flex-1">
        <BusMapContainer
          buses={busData}
          students={students}
          schoolLocation={schoolLocation}
          dailyConfirmations={dailyConfirmations}
          center={mapCenter}
          zoom={mapZoom}
          emergencyAlerts={emergencyAlerts}
          routeAlerts={routeAlerts}
          height="100%"
          followBus={followBus}
        />
      </div>

    </div>
  );
}
