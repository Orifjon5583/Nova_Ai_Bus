'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SCHOOL_LOCATION, ROUTE_STREET_PATHS } from '../../lib/mock-data';
import { Student, Vehicle, RouteAlert, EmergencyAlert } from '../../types/database';

// SVG Icon Strings for Leaflet divIcon HTML rendering
const schoolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22V6l-6-4-6 4v16"/><path d="M6 12h12"/><path d="M6 16h12"/></svg>`;
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

// 1. Pixel-Perfect Yandex Vehicle with Integrated "3 daq" ETA Bubble on top (100% centered on road line)
const createYandexBusMarkerIcon = (plateNumber: string, speed: number, etaMinutes = 3, heading = 0) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0;
        padding: 0;
      ">
        <!-- 1. Yellow ETA Bubble on top of the car -->
        <div style="
          background: #fbbf24;
          color: #0f172a;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.45);
          text-align: center;
          position: relative;
          border: 2px solid #ffffff;
          margin-bottom: 2px;
        ">
          <div style="font-size: 13px; line-height: 1.1; font-weight: 900;">${etaMinutes}</div>
          <div style="font-size: 9px; font-weight: 800; margin-top: -2px;">daq</div>
          
          <!-- Bottom Pointer Arrow -->
          <div style="
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #fbbf24;
          "></div>
        </div>

        <!-- 2. Top-Down Yellow Vehicle SVG centered at X=60px, Y=53px -->
        <div style="
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));
          transition: transform 0.3s ease;
        ">
          <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="50" height="80" rx="18" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
            <rect x="32" y="28" width="36" height="44" rx="8" fill="#eab308"/>
            <path d="M33 28 C33 20 67 20 67 28 L64 36 L36 36 Z" fill="#0f172a"/>
            <path d="M36 64 L64 64 L67 72 C67 80 33 80 33 72 Z" fill="#0f172a"/>
            <rect x="29" y="38" width="5" height="24" rx="2" fill="#0f172a"/>
            <rect x="66" y="38" width="5" height="24" rx="2" fill="#0f172a"/>
            <rect x="28" y="12" width="10" height="5" rx="2" fill="#ffffff"/>
            <rect x="62" y="12" width="10" height="5" rx="2" fill="#ffffff"/>
            <rect x="28" y="83" width="10" height="5" rx="2" fill="#ef4444"/>
            <rect x="62" y="83" width="10" height="5" rx="2" fill="#ef4444"/>
          </svg>
        </div>

        <!-- 3. Plate & Speed pill badge -->
        <div style="
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 8px;
          margin-top: 1px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          border: 1px solid #facc15;
        ">
          ${plateNumber} (${speed} km/h)
        </div>
      </div>
    `,
    iconSize: [120, 88],
    iconAnchor: [60, 53] // Center of the 38x38 car SVG is at X=60px, Y=53px!
  });
};

// 2. Yandex White Destination Speech Bubble ("07:55 da yetib keladi")
const createYandexDestinationBubbleIcon = (timeStr: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0;
        padding: 0;
      ">
        <div style="
          background: #ffffff;
          color: #0f172a;
          font-weight: 800;
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.22);
          text-align: center;
          position: relative;
          border: 1.5px solid #cbd5e1;
          white-space: nowrap;
        ">
          <span>${timeStr} da yetib keladi</span>
          
          <!-- Bottom Pointer Arrow -->
          <div style="
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #ffffff;
          "></div>
        </div>

        <!-- Destination Target Ring below pointer -->
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 3.5px solid #334155;
          margin-top: 5px;
          box-shadow: 0 0 0 3px rgba(51, 65, 85, 0.2);
        "></div>
      </div>
    `,
    iconSize: [160, 50],
    iconAnchor: [80, 43]
  });
};

// 3. Red Map Drop Pin Marker with Student Photo
const createStudentPhotoPinIcon = (photoUrl: string, name: string, orderNumber: number) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0;
        padding: 0;
      ">
        <!-- Red Map Pin Teardrop Shape -->
        <div style="
          width: 42px;
          height: 42px;
          border-radius: 50% 50% 50% 0;
          background: #ef4444;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.5);
          border: 2px solid #dc2626;
        ">
          <img src="${photoUrl}" style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            transform: rotate(45deg);
            object-fit: cover;
            border: 2px solid white;
            background: #ffffff;
          " alt="${name}" />
        </div>
        
        <div style="
          background: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
          margin-top: 2px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          border: 1.5px solid white;
        ">
          ${orderNumber}-bekat: ${name}
        </div>
      </div>
    `,
    iconSize: [120, 68],
    iconAnchor: [60, 42]
  });
};

const busIconSos = createCustomIcon('#dc2626', 'SOS - FAVQULODDA!', sosSvg);

interface BusMapProps {
  buses?: Array<{
    vehicle: Vehicle;
    lat: number;
    lng: number;
    speed: number;
    heading?: number;
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
  center = [41.3400, 69.2650],
  zoom = 13,
  emergencyAlerts = [],
  routeAlerts = [],
  height = '450px',
  onMapClick
}: BusMapProps) {

  // Continuous fine-grained road points along Tashkent street network
  const roadCoordinates: Array<[number, number]> = routeCoords.length > 0 
    ? routeCoords 
    : ROUTE_STREET_PATHS[1] || [];

  // Break real road into traffic condition segments (Green = Free, Yellow = Moderate, Red = Traffic Jam)
  const segLength = Math.max(2, Math.floor(roadCoordinates.length / 4));
  const seg1 = roadCoordinates.slice(0, segLength + 1);
  const seg2 = roadCoordinates.slice(segLength, segLength * 2 + 1);
  const seg3 = roadCoordinates.slice(segLength * 2, segLength * 3 + 1);
  const seg4 = roadCoordinates.slice(segLength * 3, roadCoordinates.length);

  const destinationBubbleIcon = createYandexDestinationBubbleIcon("07:55");

  return (
    <div style={{ height, width: '100%', borderRadius: '24px', overflow: 'hidden', zIndex: 1 }} className="shadow-2xl border border-slate-200 dark:border-slate-800 relative">
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

        {/* 1. Destination Bubble Pin at Nova Maktab */}
        <Marker position={[SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]} icon={destinationBubbleIcon}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-blue-600 text-sm">{SCHOOL_LOCATION.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{SCHOOL_LOCATION.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* 2. Top-Down Yellow Vehicles advancing in real-time strictly on polyline */}
        {buses.map(b => {
          const isSos = emergencyAlerts.some(e => e.vehicle_id === b.vehicle.id && e.status === 'active');
          const currentIcon = isSos 
            ? busIconSos 
            : createYandexBusMarkerIcon(b.vehicle.plate_number, b.speed, 3, b.heading || 160);

          return (
            <Marker key={b.vehicle.id} position={[b.lat, b.lng]} icon={currentIcon}>
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <span dangerouslySetInnerHTML={{ __html: schoolSvg }} />
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

        {/* 3. Student Home Markers with Red Pin and Child Photo */}
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

        {/* 4. Real Road Traffic-Colored Polyline (Green - Amber - Red - Green) */}
        {seg1.length > 1 && (
          <Polyline 
            positions={seg1} 
            pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg2.length > 1 && (
          <Polyline 
            positions={seg2} 
            pathOptions={{ color: '#eab308', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg3.length > 1 && (
          <Polyline 
            positions={seg3} 
            pathOptions={{ color: '#ef4444', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg4.length > 1 && (
          <Polyline 
            positions={seg4} 
            pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
