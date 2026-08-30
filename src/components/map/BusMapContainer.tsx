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

// 1. Top-Down Yellow Vehicle with Drop Shadow (Matches Yandex Go / Yandex Maps uploaded image)
const createTopDownBusIcon = (plateNumber: string, speed: number, heading = 25) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -50%);
      ">
        <!-- Top-Down Yellow Vehicle SVG with 3D shadow -->
        <div style="
          transform: rotate(${heading}deg);
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.4));
        ">
          <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <!-- Plate & Speed pill badge -->
        <div style="
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
          margin-top: -2px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          border: 1.5px solid #facc15;
        ">
          ${plateNumber} (${speed} km/h)
        </div>
      </div>
    `,
    iconSize: [110, 65],
    iconAnchor: [55, 32]
  });
};

// 2. Yandex Yellow Floating ETA Speech Bubble (Exact match to uploaded image: "3 daq")
const createYandexEtaBubbleIcon = (minutes: number) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #fbbf24;
          color: #0f172a;
          font-weight: 900;
          padding: 5px 14px;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.45);
          text-align: center;
          position: relative;
          border: 2px solid #ffffff;
        ">
          <div style="font-size: 18px; line-height: 1.1; font-weight: 900;">${minutes}</div>
          <div style="font-size: 11px; font-weight: 800; margin-top: -2px;">daq</div>
          
          <!-- Bottom Pointer Arrow -->
          <div style="
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 7px solid #fbbf24;
          "></div>
        </div>

        <!-- Target Pulse Circle below pointer -->
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #ea580c;
          margin-top: 8px;
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.25);
        "></div>
      </div>
    `,
    iconSize: [90, 80],
    iconAnchor: [45, 75]
  });
};

// 3. Yandex White Destination Speech Bubble (Exact match: "10:18 da yetib keladi")
const createYandexDestinationBubbleIcon = (timeStr: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #ffffff;
          color: #0f172a;
          font-weight: 800;
          font-size: 13px;
          padding: 7px 16px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          text-align: center;
          position: relative;
          border: 1.5px solid #e2e8f0;
          white-space: nowrap;
        ">
          <span>${timeStr} da yetib keladi</span>
          
          <!-- Bottom Pointer Arrow -->
          <div style="
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 7px solid #ffffff;
          "></div>
        </div>

        <!-- Destination Target Ring below pointer -->
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #475569;
          margin-top: 7px;
          box-shadow: 0 0 0 4px rgba(71, 85, 105, 0.25);
        "></div>
      </div>
    `,
    iconSize: [180, 75],
    iconAnchor: [90, 70]
  });
};

// Red Map Drop Pin Marker with Student Photo
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

  // Full turn-by-turn road points along Tashkent street network
  const fullRoutePath: Array<[number, number]> = routeCoords.length > 0 
    ? routeCoords 
    : ROUTE_STREET_PATHS[1] || [];

  // Break route into traffic condition segments (Green = Free, Yellow = Moderate, Red = Traffic Jam)
  // Exact match to the uploaded Yandex Go image!
  const seg1 = fullRoutePath.slice(0, 5);
  const seg2 = fullRoutePath.slice(4, 8);
  const seg3 = fullRoutePath.slice(7, 11);
  const seg4 = fullRoutePath.slice(10, fullRoutePath.length);

  const activeBus = buses[0];
  const busLat = activeBus ? activeBus.lat : fullRoutePath[0]?.[0] || 41.3652;
  const busLng = activeBus ? activeBus.lng : fullRoutePath[0]?.[1] || 69.2854;

  const destinationBubbleIcon = createYandexDestinationBubbleIcon("07:55");
  const etaBubbleIcon = createYandexEtaBubbleIcon(3);

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

        {/* 1. Destination Bubble Pin at Nova Maktab (Matches Yandex "[10:18 da yetib keladi]" bubble) */}
        <Marker position={[SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]} icon={destinationBubbleIcon}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-blue-600 text-sm">{SCHOOL_LOCATION.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{SCHOOL_LOCATION.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* 2. Yellow Floating ETA Bubble ("3 daq") at Bus Location */}
        {activeBus && (
          <Marker position={[busLat - 0.002, busLng - 0.002]} icon={etaBubbleIcon} />
        )}

        {/* 3. Top-Down Yellow Vehicles with Real Headings */}
        {buses.map(b => {
          const isSos = emergencyAlerts.some(e => e.vehicle_id === b.vehicle.id && e.status === 'active');
          const currentIcon = isSos ? busIconSos : createTopDownBusIcon(b.vehicle.plate_number, b.speed, 35);

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

        {/* 4. Student Home Markers with Red Pin and Child Photo */}
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

        {/* 5. Yandex Multi-Colored Traffic Polyline (Green - Amber - Red - Green) */}
        {seg1.length > 1 && (
          <Polyline 
            positions={seg1} 
            pathOptions={{ color: '#22c55e', weight: 6.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg2.length > 1 && (
          <Polyline 
            positions={seg2} 
            pathOptions={{ color: '#eab308', weight: 6.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg3.length > 1 && (
          <Polyline 
            positions={seg3} 
            pathOptions={{ color: '#ef4444', weight: 6.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
        {seg4.length > 1 && (
          <Polyline 
            positions={seg4} 
            pathOptions={{ color: '#22c55e', weight: 6.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
