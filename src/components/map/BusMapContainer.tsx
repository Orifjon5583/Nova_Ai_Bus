'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { SCHOOL_LOCATION, ROUTE_STREET_PATHS } from '../../lib/mock-data';
import { Student, Vehicle, RouteAlert, EmergencyAlert } from '../../types/database';
import { fetchRealRoadRoute } from '../../lib/routing';

const MAPTILER_KEY = 'GWgqgaHGL6LiYlf1JeDi';
maptilersdk.config.apiKey = MAPTILER_KEY;

// Calculate heading angle in degrees along road tangent
function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

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
  followBus?: boolean;
}

export default function BusMapContainer({
  buses = [],
  students = [],
  routeCoords = [],
  center = [41.5420, 60.6350],
  zoom = 14,
  emergencyAlerts = [],
  routeAlerts = [],
  height = '450px',
  onMapClick,
  followBus = false
}: BusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const busMarkerRef = useRef<maptilersdk.Marker | null>(null);
  const studentMarkersRef = useRef<maptilersdk.Marker[]>([]);
  const schoolMarkerRef = useRef<maptilersdk.Marker | null>(null);

  // Dynamic high-precision road path state from MapTiler Directions engine
  const [roadCoordinates, setRoadCoordinates] = useState<Array<[number, number]>>(
    routeCoords.length > 0 ? routeCoords : ROUTE_STREET_PATHS[1] || []
  );

  // Synchronized movement index along the exact MapTiler road coordinates
  const [activeCarPathIndex, setActiveCarPathIndex] = useState(0);

  // Default active bus vehicle info
  const effectiveBus = (buses && buses.length > 0) ? buses[0] : {
    vehicle: { id: 1, plate_number: '01 777 NVA', vehicle_name: 'Nova Bus #1', capacity: 24, model: 'Isuzu HD' } as Vehicle,
    lat: 41.5620,
    lng: 60.6120,
    speed: 42,
    heading: 140
  };

  // 1. Fetch MapTiler Directions Turn-by-Turn Road Geometry
  useEffect(() => {
    let isMounted = true;
    const waypoints: Array<[number, number]> = routeCoords.length > 0 
      ? routeCoords 
      : [
          [41.5620, 60.6120], // Ali (Al-Xorazmiy shoh ko'chasi, Urganch)
          ...students.filter(s => s.address && s.status === 'active').map(s => [s.address!.latitude, s.address!.longitude] as [number, number]),
          [SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]
        ];

    fetchRealRoadRoute(waypoints).then(coords => {
      if (isMounted && coords && coords.length > 1) {
        setRoadCoordinates(coords);
      }
    });

    return () => { isMounted = false; };
  }, [students, routeCoords]);

  // 2. Initialize 2D Flat MapTiler Vector Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center in [lng, lat] for MapTiler / MapLibre GL
    const initialCenter: [number, number] = [center[1], center[0]];

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: initialCenter,
      zoom: zoom,
      pitch: 0, // 2D flat view for clear mobile navigation
      bearing: 0,
      touchPitch: false,
      navigationControl: 'bottom-right',
      geolocateControl: false
    });

    mapInstanceRef.current = map;

    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    });

    return () => {
      if (busMarkerRef.current) busMarkerRef.current.remove();
      if (schoolMarkerRef.current) schoolMarkerRef.current.remove();
      studentMarkersRef.current.forEach(m => m.remove());
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Update Map Center & Zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!followBus) {
      map.easeTo({
        center: [center[1], center[0]],
        zoom: zoom,
        duration: 800
      });
    }
  }, [center, zoom, followBus]);

  // 4. Draw MapTiler Directions Traffic Polylines (GeoJSON Layers)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      if (roadCoordinates.length < 2) return;

      const geoPoints = roadCoordinates.map(([lat, lng]) => [lng, lat]);
      const segLength = Math.max(2, Math.floor(geoPoints.length / 4));
      
      const seg1 = geoPoints.slice(0, segLength + 1);
      const seg2 = geoPoints.slice(segLength, segLength * 2 + 1);
      const seg3 = geoPoints.slice(segLength * 2, segLength * 3 + 1);
      const seg4 = geoPoints.slice(segLength * 3, geoPoints.length);

      const segments = [
        { id: 'traffic-seg-1', data: seg1, color: '#22c55e' }, // Green (Free Flow)
        { id: 'traffic-seg-2', data: seg2, color: '#eab308' }, // Yellow (Moderate)
        { id: 'traffic-seg-3', data: seg3, color: '#ef4444' }, // Red (Traffic Jam)
        { id: 'traffic-seg-4', data: seg4, color: '#22c55e' }  // Green (Free Flow)
      ];

      segments.forEach(seg => {
        if (map.getLayer(seg.id)) map.removeLayer(seg.id);
        if (map.getLayer(`${seg.id}-glow`)) map.removeLayer(`${seg.id}-glow`);
        if (map.getSource(seg.id)) map.removeSource(seg.id);

        if (seg.data.length > 1) {
          map.addSource(seg.id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: seg.data
              }
            }
          });

          // Outer casing
          map.addLayer({
            id: `${seg.id}-glow`,
            type: 'line',
            source: seg.id,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 0.9
            }
          });

          // Main line
          map.addLayer({
            id: seg.id,
            type: 'line',
            source: seg.id,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': seg.color,
              'line-width': 5.5,
              'line-opacity': 0.95
            }
          });
        }
      });
    };

    if (map.isStyleLoaded()) {
      onStyleLoad();
    } else {
      map.on('load', onStyleLoad);
    }
  }, [roadCoordinates]);

  // 5. Render School Marker ("07:55 da yetib keladi")
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.remove();
    }

    const schoolEl = document.createElement('div');
    schoolEl.style.cssText = 'display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translateY(-4px); z-index: 40;';
    schoolEl.innerHTML = `
      <div style="
        background: #ffffff;
        color: #0f172a;
        font-weight: 900;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        text-align: center;
        position: relative;
        border: 2px solid #3b82f6;
        white-space: nowrap;
      ">
        <span>07:55 da yetib keladi</span>
        <div style="
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #3b82f6;
        "></div>
      </div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #3b82f6;
        border: 2.5px solid #ffffff;
        margin-top: 4px;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
      "></div>
    `;

    const marker = new maptilersdk.Marker({ element: schoolEl, anchor: 'bottom' })
      .setLngLat([SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat])
      .setPopup(new maptilersdk.Popup({ offset: 20 }).setHTML(`
        <div style="padding: 4px;">
          <h4 style="font-weight: bold; color: #2563eb; margin: 0; font-size: 13px;">${SCHOOL_LOCATION.name}</h4>
          <p style="font-size: 11px; color: #64748b; margin-top: 3px;">${SCHOOL_LOCATION.address}</p>
        </div>
      `))
      .addTo(map);

    schoolMarkerRef.current = marker;
  }, []);

  // 6. Render Student Home Photo Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    studentMarkersRef.current.forEach(m => m.remove());
    studentMarkersRef.current = [];

    students.forEach((student, idx) => {
      if (!student.address) return;

      const studentEl = document.createElement('div');
      studentEl.style.cssText = 'display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 35;';
      studentEl.innerHTML = `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          background: #ef4444;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
          border: 2px solid #dc2626;
        ">
          <img src="${student.photo_url}" style="
            width: 25px;
            height: 25px;
            border-radius: 50%;
            transform: rotate(45deg);
            object-fit: cover;
            border: 1.5px solid white;
            background: #ffffff;
          " alt="${student.first_name}" />
        </div>
        <div style="
          background: #0f172a;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 1.5px 6px;
          border-radius: 8px;
          margin-top: 2px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 1px solid white;
        ">
          ${idx + 1}-bekat: ${student.first_name}
        </div>
      `;

      const marker = new maptilersdk.Marker({ element: studentEl, anchor: 'bottom' })
        .setLngLat([student.address.longitude, student.address.latitude])
        .setPopup(new maptilersdk.Popup({ offset: 20 }).setHTML(`
          <div style="padding: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
              <img src="${student.photo_url}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
              <div>
                <h4 style="font-weight: bold; margin: 0; font-size: 12px;">${student.first_name} ${student.last_name}</h4>
                <p style="font-size: 10px; color: #4f46e5; margin: 0;">${student.class_name}</p>
              </div>
            </div>
            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0;"><strong>Manzil:</strong> ${student.address.address_text}</p>
          </div>
        `))
        .addTo(map);

      studentMarkersRef.current.push(marker);
    });
  }, [students]);

  // 7. Advance car step-by-step along the exact MapTiler road coordinates
  useEffect(() => {
    if (roadCoordinates.length === 0) return;
    const interval = setInterval(() => {
      setActiveCarPathIndex(prev => (prev + 1) % roadCoordinates.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [roadCoordinates]);

  // 8. Render & Animate Vehicle Marker on MapTiler Polyline (100% visible with high z-index)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || roadCoordinates.length === 0) return;

    const isSos = emergencyAlerts.some(e => e.vehicle_id === effectiveBus.vehicle.id && e.status === 'active');
    const curIndex = activeCarPathIndex % roadCoordinates.length;
    const nextIndex = (curIndex + 1) % roadCoordinates.length;
    const currentPos = roadCoordinates[curIndex] || [effectiveBus.lat, effectiveBus.lng];
    const nextPos = roadCoordinates[nextIndex] || currentPos;
    const heading = calculateHeading(currentPos[0], currentPos[1], nextPos[0], nextPos[1]);

    if (!busMarkerRef.current) {
      const carEl = document.createElement('div');
      carEl.className = 'maptiler-bus-marker';
      carEl.style.cssText = 'width: 120px; display: flex; flex-direction: column; align-items: center; cursor: pointer; pointer-events: auto; z-index: 100 !important;';

      const marker = new maptilersdk.Marker({ element: carEl, anchor: 'center' })
        .setLngLat([currentPos[1], currentPos[0]])
        .addTo(map);

      busMarkerRef.current = marker;
    }

    const marker = busMarkerRef.current;
    marker.setLngLat([currentPos[1], currentPos[0]]);

    if (followBus) {
      map.easeTo({
        center: [currentPos[1], currentPos[0]],
        duration: 1000
      });
    }

    const carEl = marker.getElement();
    carEl.innerHTML = `
      <!-- Yellow ETA Bubble attached directly on top of the car -->
      <div style="
        background: #fbbf24;
        color: #0f172a;
        font-weight: 900;
        padding: 3px 10px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
        text-align: center;
        position: relative;
        border: 2px solid #ffffff;
        margin-bottom: 2px;
        z-index: 102;
      ">
        <div style="font-size: 13px; line-height: 1.1; font-weight: 900;">3</div>
        <div style="font-size: 8.5px; font-weight: 800; margin-top: -2px;">daq</div>
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

      <!-- Top-Down 2D Yellow Vehicle SVG with clear drop shadow -->
      <div style="
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${heading}deg);
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        transition: transform 0.3s ease;
        z-index: 101;
      ">
        <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <!-- Plate & Speed badge -->
      <div style="
        background: ${isSos ? '#dc2626' : 'rgba(15, 23, 42, 0.95)'};
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 8px;
        margin-top: 1px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        border: 1.5px solid #facc15;
        z-index: 102;
      ">
        ${isSos ? '🚨 SOS' : `${effectiveBus.vehicle.plate_number} (${effectiveBus.speed} km/h)`}
      </div>
    `;
  }, [effectiveBus, activeCarPathIndex, roadCoordinates, emergencyAlerts, followBus]);

  return (
    <div 
      style={{ height, width: '100%', borderRadius: '24px', overflow: 'hidden', zIndex: 1 }} 
      className="shadow-2xl border border-slate-200 dark:border-slate-800 relative bg-slate-950"
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
