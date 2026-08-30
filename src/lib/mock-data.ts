import { 
  User, Parent, Driver, Student, StudentAddress, Vehicle, Route, 
  RouteStudent, Trip, TripStudent, DailyTransportConfirmation, NotificationItem, EmergencyAlert, RouteAlert, AuditLog
} from '../types/database';

export const SCHOOL_LOCATION = {
  name: "Nova Xususiy Maktabi",
  address: "Toshkent shahar, Mirzo Ulug'bek tumani, Mustaqillik shoh ko'chasi 45-uy",
  lat: 41.311082,
  lng: 69.240562
};

export const MOCK_USERS: User[] = [
  // Admins
  {
    id: 1,
    role: 'admin',
    first_name: 'Dilshod',
    last_name: 'Karimov',
    phone: '+998901112233',
    password_hash: 'admin123',
    is_active: true,
    created_at: '2026-01-10T08:00:00Z'
  },
  // Drivers
  {
    id: 2,
    role: 'driver',
    first_name: 'Jasur',
    last_name: 'Raximov',
    phone: '+998902223344',
    password_hash: 'driver123',
    is_active: true,
    created_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 3,
    role: 'driver',
    first_name: 'Bobur',
    last_name: 'Alimov',
    phone: '+998903334455',
    password_hash: 'driver123',
    is_active: true,
    created_at: '2026-01-16T09:00:00Z'
  },
  {
    id: 4,
    role: 'driver',
    first_name: 'Sardor',
    last_name: 'Usmonov',
    phone: '+998904445566',
    password_hash: 'driver123',
    is_active: true,
    created_at: '2026-01-17T09:00:00Z'
  },
  // Parents
  {
    id: 5,
    role: 'parent',
    first_name: 'Aziz',
    last_name: 'Valiyev',
    phone: '+998905556677',
    password_hash: 'parent123',
    is_active: true,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 6,
    role: 'parent',
    first_name: 'Nigora',
    last_name: 'Tursunova',
    phone: '+998906667788',
    password_hash: 'parent123',
    is_active: true,
    created_at: '2026-02-02T10:00:00Z'
  },
  {
    id: 7,
    role: 'parent',
    first_name: 'Sherzod',
    last_name: 'Qodirov',
    phone: '+998907778899',
    password_hash: 'parent123',
    is_active: true,
    created_at: '2026-02-03T10:00:00Z'
  },
  {
    id: 8,
    role: 'parent',
    first_name: 'Gulnora',
    last_name: 'Axmedova',
    phone: '+998908889900',
    password_hash: 'parent123',
    is_active: true,
    created_at: '2026-02-04T10:00:00Z'
  }
];

