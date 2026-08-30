'use client';

import React, { useState } from 'react';
import { useSystem } from '../../lib/store';
import BusMap from '../map/BusMap';
import QRCodeDisplay from '../qr/QRCodeDisplay';
import { 
  Bus, Users, MapPin, AlertOctagon, CheckCircle2, Plus, 
  Trash2, Edit, ShieldAlert, Route, Search, Download, Eye, FileText, Activity, AlertCircle, RefreshCw, Sparkles, Navigation, Check, MousePointerClick, Crosshair
} from 'lucide-react';
import { Student, Vehicle, Driver } from '../../types/database';

export default function AdminView() {
  const { 
    students, parents, drivers, vehicles, routes, busLocations, 
    emergencyAlerts, routeAlerts, auditLogs, resolveSOS, addStudent, deleteStudent,
    resetStudentAddressRequest, updateStudentLocation, schoolLocation, updateSchoolLocation
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'map' | 'locations' | 'students' | 'fleet' | 'routes' | 'logs'>('map');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);

  // Map Click Quick Action Popover State
  const [clickedMapLocation, setClickedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStudentForMapAssign, setSelectedStudentForMapAssign] = useState<number>(students[0]?.id || 1);

  // Student Location Edit Modal State
  const [editingStudentLocation, setEditingStudentLocation] = useState<Student | null>(null);
  const [editStudentAddressText, setEditStudentAddressText] = useState('');
  const [editStudentLat, setEditStudentLat] = useState(41.5420);
  const [editStudentLng, setEditStudentLng] = useState(60.6350);

  // School Location Edit Modal State
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolName, setSchoolName] = useState(schoolLocation?.name || "Nova International AI School");
  const [schoolAddress, setSchoolAddress] = useState(schoolLocation?.address || "Urganch sh., Sanoatchilar ko'chasi 9-0");
  const [schoolLat, setSchoolLat] = useState(schoolLocation?.lat || 41.5347);
  const [schoolLng, setSchoolLng] = useState(schoolLocation?.lng || 60.5983);

  // New Student Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newClassName, setNewClassName] = useState('3-A sinf');
  const [newAddressText, setNewAddressText] = useState('');
  const [newLat, setNewLat] = useState(41.5420);
  const [newLng, setNewLng] = useState(60.6350);

  const activeEmergency = emergencyAlerts.find(e => e.status === 'active');

  const filteredStudents = students.filter(s => 
    s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map Click Handler: Opens Quick Assignment Modal
  const handleMapClick = (lat: number, lng: number) => {
    const cleanLat = parseFloat(lat.toFixed(6));
    const cleanLng = parseFloat(lng.toFixed(6));
    setNewLat(cleanLat);
    setNewLng(cleanLng);
    setClickedMapLocation({ lat: cleanLat, lng: cleanLng });
  };

  const handleAssignClickedLocationToSchool = () => {
    if (!clickedMapLocation) return;
    updateSchoolLocation(
      schoolLocation.name,
      `Urganch sh., Tanlangan nuqta (${clickedMapLocation.lat}, ${clickedMapLocation.lng})`,
      clickedMapLocation.lat,
      clickedMapLocation.lng
    );
    setClickedMapLocation(null);
    alert("🏫 Maktab rasmiy joylashuvi xaritadagi yangi nuqtaga muvaffaqiyatli o'zgartirildi!");
  };

  const handleAssignClickedLocationToStudent = () => {
    if (!clickedMapLocation) return;
    const targetStudent = students.find(s => s.id === selectedStudentForMapAssign);
    if (targetStudent) {
      updateStudentLocation(
        targetStudent.id,
        `Urganch sh., Bekat #${targetStudent.id} (${clickedMapLocation.lat}, ${clickedMapLocation.lng})`,
        clickedMapLocation.lat,
        clickedMapLocation.lng
      );
      setClickedMapLocation(null);
      alert(`📍 ${targetStudent.first_name} ${targetStudent.last_name} ning bekati yangilandi!`);
    }
  };

  const handleOpenEditStudentLocation = (student: Student) => {
    setEditingStudentLocation(student);
    setEditStudentAddressText(student.address?.address_text || '');
    setEditStudentLat(student.address?.latitude || 41.5420);
    setEditStudentLng(student.address?.longitude || 60.6350);
  };

  const handleSaveStudentLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentLocation) return;
    updateStudentLocation(editingStudentLocation.id, editStudentAddressText, editStudentLat, editStudentLng);
    setEditingStudentLocation(null);
  };

  const handleSaveSchoolLocation = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolLocation(schoolName, schoolAddress, schoolLat, schoolLng);
    setIsEditingSchool(false);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;

    const code = `NV-2026-${Math.floor(100 + Math.random() * 900)}`;
    addStudent({
      first_name: newFirstName,
      last_name: newLastName,
      birth_date: '2017-05-15',
      gender: 'Erkak',
      class_name: newClassName,
      student_code: code,
      qr_code: `STU-QR-${newFirstName.toUpperCase()}-NEW`,
      photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
      status: 'active'
    }, newAddressText || "Urganch sh., Al-Xorazmiy shoh ko'chasi", newLat, newLng);

    setIsAddStudentOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewAddressText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Admin Dashboard Header */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-600/30 border border-white/20 shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              MAKTAB AVTOPARK ADMIN KONTROLI
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Dilshod Karimov (Bosh Administrator)
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Nova International AI School Urgench • 3 ta Avtobus • {students.length} ta O'quvchi</p>
          </div>
        </div>

        {/* SOS Alert Counter Badge */}
        {activeEmergency && (
          <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertOctagon className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-black text-red-300 text-xs uppercase">FAVQULODDA SIGNAL (SOS)</p>
              <button 
                onClick={() => resolveSOS(activeEmergency.id)}
                className="mt-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[11px] transition shadow"
              >
                Signalni Yopish
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs (Floating Glass Pills) */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-3 scrollbar-none">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'map' ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" /> Jonli Xarita & Interaktiv Tanlash
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'locations' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Navigation className="w-4 h-4 text-amber-400" /> 📍 Manzillarni Tahrirlash
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'students' ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> O'quvchilar & QR Kodlar
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'fleet' ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Bus className="w-4 h-4" /> Transportlar & Haydovchilar
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'routes' ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Route className="w-4 h-4" /> Marshrutlar
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 border ${
            activeTab === 'logs' ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/25' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Audit Loglari
        </button>
      </div>

      {/* TAB 1: Global Fleet Map with Interactive Pin Click */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-emerald-400" />
                    Urganch Shahri Bo'ylab Jonli Xarita & Interaktiv Joylashuv Tanlash
                  </h3>
                  <p className="text-xs text-slate-400">Xaritaning istalgan joyiga bosib maktab yoki o'quvchi bekatini o'zgartiring</p>
                </div>
                <a
                  href="/map"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" /> Keng Ekranda Ochish
                </a>
              </div>

              {/* Map Container */}
              <BusMap 
                buses={vehicles.map(v => ({
                  vehicle: v,
                  lat: busLocations[v.id]?.lat || 41.5620,
                  lng: busLocations[v.id]?.lng || 60.6120,
                  speed: busLocations[v.id]?.speed || 42,
                  heading: busLocations[v.id]?.heading || 140
                }))}
                students={students}
                schoolLocation={schoolLocation}
                emergencyAlerts={emergencyAlerts}
                routeAlerts={routeAlerts}
                onMapClick={handleMapClick}
                zoom={13}
                height="500px"
              />
              
              <div className="p-4 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-950/80 border border-blue-500/30 rounded-2xl text-xs text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-300 block">Oxirgi Tanlangan Koordinata:</span>
                    <strong className="text-white font-mono text-xs">{newLat}, {newLng}</strong>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  💡 Xaritada istalgan ko'chani bosing va 1-klikda manzil qilib biriktiring
                </span>
              </div>
            </div>
          </div>

          {/* Right Fleet Sidebar */}
          <div className="space-y-4">
            <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3">
                Avtopark Ro'yxati & Status
              </h3>

              <div className="space-y-3">
                {vehicles.map(v => {
                  const bLoc = busLocations[v.id];
                  const driverObj = drivers.find(d => d.id === v.id);

                  return (
                    <div 
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        selectedVehicleId === v.id ? 'bg-indigo-950/50 border-indigo-500/50 shadow-lg' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-sm text-white">{v.vehicle_name}</span>
                        <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                          {v.plate_number}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-400 space-y-1">
                        <p><strong>Haydovchi:</strong> {driverObj?.user?.first_name} {driverObj?.user?.last_name}</p>
                        <p><strong>Hozirgi Tezlik:</strong> {bLoc?.speed || 42} km/h</p>
                        <p><strong>Holati:</strong> {bLoc?.isSimulating ? '🟢 Harakatda (Live GPS)' : '🟢 Marshrutda'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANZILLARNI TAHRIRLASH (Locations Management) */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          
          {/* School Location Card */}
          <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">Maktab Asosiy Joylashuvi (School Location)</h3>
                  <p className="text-xs text-slate-400">Barcha avtobuslar harakati yakunlanadigan markaziy bino</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingSchool(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Maktab Joylashuvini Tahrirlash
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maktab Nomi</span>
                <p className="font-bold text-white text-sm mt-1">{schoolLocation.name}</p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manzil & Koordinatalar</span>
                <p className="font-bold text-white text-sm mt-1">{schoolLocation.address}</p>
                <p className="text-xs text-blue-400 font-mono mt-0.5">Lat: {schoolLocation.lat} • Lng: {schoolLocation.lng}</p>
              </div>
            </div>
          </div>

          {/* Student Locations Table */}
          <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-white text-lg">O'quvchilar Uylari va Bekatlar Koordinatalari</h3>
                <p className="text-xs text-slate-400">Admin xaritada yoki qo'lda istalgan o'quvchi manzilini o'zgartirishi mumkin</p>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Yangi Manzil Qo'shish
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase">
                    <th className="p-3.5">Bekat # / O'quvchi</th>
                    <th className="p-3.5">Sinfi</th>
                    <th className="p-3.5">Uy Manzili</th>
                    <th className="p-3.5">GPS Koordinatalari</th>
                    <th className="p-3.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <img src={st.photo_url} alt={st.first_name} className="w-9 h-9 rounded-2xl object-cover border border-slate-700" />
                          <div>
                            <p className="font-bold text-white text-sm">{st.first_name} {st.last_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{st.student_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-indigo-400">{st.class_name}</td>
                      <td className="p-3.5 max-w-xs">
                        <p className="text-white font-medium text-xs">{st.address?.address_text || "Belgilanmagan"}</p>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-400">
                          {st.address?.latitude?.toFixed(6) || 41.5420}, {st.address?.longitude?.toFixed(6) || 60.6350}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenEditStudentLocation(st)}
                          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-1.5 ml-auto active:scale-95"
                        >
                          <Edit className="w-3.5 h-3.5" /> Manzilni Tahrirlash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Student Management & QR Badges */}
      {activeTab === 'students' && (
        <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-white text-lg">
                O'quvchilar Boshqaruvi va QR Kodlar
              </h3>
              <p className="text-xs text-slate-400">O'quvchilar ro'yxati, manzillar va alohida QR kodlar</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  placeholder="Ism yoki sinf bo'yicha izlash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center gap-1.5 shrink-0 border border-white/10"
              >
                <Plus className="w-4 h-4" /> Yangi O'quvchi
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase">
                  <th className="p-3.5">O'quvchi</th>
                  <th className="p-3.5">Sinfi</th>
                  <th className="p-3.5">Kodi</th>
                  <th className="p-3.5">Ota-onasi / Tel</th>
                  <th className="p-3.5">Uy Manzili</th>
                  <th className="p-3.5 text-center">QR Kod</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={st.photo_url} alt={st.first_name} className="w-10 h-10 rounded-2xl object-cover border border-slate-700" />
                        <div>
                          <p className="font-bold text-white text-sm">{st.first_name} {st.last_name}</p>
                          <p className="text-[10px] text-slate-400">{st.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-indigo-400">{st.class_name}</td>
                    <td className="p-3.5 font-mono text-slate-300">{st.student_code}</td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-200">{st.primary_parent?.user?.first_name} {st.primary_parent?.user?.last_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{st.primary_parent?.user?.phone}</p>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-200 font-medium text-xs line-clamp-1">{st.address?.address_text}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={() => handleOpenEditStudentLocation(st)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Manzilni o'zgartirish
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedStudentForQr(st)}
                        className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 mx-auto"
                      >
                        <QRCodeDisplay value={st.qr_code} size={16} /> QR Ko'rish
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => deleteStudent(st.id)}
                          className="px-3 py-1.5 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold transition"
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Fleet & Drivers */}
      {activeTab === 'fleet' && (
        <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="font-extrabold text-white text-lg border-b border-slate-800 pb-3">
            Transportlar va Biriktirilgan Haydovchilar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {vehicles.map(v => {
              const bLoc = busLocations[v.id];
              const driverObj = drivers.find(d => d.id === v.id);

              return (
                <div key={v.id} className="p-5 bg-slate-950/60 border border-slate-800 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <Bus className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {v.plate_number}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{v.vehicle_name}</h4>
                    <p className="text-xs text-slate-400">{v.model} • {v.capacity} o'rinli</p>
                  </div>
                  <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 space-y-1.5">
                    <p><strong>Haydovchi:</strong> {driverObj?.user?.first_name} {driverObj?.user?.last_name}</p>
                    <p><strong>Telefon:</strong> {driverObj?.user?.phone}</p>
                    <p><strong>Hozirgi Tezlik:</strong> <span className="text-emerald-400 font-bold">{bLoc?.speed || 42} km/h</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Routes */}
      {activeTab === 'routes' && (
        <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="font-extrabold text-white text-lg border-b border-slate-800 pb-3">
            Quyi Marshrutlar & Yo'nalishlar
          </h3>
          <div className="space-y-4">
            {routes.map(r => (
              <div key={r.id} className="p-5 bg-slate-950/60 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-base">{r.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{r.description || "Urganch shahri bo'ylab transport yo'nalishi"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    MapTiler Optimal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="font-extrabold text-white text-lg border-b border-slate-800 pb-3">
            Tizim Harakat Loglari (Audit)
          </h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-indigo-400">{log.action}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 font-mono">{log.new_data}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: QUICK MAP CLICK ACTION MODAL */}
      {clickedMapLocation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  <Crosshair className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Xaritada Nuqta Tanlandi</h3>
                  <p className="text-[11px] text-blue-400 font-mono">Lat: {clickedMapLocation.lat} • Lng: {clickedMapLocation.lng}</p>
                </div>
              </div>
              <button 
                onClick={() => setClickedMapLocation(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">Ushbu tanlangan nuqtani qaysi ob'ektga biriktirmoqchisiz?</p>

            <div className="space-y-3">
              {/* Option A: Assign to School */}
              <button
                onClick={handleAssignClickedLocationToSchool}
                className="w-full p-3.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    🏫
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Maktab Joylashuvi Qilish</h5>
                    <p className="text-[10px] text-slate-400">Nova International AI School</p>
                  </div>
                </div>
                <Check className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
              </button>

              {/* Option B: Assign to Student Stop */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  O'quvchi Bekatiga Biriktirish:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStudentForMapAssign}
                    onChange={(e) => setSelectedStudentForMapAssign(parseInt(e.target.value))}
                    className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignClickedLocationToStudent}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shrink-0"
                  >
                    Biriktirish
                  </button>
                </div>
              </div>

              {/* Option C: Add New Student with this point */}
              <button
                onClick={() => {
                  setClickedMapLocation(null);
                  setIsAddStudentOpen(true);
                }}
                className="w-full p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl text-left transition flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Yangi o'quvchi qo'shish (ushbu koordinatada)</span>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setClickedMapLocation(null)}
                className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT LOCATION */}
      {editingStudentLocation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  O'quvchi Manzilini Tahrirlash
                </h3>
                <p className="text-xs text-slate-400">{editingStudentLocation.first_name} {editingStudentLocation.last_name} ({editingStudentLocation.class_name})</p>
              </div>
              <button 
                onClick={() => setEditingStudentLocation(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentLocation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300">Uy Manzili (Ko'cha / Uy raqami)</label>
                <input 
                  type="text" 
                  required
                  value={editStudentAddressText} 
                  onChange={(e) => setEditStudentAddressText(e.target.value)} 
                  placeholder="Masalan: Urganch sh., Al-Xorazmiy shoh ko'chasi 14-uy"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-400" />
                    GPS Koordinatalari (MapTiler yo'nalishi uchun):
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Latitude (Kenglik)</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={editStudentLat} 
                      onChange={(e) => setEditStudentLat(parseFloat(e.target.value))} 
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Longitude (Uzunlik)</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={editStudentLng} 
                      onChange={(e) => setEditStudentLng(parseFloat(e.target.value))} 
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingStudentLocation(null)} 
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Saqlash va Marshrutni Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT SCHOOL LOCATION */}
      {isEditingSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Maktab Joylashuvini Tahrirlash
                </h3>
                <p className="text-xs text-slate-400">Markaziy maktab binosi manzili va koordinatalari</p>
              </div>
              <button 
                onClick={() => setIsEditingSchool(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchoolLocation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300">Maktab Nomi</label>
                <input 
                  type="text" 
                  required
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Maktab To'liq Manzili</label>
                <input 
                  type="text" 
                  required
                  value={schoolAddress} 
                  onChange={(e) => setSchoolAddress(e.target.value)} 
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  Maktab GPS Koordinatalari:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Latitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={schoolLat} 
                      onChange={(e) => setSchoolLat(parseFloat(e.target.value))} 
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Longitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={schoolLng} 
                      onChange={(e) => setSchoolLng(parseFloat(e.target.value))} 
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditingSchool(false)} 
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Maktabni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD STUDENT */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Yangi O'quvchi Qo'shish</h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Ismi</label>
                <input 
                  type="text" 
                  required 
                  value={newFirstName} 
                  onChange={(e) => setNewFirstName(e.target.value)} 
                  className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Familiyasi</label>
                <input 
                  type="text" 
                  required 
                  value={newLastName} 
                  onChange={(e) => setNewLastName(e.target.value)} 
                  className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Sinfi</label>
                <input 
                  type="text" 
                  value={newClassName} 
                  onChange={(e) => setNewClassName(e.target.value)} 
                  className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Uy Manzili</label>
                <input 
                  type="text" 
                  value={newAddressText} 
                  onChange={(e) => setNewAddressText(e.target.value)} 
                  className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1"
                  placeholder="Urganch sh., Al-Xorazmiy..."
                />
              </div>

              <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-2xl space-y-2">
                <p className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  GPS Koordinatalari:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Latitude</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={newLat} 
                      onChange={(e) => setNewLat(parseFloat(e.target.value))} 
                      className="w-full p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Longitude</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={newLng} 
                      onChange={(e) => setNewLng(parseFloat(e.target.value))} 
                      className="w-full p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddStudentOpen(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Bekor qilish</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Permanent Student QR Display Modal */}
      {selectedStudentForQr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            
            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/30">
                O'zgarmas Doimiy QR Guvohnoma
              </span>
              <h3 className="font-black text-lg text-white pt-1">
                {selectedStudentForQr.first_name} {selectedStudentForQr.last_name}
              </h3>
              <p className="text-xs text-indigo-400 font-medium">{selectedStudentForQr.class_name} • {selectedStudentForQr.student_code}</p>
            </div>

            <div className="flex justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <QRCodeDisplay value={selectedStudentForQr.qr_code} size={180} />
            </div>

            <p className="text-xs font-mono font-bold text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              QR kodi: {selectedStudentForQr.qr_code}
            </p>

            <p className="text-[10px] text-slate-400">
              📌 Ushbu QR kod ushbu o'quvchi uchun alohida va doimiy bo'lib, o'quv yili davomida hech qachon o'zgarmaydi.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 border border-white/10"
              >
                <Download className="w-4 h-4" /> Chop Etish
              </button>
              <button 
                onClick={() => setSelectedStudentForQr(null)}
                className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition border border-slate-700"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
