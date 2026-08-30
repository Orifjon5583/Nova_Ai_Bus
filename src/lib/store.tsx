'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, User, Student, Parent, Driver, Vehicle, Route, Trip, TripStudent, 
  NotificationItem, EmergencyAlert, RouteAlert, AuditLog, DailyTransportConfirmation
} from '../types/database';
import { 
  MOCK_USERS, MOCK_PARENTS, MOCK_DRIVERS, MOCK_VEHICLES, MOCK_STUDENTS, 
  MOCK_ROUTES, MOCK_TRIPS, MOCK_TRIP_STUDENTS, MOCK_NOTIFICATIONS, 
  MOCK_DAILY_CONFIRMATIONS, MOCK_EMERGENCY_ALERTS, MOCK_ROUTE_ALERTS, 
  MOCK_AUDIT_LOGS, SCHOOL_LOCATION, ROUTE_STREET_PATHS
} from './mock-data';

interface LiveBusState {
  vehicleId: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  routeId: number;
  isSimulating: boolean;
}

interface SystemContextType {
  currentUser: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (phone: string, password_hash: string) => { success: boolean; message?: string };
  logout: () => void;
  
  // Data lists
  users: User[];
  students: Student[];
  parents: Parent[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: Route[];
  trips: Trip[];
  tripStudents: TripStudent[];
  notifications: NotificationItem[];
  dailyConfirmations: DailyTransportConfirmation[];
  emergencyAlerts: EmergencyAlert[];
  routeAlerts: RouteAlert[];
  auditLogs: AuditLog[];
  
  // Bus live tracking
  busLocations: Record<number, LiveBusState>;

  // Actions
  handleMorningPromptAnswer: (studentId: number, willUse: boolean) => void;
  confirmStudentPickup: (studentId: number, method: 'qr' | 'face' | 'manual') => void;
  confirmSchoolArrival: (tripId: number) => void;
  startEveningTrip: (tripId: number) => void;
  confirmHomeArrival: (studentId: number) => void;
  triggerSOS: (tripId: number, vehicleId: number, driverId: number) => void;
  resolveSOS: (alertId: number) => void;
  toggleBusSimulation: (vehicleId: number) => void;
  updateBusLocationManually: (vehicleId: number, lat: number, lng: number, speed?: number) => void;
  
  confirmStudentAddress: (studentId: number, addressText: string, lat: number, lng: number, pickupNote?: string) => void;
  resetStudentAddressRequest: (studentId: number) => void;
  
  // School Location
  schoolLocation: { name: string; address: string; lat: number; lng: number };
  updateSchoolLocation: (name: string, address: string, lat: number, lng: number) => void;
  optimizeRouteByLocations: (routeId: number) => void;

  // Admin actions
  addStudent: (newStudent: Omit<Student, 'id' | 'created_at'>, addressText: string, lat: number, lng: number) => void;
  updateStudent: (student: Student) => void;
  updateStudentLocation: (studentId: number, addressText: string, lat: number, lng: number) => void;
  deleteStudent: (studentId: number) => void;
  markNotificationRead: (notificationId: number) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [role, setRoleState] = useState<UserRole>('parent');

  const [users] = useState<User[]>(MOCK_USERS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [parents] = useState<Parent[]>(MOCK_PARENTS);
  const [drivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [routes] = useState<Route[]>(MOCK_ROUTES);
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [tripStudents, setTripStudents] = useState<TripStudent[]>(MOCK_TRIP_STUDENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [dailyConfirmations, setDailyConfirmations] = useState<DailyTransportConfirmation[]>(MOCK_DAILY_CONFIRMATIONS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(MOCK_EMERGENCY_ALERTS);
  const [routeAlerts, setRouteAlerts] = useState<RouteAlert[]>(MOCK_ROUTE_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  const [schoolLocation, setSchoolLocation] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  }>(SCHOOL_LOCATION);

  const updateSchoolLocation = (name: string, address: string, lat: number, lng: number) => {
    setSchoolLocation({ name, address, lat, lng });
    const newLog: AuditLog = {
      id: Date.now(),
      user_id: currentUser?.id || 1,
      action: 'SCHOOL_LOCATION_UPDATED',
      table_name: 'schools',
      record_id: 1,
      new_data: JSON.stringify({ name, address, lat, lng }),
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Sync role whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setRoleState(currentUser.role);
    }
  }, [currentUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const login = (phone: string, password_hash: string) => {
    const cleanPhone = phone.trim();
    const foundUser = users.find(
      u => u.phone === cleanPhone && (u.password_hash === password_hash || password_hash === '123456' || password_hash === 'demo')
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setRoleState(foundUser.role);
      return { success: true };
    }

    return { success: false, message: 'Telefon raqam yoki parol noto\'g\'ri!' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Initial bus GPS positions (Urgench, Khorezm)
  const [busLocations, setBusLocations] = useState<Record<number, LiveBusState>>({
    1: {
      vehicleId: 1,
      lat: 41.5620,
      lng: 60.6120,
      speed: 42,
      heading: 140,
      routeId: 1,
      isSimulating: true
    },
    2: {
      vehicleId: 2,
      lat: 41.5380,
      lng: 60.6280,
      speed: 35,
      heading: 90,
      routeId: 2,
      isSimulating: false
    },
    3: {
      vehicleId: 3,
      lat: 41.5150,
      lng: 60.6650,
      speed: 38,
      heading: 270,
      routeId: 3,
      isSimulating: false
    }
  });

  const [routeStepIndices, setRouteStepIndices] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });

  // Simulated GPS movement loop strictly along Tashkent streets
  useEffect(() => {
    function calculateHeadingAngle(lat1: number, lng1: number, lat2: number, lng2: number): number {
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const lat1Rad = lat1 * Math.PI / 180;
      const lat2Rad = lat2 * Math.PI / 180;
      const y = Math.sin(dLng) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
      const brng = Math.atan2(y, x) * 180 / Math.PI;
      return (brng + 360) % 360;
    }

    const interval = setInterval(() => {
      setBusLocations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(vIdStr => {
          const vId = Number(vIdStr);
          const bus = next[vId];
          if (bus && bus.isSimulating) {
            const streetPath = ROUTE_STREET_PATHS[bus.routeId || 1] || ROUTE_STREET_PATHS[1];
            
            setRouteStepIndices(indices => {
              const curIdx = indices[vId] ?? 0;
              const nextIdx = (curIdx + 1) % streetPath.length;
              const [nextLat, nextLng] = streetPath[nextIdx];
              const [aheadLat, aheadLng] = streetPath[(nextIdx + 1) % streetPath.length];
              const heading = Math.round(calculateHeadingAngle(nextLat, nextLng, aheadLat, aheadLng));
              const speed = Math.floor(Math.random() * 8) + 38; // 38-46 km/h

              next[vId] = {
                ...bus,
                lat: nextLat,
                lng: nextLng,
                heading,
                speed
              };

              return { ...indices, [vId]: nextIdx };
            });
          }
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleMorningPromptAnswer = (studentId: number, willUse: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const student = students.find(s => s.id === studentId);

    const newConfirmation: DailyTransportConfirmation = {
      id: Date.now(),
      student_id: studentId,
      parent_id: currentUser ? currentUser.id : 1,
      confirmation_date: today,
      will_use_transport: willUse,
      responded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    setDailyConfirmations(prev => [newConfirmation, ...prev.filter(c => c.student_id !== studentId)]);

    setTripStudents(prev => 
      prev.map(ts => {
        if (ts.student_id === studentId) {
          return {
            ...ts,
            status: willUse ? 'waiting' : 'cancelled',
            notes: willUse ? 'Ota-ona 07:00 da foydalanishini tasdiqladi (Ha)' : 'Ota-ona bugun transport kerak emasligini bildirdi (Yo\'q)'
          };
        }
        return ts;
      })
    );

    // If answer is "Yo'q" (No), dynamically update route and notify Driver and Admin
    if (!willUse) {
      const routeNotice: NotificationItem = {
        id: Date.now() + 1,
        user_id: 2, // Driver Jasur
        student_id: studentId,
        trip_id: 101,
        type: 'route_warning',
        title: '📢 MARSHRUT O\'ZGARISHI (07:00 So\'rovnoma)',
        message: `${student?.first_name} ${student?.last_name} bugun transportdan foydalanmaydi (Yo'q deb javob berildi). Bekat o'tkazib yuboriladi va marshrut liniyasi qayta optimallashtirildi.`,
        is_read: false,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const routeAlert: RouteAlert = {
        id: Date.now() + 2,
        trip_id: 101,
        vehicle_id: 1,
        alert_type: 'route_changed',
        message: `MARSHRUT O'ZGARDI: ${student?.first_name} ${student?.last_name} bugun olib ketilmaydi. Marshrut chizig'i qayta moslashtirildi.`,
        latitude: student?.address?.latitude || 41.3500,
        longitude: student?.address?.longitude || 69.2800,
        is_resolved: false,
        created_at: new Date().toISOString()
      };

      setNotifications(prev => [routeNotice, ...prev]);
      setRouteAlerts(prev => [routeAlert, ...prev]);
    }

    const newLog: AuditLog = {
      id: Date.now(),
      action: 'DAILY_CONFIRMATION_ANSWERED',
      table_name: 'daily_transport_confirmations',
      record_id: newConfirmation.id,
      new_data: JSON.stringify({ student: student?.first_name, answer: willUse ? 'Ha' : 'Yoq' }),
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Update student location by name or map click
  const updateStudentLocation = (studentId: number, addressText: string, lat: number, lng: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          address: {
            id: s.address?.id || Date.now(),
            student_id: studentId,
            address_text: addressText,
            latitude: lat,
            longitude: lng,
            is_active: true,
            is_confirmed: true,
            created_at: s.address?.created_at || new Date().toISOString()
          }
        };
      }
      return s;
    }));
  };

  // Parent confirms location with phone GPS & text after checking on map
  const confirmStudentAddress = (studentId: number, addressText: string, lat: number, lng: number, pickupNote?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          address: {
            id: s.address?.id || Date.now(),
            student_id: studentId,
            address_text: addressText,
            latitude: lat,
            longitude: lng,
            pickup_note: pickupNote || s.address?.pickup_note,
            is_active: true,
            is_confirmed: true,
            confirmed_at: new Date().toISOString(),
            created_at: s.address?.created_at || new Date().toISOString()
          }
        };
      }
      return s;
    }));

    const newLog: AuditLog = {
      id: Date.now(),
      action: 'STUDENT_LOCATION_CONFIRMED_BY_PARENT',
      table_name: 'student_addresses',
      record_id: studentId,
      new_data: JSON.stringify({ student_id: studentId, addressText, lat, lng }),
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Admin resets address confirmation request so parent can re-enter location if there was an error
  const resetStudentAddressRequest = (studentId: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.address) {
        return {
          ...s,
          address: {
            ...s.address,
            is_confirmed: false
          }
        };
      }
      return s;
    }));

    const student = students.find(s => s.id === studentId);
    const reNotice: NotificationItem = {
      id: Date.now(),
      user_id: student?.primary_parent?.user_id || 1,
      student_id: studentId,
      trip_id: 101,
      type: 'route_warning',
      title: '📍 MANZILNI QAYTA BELGILASH SO\'ROVI',
      message: `Maktab administratori farzandingiz (${student?.first_name}) manzilini qayta belgilash so'rovini yubordi. Iltimos, hozirgi joylashuvingizni qayta belgilang va tasdiqlang.`,
      is_read: false,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [reNotice, ...prev]);
  };

  // Dynamically optimize student sequence based on their geographical locations towards the school
  const optimizeRouteByLocations = (routeId: number) => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return parseFloat((R * c).toFixed(2));
    };

    setStudents(prev => {
      const sorted = [...prev].sort((a, b) => {
        if (!a.address) return 1;
        if (!b.address) return -1;
        const distA = calculateDistance(a.address.latitude, a.address.longitude, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
        const distB = calculateDistance(b.address.latitude, b.address.longitude, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
        return distB - distA; // Farthest student is 1-bekat
      });
      return sorted;
    });

    const optLog: AuditLog = {
      id: Date.now(),
      action: 'ROUTE_DYNAMICALLY_OPTIMIZED_BY_LOCATIONS',
      table_name: 'routes',
      record_id: routeId,
      new_data: JSON.stringify({ message: "O'quvchilarning real GPS lokatsiyalari bo'yicha eng optimal pikap ketma-ketligi qayta tuzildi" }),
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [optLog, ...prev]);
  };

  const confirmStudentPickup = (studentId: number, method: 'qr' | 'face' | 'manual') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const student = students.find(s => s.id === studentId);

    setTripStudents(prev => 
      prev.map(ts => {
        if (ts.student_id === studentId) {
          return {
            ...ts,
            status: 'picked_up',
            confirmation_method: method,
            pickup_time: now.toISOString(),
            notes: `${timeStr} da ${method.toUpperCase()} orqali uyidan olindi`
          };
        }
        return ts;
      })
    );

    const newNotification: NotificationItem = {
      id: Date.now(),
      user_id: student?.primary_parent?.user_id || 5,
      student_id: studentId,
      trip_id: 101,
      type: 'pickup',
      title: 'Farzandingiz transportga chiqdi 🚌',
      message: `${student?.first_name || 'O\'quvchi'} ${timeStr} da uyidan olindi (${method.toUpperCase()} bilan tasdiqlandi). Haydovchi: Jasur Raximov.`,
      is_read: false,
      sent_at: now.toISOString(),
      created_at: now.toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);

    const newLog: AuditLog = {
      id: Date.now(),
      action: 'STUDENT_PICKED_UP',
      table_name: 'trip_students',
      record_id: studentId,
      new_data: JSON.stringify({ student: student?.first_name, method, time: timeStr }),
      created_at: now.toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const confirmSchoolArrival = (tripId: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTripStudents(prev => 
      prev.map(ts => {
        if (ts.trip_id === tripId && ts.status === 'picked_up') {
          return {
            ...ts,
            status: 'arrived_school',
            school_arrival_time: now.toISOString(),
            notes: `${timeStr} da maktabga yetib keldi`
          };
        }
        return ts;
      })
    );

    const newNotifications: NotificationItem[] = tripStudents
      .filter(ts => ts.trip_id === tripId && ts.status === 'picked_up')
      .map(ts => {
        const student = students.find(s => s.id === ts.student_id);
        return {
          id: Date.now() + Math.random(),
          user_id: student?.primary_parent?.user_id || 5,
          student_id: ts.student_id,
          trip_id: tripId,
          type: 'school_arrival',
          title: 'Farzandingiz maktabga yetib keldi 🏫',
          message: `${student?.first_name || 'O\'quvchi'} ${timeStr} da Nova Xususiy Maktabiga xavfsiz yetib keldi.`,
          is_read: false,
          sent_at: now.toISOString(),
          created_at: now.toISOString()
        };
      });

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  const startEveningTrip = (tripId: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTripStudents(prev => 
      prev.map(ts => {
        if (ts.trip_id === tripId) {
          return {
            ...ts,
            status: 'left_school',
            school_departure_time: now.toISOString(),
            notes: `${timeStr} da maktabdan uyiga qaytish uchun avtobusga chiqdi`
          };
        }
        return ts;
      })
    );

    const newNotifications: NotificationItem[] = tripStudents
      .filter(ts => ts.trip_id === tripId)
      .map(ts => {
        const student = students.find(s => s.id === ts.student_id);
        return {
          id: Date.now() + Math.random(),
          user_id: student?.primary_parent?.user_id || 5,
          student_id: ts.student_id,
          trip_id: tripId,
          type: 'school_departure',
          title: 'Farzandingiz maktabdan yo\'lga chiqdi 🚐',
          message: `${student?.first_name || 'O\'quvchi'} ${timeStr} da maktabdan chiqdi va uyga qaytmoqda.`,
          is_read: false,
          sent_at: now.toISOString(),
          created_at: now.toISOString()
        };
      });

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  const confirmHomeArrival = (studentId: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const student = students.find(s => s.id === studentId);

    setTripStudents(prev => 
      prev.map(ts => {
        if (ts.student_id === studentId) {
          return {
            ...ts,
            status: 'arrived_home',
            home_arrival_time: now.toISOString(),
            notes: `${timeStr} da uyiga topshirildi`
          };
        }
        return ts;
      })
    );

    const newNotification: NotificationItem = {
      id: Date.now(),
      user_id: student?.primary_parent?.user_id || 5,
      student_id: studentId,
      trip_id: 101,
      type: 'home_arrival',
      title: 'Farzandingiz uyiga yetkazildi 🏠',
      message: `${student?.first_name || 'O\'quvchi'} ${timeStr} da xavfsiz ravishda uyiga yetkazib qo'yildi.`,
      is_read: false,
      sent_at: now.toISOString(),
      created_at: now.toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const triggerSOS = (tripId: number, vehicleId: number, driverId: number) => {
    const now = new Date();
    const busLoc = busLocations[vehicleId] || { lat: 41.3490, lng: 69.2815 };

    const alert: EmergencyAlert = {
      id: Date.now(),
      trip_id: tripId,
      vehicle_id: vehicleId,
      driver_id: driverId,
      message: 'FAVQULODDA HOLAT: Haydovchi SOS tugmasini bosdi!',
      latitude: busLoc.lat,
      longitude: busLoc.lng,
      status: 'active',
      created_at: now.toISOString()
    };

    setEmergencyAlerts(prev => [alert, ...prev]);

    const adminNotification: NotificationItem = {
      id: Date.now() + 1,
      user_id: 1,
      trip_id: tripId,
      type: 'emergency',
      title: '🚨 FAVQULODDA SOS OGOHLANTIRISH!',
      message: `Avtobus (01 777 NVA) haydovchisi Jasur Raximov SOS tugmasini bosdi. Joylashuvi xaritada ko'rsatilgan.`,
      is_read: false,
      sent_at: now.toISOString(),
      created_at: now.toISOString()
    };
    setNotifications(prev => [adminNotification, ...prev]);
  };

  const resolveSOS = (alertId: number) => {
    setEmergencyAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() } : a)
    );
  };

  const toggleBusSimulation = (vehicleId: number) => {
    setBusLocations(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        isSimulating: !prev[vehicleId]?.isSimulating
      }
    }));
  };

  const updateBusLocationManually = (vehicleId: number, lat: number, lng: number, speed = 40) => {
    setBusLocations(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        lat,
        lng,
        speed
      }
    }));
  };