export const MOCK_PARENTS: Parent[] = [
  { id: 1, user_id: 5, relationship: 'Otasi', created_at: '2026-02-01T10:00:00Z', user: MOCK_USERS[4] },
  { id: 2, user_id: 6, relationship: 'Onasi', created_at: '2026-02-02T10:00:00Z', user: MOCK_USERS[5] },
  { id: 3, user_id: 7, relationship: 'Otasi', created_at: '2026-02-03T10:00:00Z', user: MOCK_USERS[6] },
  { id: 4, user_id: 8, relationship: 'Onasi', created_at: '2026-02-04T10:00:00Z', user: MOCK_USERS[7] },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 1, user_id: 2, license_number: 'AA9876543', license_expire_date: '2028-12-31', created_at: '2026-01-15T09:00:00Z', user: MOCK_USERS[1] },
  { id: 2, user_id: 3, license_number: 'AB1234567', license_expire_date: '2029-06-30', created_at: '2026-01-16T09:00:00Z', user: MOCK_USERS[2] },
  { id: 3, user_id: 4, license_number: 'AC5554443', license_expire_date: '2030-01-15', created_at: '2026-01-17T09:00:00Z', user: MOCK_USERS[3] },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    plate_number: '01 777 NVA',
    vehicle_name: 'Mercedes-Benz Sprinter 1',
    model: 'Sprinter 519 CDI',
    capacity: 18,
    status: 'active',
    gps_device_id: 'GPS-BUS-001',
    created_at: '2026-01-15T08:00:00Z'
  },
  {
    id: 2,
    plate_number: '01 888 NVA',
    vehicle_name: 'Isuzu SAZ NP37 2',
    model: 'Isuzu NP37',
    capacity: 22,
    status: 'active',
    gps_device_id: 'GPS-BUS-002',
    created_at: '2026-01-16T08:00:00Z'
  },
  {
    id: 3,
    plate_number: '01 999 NVA',
    vehicle_name: 'Ford Transit 3',
    model: 'Transit Custom',
    capacity: 16,
    status: 'active',
    gps_device_id: 'GPS-BUS-003',
    created_at: '2026-01-17T08:00:00Z'
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    first_name: 'Ali',
    last_name: 'Valiyev',
    birth_date: '2016-04-12',
    gender: 'Erkak',
    class_name: '4-A sinf',
    student_code: 'NV-2026-001',
    qr_code: 'STU-QR-ALI-001',
    photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
    status: 'active',
    created_at: '2026-02-01T10:00:00Z',
    primary_parent: { ...MOCK_PARENTS[0], user: MOCK_USERS[4] },
    address: {
      id: 1,
      student_id: 1,
      address_text: 'Toshkent sh., Yunusobod tumani, 11-mavze 24-uy',
      latitude: 41.3650,
      longitude: 69.2850,
      pickup_note: 'Darvoza oldida kutadi',
      is_active: true,
      is_confirmed: true,
      created_at: '2026-02-01T10:00:00Z'
    }
  },
  {
    id: 2,
    first_name: 'Madina',
    last_name: 'Tursunova',
    birth_date: '2017-09-20',
    gender: 'Ayol',
    class_name: '3-B sinf',
    student_code: 'NV-2026-002',
    qr_code: 'STU-QR-MADINA-002',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    status: 'active',
    created_at: '2026-02-02T10:00:00Z',
    primary_parent: { ...MOCK_PARENTS[1], user: MOCK_USERS[5] },
    address: {
      id: 2,
      student_id: 2,
      address_text: 'Toshkent sh., Yunusobod tumani, A.Temur ko\'chasi 88-uy',
      latitude: 41.3480,
      longitude: 69.2810,
      pickup_note: 'Podyezd oldida',
      is_active: true,
      is_confirmed: true,
      created_at: '2026-02-02T10:00:00Z'
    }
  },
  {
    id: 3,
    first_name: 'Jasur',
    last_name: 'Qodirov',
    birth_date: '2015-11-05',
    gender: 'Erkak',
    class_name: '5-V sinf',
    student_code: 'NV-2026-003',
    qr_code: 'STU-QR-JASUR-003',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    status: 'active',
    created_at: '2026-02-03T10:00:00Z',
    primary_parent: { ...MOCK_PARENTS[2], user: MOCK_USERS[6] },
    address: {
      id: 3,
      student_id: 3,
      address_text: 'Toshkent sh., Yunusobod tumani, Bodomzor yo\'li 15-uy',
      latitude: 41.3320,
      longitude: 69.2740,
      pickup_note: 'Bosh bekat yonida',
      is_active: true,
      is_confirmed: true,
      created_at: '2026-02-03T10:00:00Z'
    }
  },
  {
    id: 4,
    first_name: 'Zahro',
    last_name: 'Axmedova',
    birth_date: '2018-02-14',
    gender: 'Ayol',
    class_name: '2-A sinf',
    student_code: 'NV-2026-004',
    qr_code: 'STU-QR-ZAHRO-004',
    photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    status: 'active',
    created_at: '2026-02-04T10:00:00Z',
    primary_parent: { ...MOCK_PARENTS[3], user: MOCK_USERS[7] },
    address: {
      id: 4,
      student_id: 4,
      address_text: 'Toshkent sh., Chilonzor tumani, 9-mavze 12-uy',
      latitude: 41.2750,
      longitude: 69.2050,
      pickup_note: 'Shlagbaum yonida',
      is_active: true,
      created_at: '2026-02-04T10:00:00Z'
    }
  },
  {
    id: 5,
    first_name: 'Imron',
    last_name: 'Sobirov',
    birth_date: '2016-07-19',
    gender: 'Erkak',
    class_name: '4-B sinf',
    student_code: 'NV-2026-005',
    qr_code: 'STU-QR-IMRON-005',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'active',
    created_at: '2026-02-05T10:00:00Z',
    primary_parent: { ...MOCK_PARENTS[0], user: MOCK_USERS[4] },
    address: {
      id: 5,
      student_id: 5,
      address_text: 'Toshkent sh., Mirzo Ulug\'bek tumani, Buyuk Ipak Yuli 120-uy',
      latitude: 41.3350,
      longitude: 69.3450,
      pickup_note: 'Bekat yonida',
      is_active: true,
      created_at: '2026-02-05T10:00:00Z'
    }
  }
];

