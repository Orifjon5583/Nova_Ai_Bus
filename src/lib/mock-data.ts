import { 
  User, Parent, Driver, Student, StudentAddress, Vehicle, Route, 
  RouteStudent, Trip, TripStudent, DailyTransportConfirmation, NotificationItem, EmergencyAlert, RouteAlert, AuditLog
} from '../types/database';

export const SCHOOL_LOCATION = {
  name: "Nova International AI School",
  address: "Urganch sh., Sanoatchilar ko'chasi, 9-0 uy (Ashxobod mahallasi)",
  lat: 41.524061,
  lng: 60.653853
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
      address_text: 'Urganch sh., Al-Xorazmiy shoh ko\'chasi 14-uy',
      latitude: 41.5620,
      longitude: 60.6120,
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
      address_text: 'Urganch sh., J.Manguberdi maydoni 5-uy',
      latitude: 41.5520,
      longitude: 60.6280,
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
      address_text: 'Urganch sh., Ashxobod mahallasi, Xonqa yo\'li 22-uy',
      latitude: 41.5380,
      longitude: 60.6410,
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
      address_text: 'Urganch sh., Pahlavon Mahmud ko\'chasi 33-uy',
      latitude: 41.5450,
      longitude: 60.6180,
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
      address_text: 'Urganch sh., Gurlan ko\'chasi 78-uy',
      latitude: 41.5580,
      longitude: 60.6350,
      pickup_note: 'Bekat yonida',
      is_active: true,
      created_at: '2026-02-05T10:00:00Z'
    }
  }
];

const RAW_ROUTE_1_POINTS: Array<[number, number]> = [
  [41.5620, 60.6120], // 1-bekat: Al-Xorazmiy shoh ko'chasi (Ali)
  [41.5580, 60.6180], // Al-Xorazmiy shoh ko'chasi
  [41.5550, 60.6220], // Temir yo'l vokzali chorrahasi
  [41.5520, 60.6280], // 2-bekat: Jaloliddin Manguberdi maydoni (Madina)
  [41.5480, 60.6320], // Shovot kanali ko'prigi bo'ylab
  [41.5420, 60.6360], // Pahlavon Mahmud ko'chasi chorrahasi
  [41.5380, 60.6410], // 3-bekat: Ashxobod mahallasi / Xonqa yo'li (Jasur)
  [41.5320, 60.6470], // Sanoatchilar ko'chasiga burilish
  [41.5280, 60.6510], // Sanoatchilar ko'chasi bo'ylab
  [41.524061, 60.653853] // Nova International AI School (9-0, Sanoatchilar ko'chasi)
];

function interpolateRoadPath(points: Array<[number, number]>, stepsBetween = 4): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];
    for (let s = 0; s < stepsBetween; s++) {
      const frac = s / stepsBetween;
      result.push([
        parseFloat((lat1 + (lat2 - lat1) * frac).toFixed(5)),
        parseFloat((lng1 + (lng2 - lng1) * frac).toFixed(5))
      ]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

// Real Tashkent Street Road Coordinates (Following actual avenues and street networks)
export const ROUTE_STREET_PATHS: Record<number, Array<[number, number]>> = {
  1: interpolateRoadPath(RAW_ROUTE_1_POINTS, 4),
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

export interface NavigationManeuver {
  id: number;
  instruction: string;
  streetName: string;
  distanceMeters: number;
  type: 'straight' | 'turn-right' | 'turn-left' | 'u-turn' | 'arrive-stop' | 'arrive-school';
  stopStudentName?: string;
  coord: [number, number];
}

export const ROUTE_NAVIGATION_STEPS: Record<number, NavigationManeuver[]> = {
  1: [
    { id: 1, instruction: "Yunusobod 11-mavzedan janubga qarab harakatlaning", streetName: "Yangi Yunusobod ko'chasi", distanceMeters: 300, type: 'straight', coord: [41.3652, 69.2854] },
    { id: 2, instruction: "Ahmad Donish ko'chasiga o'ngga buriling", streetName: "Ahmad Donish ko'chasi", distanceMeters: 450, type: 'turn-right', coord: [41.3621, 69.2858] },
    { id: 3, instruction: "Yunusota chorrahasidan to'g'ri o'ting", streetName: "Ahmad Donish ko'chasi", distanceMeters: 600, type: 'straight', coord: [41.3575, 69.2848] },
    { id: 4, instruction: "Amir Temur shoh ko'chasiga chapga buriling", streetName: "Amir Temur shoh ko'chasi", distanceMeters: 550, type: 'turn-left', coord: [41.3532, 69.2835] },
    { id: 5, instruction: "2-bekat: Madina Tursunova uyiga yetib keldingiz", streetName: "Amir Temur ko'chasi 88-uy", distanceMeters: 100, type: 'arrive-stop', stopStudentName: "Madina Tursunova", coord: [41.3480, 69.2810] },
    { id: 6, instruction: "Shahriston chorrahasi bo'ylab to'g'ri davom eting", streetName: "Amir Temur shoh ko'chasi", distanceMeters: 800, type: 'straight', coord: [41.3435, 69.2825] },
    { id: 7, instruction: "3-bekat: Jasur Qodirov uyiga yetib keldingiz", streetName: "Bodomzor / Sebzor ko'chasi", distanceMeters: 150, type: 'arrive-stop', stopStudentName: "Jasur Qodirov", coord: [41.3380, 69.2810] },
    { id: 8, instruction: "Amir Temur shoh ko'chasi bo'ylab Minor metrosi tomon harakatlaning", streetName: "Amir Temur shoh ko'chasi", distanceMeters: 950, type: 'straight', coord: [41.3330, 69.2802] },
    { id: 9, instruction: "Minor metro chorrahasidan Abdulla Qodiriy ko'chasiga o'ngga buriling", streetName: "Abdulla Qodiriy ko'chasi", distanceMeters: 750, type: 'turn-right', coord: [41.3282, 69.2785] },
    { id: 10, instruction: "G'afur G'ulom bog'i yonidan Sebzor ko'chasi tomon to'g'ri yuring", streetName: "Abdulla Qodiriy ko'chasi", distanceMeters: 1100, type: 'straight', coord: [41.3195, 69.2660] },
    { id: 11, instruction: "Alisher Navoiy shoh ko'chasiga chapga buriling", streetName: "Alisher Navoiy shoh ko'chasi", distanceMeters: 850, type: 'turn-left', coord: [41.3160, 69.2560] },
    { id: 12, instruction: "Xalqlar Do'stligi saroyi chorrahasi bo'ylab to'g'ri o'ting", streetName: "Alisher Navoiy shoh ko'chasi", distanceMeters: 600, type: 'straight', coord: [41.3120, 69.2435] },
    { id: 13, instruction: "Manzilga yetib kelindi: Nova Xususiy Maktabi darvozasi", streetName: "Navoiy ko'chasi 45-uy", distanceMeters: 50, type: 'arrive-school', coord: [41.311082, 69.240562] }
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
