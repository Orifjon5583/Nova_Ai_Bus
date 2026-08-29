'use client';

import React, { useState } from 'react';
import { useSystem } from '../../lib/store';
import BusMap from '../map/BusMap';
import QRCodeDisplay from '../qr/QRCodeDisplay';
import { 
  Bus, Users, MapPin, AlertOctagon, CheckCircle2, Plus, 
  Trash2, Edit, ShieldAlert, Route, Search, Download, Eye, FileText, Activity, AlertCircle, RefreshCw
} from 'lucide-react';
import { Student, Vehicle, Driver } from '../../types/database';

export default function AdminView() {
  const { 
    students, parents, drivers, vehicles, routes, busLocations, 
    emergencyAlerts, routeAlerts, auditLogs, resolveSOS, addStudent, deleteStudent,
    resetStudentAddressRequest, updateStudentLocation
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'map' | 'students' | 'fleet' | 'routes' | 'logs'>('map');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);

  // New Student Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newClassName, setNewClassName] = useState('3-A sinf');
  const [newAddressText, setNewAddressText] = useState('');
  const [newLat, setNewLat] = useState(41.3500);
  const [newLng, setNewLng] = useState(69.2900);

  const activeEmergency = emergencyAlerts.find(e => e.status === 'active');

  const filteredStudents = students.filter(s => 
    s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;

    const code = `NV-2026-${Math.floor(100 + Math.random() * 900)}`;
    addStudent({
      first_name: newFirstName,
      last_name: newLastName,
      birth_date: '2017-05-10',
      gender: 'Erkak',
      class_name: newClassName,
      student_code: code,
      qr_code: `STU-QR-${newFirstName.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
      status: 'active'
    }, newAddressText || 'Toshkent shahar', newLat, newLng);

    setIsAddStudentOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewAddressText('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Jami O'quvchilar</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{students.length} kishi</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Barchasi faol</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Avtopark (Avtobuslar)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{vehicles.length} ta</h3>
            <span className="text-[10px] text-emerald-600 font-medium">3 ta yo'nalishda harakatda</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Favqulodda Signal (SOS)</p>
            <h3 className={`text-2xl font-black mt-1 ${activeEmergency ? 'text-red-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
              {emergencyAlerts.filter(e => e.status === 'active').length} ta
            </h3>
            <span className="text-[10px] text-slate-500">Real-vaqt monitoring</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeEmergency ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-100 text-slate-500'}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Tezlik & Marshrut Alertlari</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{routeAlerts.length} ta</h3>
            <span className="text-[10px] text-amber-600 font-medium">1 ta tezlik oshishi</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* SOS Alert Banner */}
      {activeEmergency && (
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-white shrink-0 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-lg">FAVQULODDA SOS OGOHLANTIRISH!</h4>
              <p className="text-xs text-red-100">{activeEmergency.message} • Avtobus: 01 777 NVA</p>
            </div>
          </div>
          <button
            onClick={() => resolveSOS(activeEmergency.id)}
            className="px-5 py-2.5 bg-white text-red-700 hover:bg-slate-100 font-black text-xs rounded-2xl shadow transition uppercase"
          >
            Signalni Hal Qilish (Resolve)
          </button>
        </div>
      )}

      {/* Navigation Tabs (Mobile Touch Scrollable) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            activeTab === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" /> Real-Vaqt Avtopark Xaritasi
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> O'quvchilar & QR Kodlar
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            activeTab === 'fleet' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Bus className="w-4 h-4" /> Transportlar & Haydovchilar
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            activeTab === 'routes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Route className="w-4 h-4" /> Marshrutlar Optimizatsiyasi
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Audit & Harakat Loglari
        </button>
      </div>

      {/* TAB 1: Global Fleet Map */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Barcha Transportlar va Marshrutlar Xaritasi
                  </h3>
                  <p className="text-xs text-slate-500">Real-vaqtda barcha 3 ta avtobus va o'quvchilar uylari</p>
                </div>
              </div>

              {/* Leaflet Map with all 3 buses */}
              <BusMap 
                buses={vehicles.map(v => ({
                  vehicle: v,
                  lat: busLocations[v.id]?.lat || 41.3300,
                  lng: busLocations[v.id]?.lng || 69.2700,
                  speed: busLocations[v.id]?.speed || 40
                }))}
                students={students}
                emergencyAlerts={emergencyAlerts}
                routeAlerts={routeAlerts}
                onMapClick={(lat, lng) => {
                  setNewLat(parseFloat(lat.toFixed(4)));
                  setNewLng(parseFloat(lng.toFixed(4)));
                  setIsAddStudentOpen(true);
                }}
                zoom={12}
                height="500px"
              />
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>📍 Tanlangan Koordinata: <strong>{newLat}, {newLng}</strong></span>
                <span className="text-[11px] font-semibold text-blue-600">💡 Xaritaning istalgan joyiga bosib yangi manzil biriktiring</span>
              </div>
            </div>
          </div>

          {/* Right Fleet Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">
                Avtopark Ro'yxati & Status
              </h3>

              <div className="space-y-3">
                {vehicles.map(v => {
                  const bLoc = busLocations[v.id];
                  const driver = drivers.find(d => d.id === v.id);
                  const isSelected = selectedVehicleId === v.id;

                  return (
                    <div 
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{v.vehicle_name}</span>
                        <span className="text-xs font-mono font-bold bg-slate-950 text-emerald-400 px-2 py-0.5 rounded">
                          {v.plate_number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Haydovchi: <strong>{driver?.user?.first_name} {driver?.user?.last_name}</strong></p>
                      
                      <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t text-slate-600">
                        <span>Tezlik: <strong>{bLoc?.speed || 0} km/h</strong></span>
                        <span className="text-emerald-600 font-semibold">● Faol</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Students & QR Codes Management */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                O'quvchilar Boshqaruvi va QR Kodlar
              </h3>
              <p className="text-xs text-slate-500">O'quvchilar ro'yxati, manzillar va alohida QR kodlar</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Ism yoki sinf bo'yicha izlash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Yangi O'quvchi
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase">
                  <th className="p-3">O'quvchi</th>
                  <th className="p-3">Sinfi</th>
                  <th className="p-3">Kodi</th>
                  <th className="p-3">Ota-onasi / Tel</th>
                  <th className="p-3">Uy Manzili</th>
                  <th className="p-3 text-center">QR Kod</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={st.photo_url} alt={st.first_name} className="w-9 h-9 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{st.first_name} {st.last_name}</p>
                          <p className="text-[10px] text-slate-400">{st.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-indigo-600">{st.class_name}</td>
                    <td className="p-3 font-mono text-slate-600">{st.student_code}</td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{st.primary_parent?.user?.first_name} {st.primary_parent?.user?.last_name}</p>
                      <p className="text-[10px] text-slate-500">{st.primary_parent?.user?.phone}</p>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-slate-800 dark:text-slate-200 font-medium text-xs line-clamp-1">{st.address?.address_text}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {st.address?.is_confirmed ? (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ota-ona Tasdiqlagan
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Tasdiqlanmagan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedStudentForQr(st)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <QRCodeDisplay value={st.qr_code} size={16} /> QR Ko'rish
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            resetStudentAddressRequest(st.id);
                            alert(`${st.first_name} ning ota-onasiga manzilni qayta belgilash so'rovi yuborildi!`);
                          }}
                          title="Ota-ona xato qilgan bo'lsa, manzilni qayta belgilash so'rovini yuborish"
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Qayta Belgilash
                        </button>
                        <button 
                          onClick={() => deleteStudent(st.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition"
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

      {/* TAB 3: Fleet & Drivers */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">
              Avtobuslar (Vehicles)
            </h3>
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{v.vehicle_name}</h4>
                    <p className="text-xs text-slate-500">Model: {v.model} • Sig'imi: {v.capacity} o'quvchi</p>
                  </div>
                  <span className="font-mono text-xs bg-slate-900 text-emerald-400 px-3 py-1 rounded-xl font-bold">
                    {v.plate_number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">
              Haydovchilar (Drivers)
            </h3>
            <div className="space-y-3">
              {drivers.map(d => (
                <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{d.user?.first_name} {d.user?.last_name}</h4>
                    <p className="text-xs text-slate-500">Guvohnoma: {d.license_number} • Tel: {d.user?.phone}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-xl">
                    Faol
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Route Optimization */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg border-b pb-3">
            Marshrutlar Optimizatsiyasi & Pikap Tartibi
          </h3>

          <div className="space-y-4">
            {routes.map(r => (
              <div key={r.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-blue-600">{r.name}</h4>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    Optimal Marshrut Faol
                  </span>
                </div>
                <p className="text-xs text-slate-500">{r.description}</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <p><strong>Pikap ketma-ketligi:</strong> 1-bekat (Yunuso. 11-mavze) ➔ 2-bekat (A.Temur ko'ch.) ➔ 3-bekat (Bodomzor) ➔ Nova Maktab</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg border-b pb-3">
            Tizimdagi Audit Loglar & Amallar Tarixi
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{log.new_data}</p>
                </div>
                <span className="text-slate-400 text-[10px] shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Yangi O'quvchi Qo'shish</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500">Ismi</label>
                <input 
                  type="text" 
                  required
                  value={newFirstName} 
                  onChange={(e) => setNewFirstName(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Familiyasi</label>
                <input 
                  type="text" 
                  required
                  value={newLastName} 
                  onChange={(e) => setNewLastName(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Sinfi</label>
                <input 
                  type="text" 
                  value={newClassName} 
                  onChange={(e) => setNewClassName(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Uy Manzili (Nomi)</label>
                <input 
                  type="text" 
                  value={newAddressText} 
                  onChange={(e) => setNewAddressText(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-xs mt-1"
                  placeholder="Toshkent sh., Yunusobod..."
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Xaritalash / Koordinatalarni belgilash:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Latitude (Kenglik)</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={newLat} 
                      onChange={(e) => setNewLat(parseFloat(e.target.value))} 
                      className="w-full p-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Longitude (Bo'ylama)</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={newLng} 
                      onChange={(e) => setNewLng(parseFloat(e.target.value))} 
                      className="w-full p-1.5 border rounded-lg text-xs"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">Yoki xaritaning istalgan joyiga bosib koordinatani tanlang</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddStudentOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Display Modal */}
      {selectedStudentForQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            
            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                O'zgarmas Doimiy QR Guvohnoma
              </span>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white pt-1">
                {selectedStudentForQr.first_name} {selectedStudentForQr.last_name}
              </h3>
              <p className="text-xs text-indigo-600 font-medium">{selectedStudentForQr.class_name} • {selectedStudentForQr.student_code}</p>
            </div>

            <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <QRCodeDisplay value={selectedStudentForQr.qr_code} size={180} />
            </div>

            <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
              QR kodi: {selectedStudentForQr.qr_code}
            </p>

            <p className="text-[10px] text-slate-500">
              📌 Ushbu QR kod ushbu o'quvchi uchun alohida va doimiy bo'lib, o'quv yili davomida hech qachon o'zgarmaydi.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Chop Etish
              </button>
              <button 
                onClick={() => setSelectedStudentForQr(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-300 transition"
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