// Real Tashkent Street Road Coordinates (Following actual avenues and street networks)
export const ROUTE_STREET_PATHS: Record<number, Array<[number, number]>> = {
  1: [
    [41.3652, 69.2854], // 1-bekat: Yunusobod 11-mavze
    [41.3621, 69.2858], // Ahmad Donish ko'chasi
    [41.3575, 69.2848], // Ahmad Donish / Yunusota chorrahasi
    [41.3532, 69.2835], // Amir Temur shoh ko'chasiga kirish
    [41.3480, 69.2810], // 2-bekat: Amir Temur ko'chasi (Madina)
    [41.3435, 69.2825], // Shahriston metro chorrahasi
    [41.3380, 69.2810], // 3-bekat: Bodomzor / Sebzor (Jasur)
    [41.3330, 69.2802], // Amir Temur shoh ko'chasi
    [41.3282, 69.2785], // Minor metro bekati chorrahasi
    [41.3235, 69.2745], // Abdulla Qodiriy ko'chasiga burilish
    [41.3195, 69.2660], // Abdulla Qodiriy bo'ylab G'afur G'ulom bog'i
    [41.3160, 69.2560], // Sebzor / Navoiy shoh ko'chasiga burilish
    [41.3138, 69.2485], // Alisher Navoiy shoh ko'chasi bo'ylab
    [41.3120, 69.2435], // Xalqlar Do'stligi / Navoiy ko'chasi
    [41.311082, 69.240562] // Nova Maktab (Maktab darvozasi)
  ],
  2: [
    [41.2750, 69.2050], // Chilonzor 20-mavze
    [41.2780, 69.2090], // Qatortol ko'chasi
    [41.2840, 69.2150], // Bunyodkor shoh ko'chasi
    [41.2920, 69.2220], // Mirzo Ulug'bek metro chorrahasi
    [41.3000, 69.2310], // Xalqlar Do'stligi saroyi
    [41.3060, 69.2370], // O'zbekiston shoh ko'chasi
    [41.311082, 69.240562] // Nova Maktab
  ],
  3: [
    [41.3350, 69.3450], // Feruza mavzesi
    [41.3320, 69.3350], // Buyuk Ipak Yo'li
    [41.3270, 69.3180], // Mirzo Ulug'bek shoh ko'chasi
    [41.3220, 69.2980], // Mustaqillik shoh ko'chasi
    [41.3180, 69.2750], // Amir Temur xiyoboni
    [41.3140, 69.2550], // Navoiy shoh ko'chasi
    [41.311082, 69.240562] // Nova Maktab
  ]
};

export const MOCK_ROUTES: Route[] = [
  {
    id: 1,
    name: '1-Marshrut: Yunusobod - Nova Maktab',
    description: 'Yunusobod 11-mavze yo\'nalishi bo\'yicha o\'quvchilarni yig\'ish',
    start_latitude: 41.3650,
    start_longitude: 69.2850,
    end_latitude: SCHOOL_LOCATION.lat,
    end_longitude: SCHOOL_LOCATION.lng,
    is_active: true,
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 2,
    name: '2-Marshrut: Chilonzor - Nova Maktab',
    description: 'Chilonzor va Uchtepa tumanlaridan o\'quvchilarni keltirish',
    start_latitude: 41.2750,
    start_longitude: 69.2050,
    end_latitude: SCHOOL_LOCATION.lat,
    end_longitude: SCHOOL_LOCATION.lng,
    is_active: true,
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 3,
    name: '3-Marshrut: Mirzo Ulug\'bek - Nova Maktab',
    description: 'B.I.Yuli va Feruza mavzelari yo\'nalishi',
    start_latitude: 41.3350,
    start_longitude: 69.3450,
    end_latitude: SCHOOL_LOCATION.lat,
    end_longitude: SCHOOL_LOCATION.lng,
    is_active: true,
    created_at: '2026-01-20T08:00:00Z'
  }
];

export const MOCK_ROUTE_STUDENTS: RouteStudent[] = [
  { id: 1, route_id: 1, student_id: 1, pickup_order: 1, estimated_pickup_time: '07:25', estimated_dropoff_time: '16:15', is_active: true, student: MOCK_STUDENTS[0] },
  { id: 2, route_id: 1, student_id: 2, pickup_order: 2, estimated_pickup_time: '07:35', estimated_dropoff_time: '16:05', is_active: true, student: MOCK_STUDENTS[1] },
  { id: 3, route_id: 1, student_id: 3, pickup_order: 3, estimated_pickup_time: '07:45', estimated_dropoff_time: '15:55', is_active: true, student: MOCK_STUDENTS[2] },
  { id: 4, route_id: 2, student_id: 4, pickup_order: 1, estimated_pickup_time: '07:20', estimated_dropoff_time: '16:20', is_active: true, student: MOCK_STUDENTS[3] },
  { id: 5, route_id: 3, student_id: 5, pickup_order: 1, estimated_pickup_time: '07:30', estimated_dropoff_time: '16:10', is_active: true, student: MOCK_STUDENTS[4] },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 101,
    route_id: 1,
    vehicle_id: 1,
    driver_id: 1,
    trip_type: 'morning',
    trip_date: '2026-08-29',
    status: 'started',
    started_at: '2026-08-29T07:15:00Z',
    created_at: '2026-08-29T06:30:00Z',
    route: MOCK_ROUTES[0],
    vehicle: MOCK_VEHICLES[0],
    driver: { ...MOCK_DRIVERS[0], user: MOCK_USERS[1] }
  }
];

