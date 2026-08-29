'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SCHOOL_LOCATION } from '../../lib/mock-data';
import { Student, Vehicle, RouteAlert, EmergencyAlert } from '../../types/database';

// SVG Icon Strings for Leaflet divIcon HTML rendering
const schoolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22V6l-6-4-6 4v16"/><path d="M6 12h12"/><path d="M6 16h12"/></svg>`;
const busSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M18 18h.01"/><path d="M6 18h.01"/><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M4 17v2"/><path d="M20 17v2"/></svg>`;
const sosSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

const createCustomIcon = (color: string, label: string, svgHtml: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 20px;
        padding: 4px 10px;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        border: 2px solid white;
      ">
        <span style="display: flex; align-items: center;">${svgHtml}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [130, 35],
    iconAnchor: [65, 17]
  });
};

// Red Map Drop Pin Marker with Student Photo in the circular head (matches user uploaded image)
const createStudentPhotoPinIcon = (photoUrl: string, name: string, orderNumber: number) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <!-- Red Map Pin Teardrop Shape -->
        <div style="
          width: 46px;
          height: 46px;
          border-radius: 50% 50% 50% 0;
          background: #ef4444;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
          border: 3px solid #dc2626;
        ">
          <!-- Child Photo inside the circular head of the Red Pin -->
          <img src="${photoUrl}" style="
            width: 33px;
            height: 33px;
            border-radius: 50%;
            transform: rotate(45deg);
            object-fit: cover;
            border: 2px solid white;
            background: #ffffff;
          " alt="${name}" />
        </div>
        
        <!-- Student Name Pill Badge -->
        <div style="
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          margin-top: 5px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          border: 1.5px solid white;
        ">
          ${orderNumber}-bekat: ${name}
        </div>
      </div>
    `,
    iconSize: [140, 70],
    iconAnchor: [70, 60]
  });
};

const schoolIcon = createCustomIcon('#2563eb', 'Nova Maktab', schoolSvg);
const busIconActive = createCustomIcon('#16a34a', 'Avtobus (01 777 NVA)', busSvg);
const busIconSos = createCustomIcon('#dc2626', 'SOS - FAVQULODDA!', sosSvg);

interface BusMapProps {
  buses?: Array<{
    vehicle: Vehicle;
    lat: number;
    lng: number;
    speed: number;
  }>;
  students?: Student[];
  routeCoords?: Array<[number, number]>;
  center?: [number, number];
  zoom?: number;
  emergencyAlerts?: EmergencyAlert[];
  routeAlerts?: RouteAlert[];
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

import { useMapEvents } from 'react-leaflet';

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function BusMapContainer({
  buses = [],
  students = [],
  routeCoords = [],
  center = [SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng],
  zoom = 13,
  emergencyAlerts = [],
  routeAlerts = [],
  height = '450px',
  onMapClick
}: BusMapProps) {

  const polylinePoints: [number, number][] = routeCoords.length > 0 
    ? routeCoords 
    : [
        [41.3650, 69.2850],
        ...students.filter(s => s.address).map(s => [s.address!.latitude, s.address!.longitude] as [number, number]),
        [SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]
      ];

  return (
    <div style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden', zIndex: 1 }} className="shadow-lg border border-slate-200 dark:border-slate-800">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter center={center} />
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* School Location Marker */}
        <Marker position={[SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]} icon={schoolIcon}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-blue-600 text-sm">{SCHOOL_LOCATION.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{SCHOOL_LOCATION.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Bus Locations */}
        {buses.map(b => {
          const isSos = emergencyAlerts.some(e => e.vehicle_id === b.vehicle.id && e.status === 'active');
          const hasAlert = routeAlerts.some(r => r.vehicle_id === b.vehicle.id && !r.is_resolved);
          const currentIcon = isSos ? busIconSos : createCustomIcon(hasAlert ? '#eab308' : '#10b981', `${b.vehicle.plate_number} (${b.speed} km/h)`, busSvg);

          return (
            <Marker key={b.vehicle.id} position={[b.lat, b.lng]} icon={currentIcon}>
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <span dangerouslySetInnerHTML={{ __html: busSvg }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.vehicle.vehicle_name}</h4>
                      <p className="text-xs font-semibold text-emerald-600">{b.vehicle.plate_number}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 border-t pt-2">
                    <p><strong>Hozirgi tezlik:</strong> {b.speed} km/h</p>
                    <p><strong>Koordinatalar:</strong> {b.lat.toFixed(4)}, {b.lng.toFixed(4)}</p>
                    <p><strong>Sig'imi:</strong> {b.vehicle.capacity} o'quvchi</p>
                    {isSos && (
                      <p className="text-red-600 font-bold bg-red-50 p-1 rounded mt-1">FAVQULODDA SOS SIZGA KELDI</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Student Home Markers with Red Pin and Child Photo */}
        {students.map((student, idx) => {
          if (!student.address) return null;

          const studentIcon = createStudentPhotoPinIcon(student.photo_url, student.first_name, idx + 1);

          return (
            <Marker 
              key={student.id} 
              position={[student.address.latitude, student.address.longitude]} 
              icon={studentIcon}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2.5 mb-1">
                    <img 
                      src={student.photo_url} 
                      alt={student.first_name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shadow"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.first_name} {student.last_name}</h4>
                      <p className="text-xs text-indigo-600 font-medium">{student.class_name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1"><strong>Manzil:</strong> {student.address.address_text}</p>
                  {student.address.pickup_note && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-1 rounded mt-1">📌 {student.address.pickup_note}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line */}
        {polylinePoints.length > 1 && (
          <Polyline 
            positions={polylinePoints} 
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '8, 8' }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
