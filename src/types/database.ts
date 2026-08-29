// Database schema types strictly matching DBML schema for Private School Transportation Management System

export type UserRole = 'admin' | 'driver' | 'parent';
export type StudentStatus = 'active' | 'inactive';
export type AttendanceStatus = 
  | 'waiting' 
  | 'confirmed' 
  | 'picked_up' 
  | 'in_bus' 
  | 'arrived_school' 
  | 'left_school' 
  | 'arrived_home' 
  | 'absent' 
  | 'cancelled';

export type TripType = 'morning' | 'evening';
export type TripStatus = 'planned' | 'started' | 'completed' | 'cancelled';
export type NotificationType = 
  | 'pickup' 
  | 'school_arrival' 
  | 'school_departure' 
  | 'home_arrival' 
  | 'route_warning' 
  | 'emergency' 
  | 'reminder';

export type ConfirmationMethod = 'qr' | 'face' | 'manual';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

export interface User {
  id: number;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string;
  password_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Parent {
  id: number;
  user_id: number;
  relationship: string;
  created_at: string;
  user?: User;
}

export interface Driver {
  id: number;
  user_id: number;
  license_number: string;
  license_expire_date: string;
  created_at: string;
  user?: User;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  class_name: string;
  student_code: string;
  qr_code: string;
  photo_url: string;
  status: StudentStatus;
  created_at: string;
  updated_at?: string;
  primary_parent?: Parent & { user: User };
  address?: StudentAddress;
}

export interface ParentStudent {
  id: number;
  parent_id: number;
  student_id: number;
  is_primary: boolean;
  created_at: string;
}

export interface StudentAddress {
  id: number;
  student_id: number;
  address_text: string;
  latitude: number;
  longitude: number;
  pickup_note?: string;
  is_active: boolean;
  is_confirmed?: boolean;
  confirmed_at?: string;
  created_at: string;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_name: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
  gps_device_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface DriverVehicle {
  id: number;
  driver_id: number;
  vehicle_id: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface Route {
  id: number;
  name: string;
  description?: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  is_active: boolean;
  created_at: string;
}

export interface RouteStudent {
  id: number;
  route_id: number;
  student_id: number;
  pickup_order: number;
  estimated_pickup_time?: string;
  estimated_dropoff_time?: string;
  is_active: boolean;
  student?: Student;
}

export interface RouteVehicle {
  id: number;
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  is_active: boolean;
  assigned_at: string;
}

export interface Trip {
  id: number;
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  trip_type: TripType;
  trip_date: string;
  status: TripStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  route?: Route;
  vehicle?: Vehicle;
  driver?: Driver & { user: User };
}

export interface TripStudent {
  id: number;
  trip_id: number;
  student_id: number;
  status: AttendanceStatus;
  confirmation_method?: ConfirmationMethod;
  pickup_time?: string;
  school_arrival_time?: string;
  school_departure_time?: string;
  home_arrival_time?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  student?: Student;
}

export interface StudentConfirmation {
  id: number;
  trip_student_id: number;
  student_id: number;
  driver_id: number;
  confirmation_method: ConfirmationMethod;
  confirmed_at: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  confidence?: number;
}

export interface GPSLocation {
  id: number;
  vehicle_id: number;
  driver_id?: number;
  trip_id?: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  recorded_at: string;
}

export interface RouteAlert {
  id: number;
  trip_id: number;
  vehicle_id: number;
  alert_type: string;
  message: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface DailyTransportConfirmation {
  id: number;
  student_id: number;
  parent_id: number;
  confirmation_date: string;
  will_use_transport: boolean;
  responded_at?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  student_id?: number;
  trip_id?: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface EmergencyAlert {
  id: number;
  trip_id: number;
  vehicle_id: number;
  driver_id: number;
  message?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export interface DriverDevice {
  id: number;
  driver_id: number;
  device_token: string;
  device_type?: string;
  last_active_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  table_name?: string;
  record_id?: number;
  old_data?: string;
  new_data?: string;
  ip_address?: string;
  created_at: string;
}