export const MOCK_TRIP_STUDENTS: TripStudent[] = [
  {
    id: 1001,
    trip_id: 101,
    student_id: 1,
    status: 'picked_up',
    confirmation_method: 'qr',
    pickup_time: '2026-08-29T07:26:00Z',
    notes: '07:26 da uyidan QR kod orqali olindi',
    created_at: '2026-08-29T06:30:00Z',
    updated_at: '2026-08-29T07:26:00Z',
    student: MOCK_STUDENTS[0]
  },
  {
    id: 1002,
    trip_id: 101,
    student_id: 2,
    status: 'waiting',
    notes: 'Avtobus yaqinlashmoqda (ETA: 4 daqiqa)',
    created_at: '2026-08-29T06:30:00Z',
    student: MOCK_STUDENTS[1]
  },
  {
    id: 1003,
    trip_id: 101,
    student_id: 3,
    status: 'waiting',
    created_at: '2026-08-29T06:30:00Z',
    student: MOCK_STUDENTS[2]
  }
];

export const MOCK_DAILY_CONFIRMATIONS: DailyTransportConfirmation[] = [
  { id: 1, student_id: 1, parent_id: 1, confirmation_date: '2026-08-29', will_use_transport: true, responded_at: '2026-08-29T07:02:15Z', created_at: '2026-08-29T07:00:00Z' },
  { id: 2, student_id: 2, parent_id: 2, confirmation_date: '2026-08-29', will_use_transport: true, responded_at: '2026-08-29T07:05:00Z', created_at: '2026-08-29T07:00:00Z' },
  { id: 3, student_id: 3, parent_id: 3, confirmation_date: '2026-08-29', will_use_transport: true, responded_at: '2026-08-29T07:04:22Z', created_at: '2026-08-29T07:00:00Z' },
  { id: 4, student_id: 4, parent_id: 4, confirmation_date: '2026-08-29', will_use_transport: false, responded_at: '2026-08-29T07:01:00Z', created_at: '2026-08-29T07:00:00Z' },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    user_id: 5, // Aziz Valiyev (Parent of Ali)
    student_id: 1,
    trip_id: 101,
    type: 'pickup',
    title: 'Farzandingiz transportga chiqdi 🚌',
    message: 'Ali Valiyev soat 07:26 da uyidan olindi. Haydovchi: Jasur Raximov (01 777 NVA)',
    is_read: false,
    sent_at: '2026-08-29T07:26:05Z',
    created_at: '2026-08-29T07:26:05Z'
  },
  {
    id: 2,
    user_id: 5,
    student_id: 1,
    trip_id: 101,
    type: 'reminder',
    title: 'Ertalabki so\'rovnoma (07:00)',
    message: 'Bugun Ali Valiyev maktab transportidan foydalandi (Tasdiqlangan).',
    is_read: true,
    sent_at: '2026-08-29T07:00:00Z',
    created_at: '2026-08-29T07:00:00Z'
  }
];

export const MOCK_EMERGENCY_ALERTS: EmergencyAlert[] = [];

export const MOCK_ROUTE_ALERTS: RouteAlert[] = [
  {
    id: 1,
    trip_id: 101,
    vehicle_id: 1,
    alert_type: 'speed_warning',
    message: 'Tezlik chegarasi oshirildi: 68 km/h (Maksimal: 60 km/h)',
    latitude: 41.3520,
    longitude: 69.2830,
    speed: 68.5,
    is_resolved: false,
    created_at: '2026-08-29T07:22:00Z'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 2,
    action: 'STUDENT_PICKUP_CONFIRMED',
    table_name: 'trip_students',
    record_id: 1001,
    new_data: JSON.stringify({ student: 'Ali Valiyev', method: 'qr', timestamp: '07:26:00' }),
    created_at: '2026-08-29T07:26:00Z'
  }
];