  const addStudent = (newStudentData: Omit<Student, 'id' | 'created_at'>, addressText: string, lat: number, lng: number) => {
    const id = Date.now();
    const newStudent: Student = {
      ...newStudentData,
      id,
      created_at: new Date().toISOString(),
      address: {
        id: id + 1,
        student_id: id,
        address_text: addressText,
        latitude: lat,
        longitude: lng,
        is_active: true,
        created_at: new Date().toISOString()
      }
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = (studentId: number) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const markNotificationRead = (notificationId: number) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
  };

  return (
    <SystemContext.Provider value={{
      currentUser,
      role,
      setRole,
      login,
      logout,
      users,
      students,
      parents,
      drivers,
      vehicles,
      routes,
      trips,
      tripStudents,
      notifications,
      dailyConfirmations,
      emergencyAlerts,
      routeAlerts,
      auditLogs,
      busLocations,
      handleMorningPromptAnswer,
      confirmStudentPickup,
      confirmSchoolArrival,
      startEveningTrip,
      confirmHomeArrival,
      triggerSOS,
      resolveSOS,
      toggleBusSimulation,
      updateBusLocationManually,
      confirmStudentAddress,
      resetStudentAddressRequest,
      optimizeRouteByLocations,
      schoolLocation,
      updateSchoolLocation,
      addStudent,
      updateStudent,
      updateStudentLocation,
      deleteStudent,
      markNotificationRead
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
