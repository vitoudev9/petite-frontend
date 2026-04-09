export interface Staff {
  id: number;
  name: string;
  role: string;
  color: string;
  hours: string;
  available: boolean;
  specialties: string;
  specialties_list: string[];
}

export interface Service {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  deposit: number;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  tags: string;
  tags_list: string[];
  total_visits: number;
  total_spend: number;
}

export interface Appointment {
  id: number;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  duration: number;
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  paid: boolean;
  notes: string;
  client_id: number;
  staff_id: number;
  service_id: number;
  client?: Client;
  staff_member?: Staff;
  service?: Service;
}

export type AppointmentStatus = Appointment["status"];

// ── Form payload types ───────────────────────────────────────────────────────

export type CreateAppointment = Omit<Appointment, "id" | "client" | "staff_member" | "service">;
export type UpdateAppointment = Partial<CreateAppointment>;

export type CreateClient = Omit<Client, "id" | "tags_list" | "total_visits" | "total_spend">;
export type UpdateClient = Partial<CreateClient>;

export type CreateStaff = Omit<Staff, "id" | "specialties_list">;
export type UpdateStaff = Partial<CreateStaff>;

export type CreateService = Omit<Service, "id">;
export type UpdateService = Partial<CreateService>;
