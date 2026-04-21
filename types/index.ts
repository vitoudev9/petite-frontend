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

export interface AddOn {
  id: number;
  name: string;
  price: number;
  allow_quantity: boolean;
  max_quantity: number | null;
}

export interface AppointmentAddOn {
  id: number;
  addon_id: number;
  quantity: number;
  unit_price: number;
  addon?: AddOn;
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
  date: string;
  time: string;
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
  appointment_addons?: AppointmentAddOn[];
}

export type AppointmentStatus = Appointment["status"];

// ── Form payload types ───────────────────────────────────────────────────────

export interface AppointmentAddOnInput {
  addon_id: number;
  quantity: number;
}

export type CreateAppointment = Omit<Appointment, "id" | "client" | "staff_member" | "service" | "appointment_addons"> & {
  add_ons?: AppointmentAddOnInput[];
};
export type UpdateAppointment = Partial<Omit<CreateAppointment, "client_id">>;

export type CreateClient = Omit<Client, "id" | "tags_list" | "total_visits" | "total_spend">;
export type UpdateClient = Partial<CreateClient>;

export type CreateStaff = Omit<Staff, "id" | "specialties_list">;
export type UpdateStaff = Partial<CreateStaff>;

export type CreateService = Omit<Service, "id">;
export type UpdateService = Partial<CreateService>;

export type CreateAddOn = Omit<AddOn, "id">;
export type UpdateAddOn = Partial<CreateAddOn>;