import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import type {
  Appointment, Client, Staff, Service, AddOn,
  CreateAppointment, UpdateAppointment,
  CreateClient, UpdateClient,
  CreateStaff, UpdateStaff,
  CreateService, UpdateService,
  CreateAddOn, UpdateAddOn,
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});


// ── Request interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});
 
// ── Response interceptor — handle 401 with refresh ───────────────────────────
let isRefreshing = false;
 
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const session = await getSession();
        if (session?.refreshToken) {
          const res = await fetch("/api/auth/refresh", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ refresh_token: session.refreshToken }),
          });
          if (res.ok) {
            // Retry the original request — next interceptor will pick up new token
            isRefreshing = false;
            return api.request(error.config!);
          }
        }
      } catch {
        // Refresh failed — sign out
      }
      isRefreshing = false;
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);


// ── Appointments ─────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (params?: {
    date?: string;
    staff_id?: number;
    client_id?: number;
    status?: string;
  }) => api.get<Appointment[]>("/appointments", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  create: (data: CreateAppointment) =>
    api.post<Appointment>("/appointments", data).then((r) => r.data),

  update: (id: number, data: UpdateAppointment) =>
    api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/appointments/${id}`),
};

// ── Clients ───────────────────────────────────────────────────────────────────

export const clientsApi = {
  list: () => api.get<Client[]>("/clients").then((r) => r.data),

  get: (id: number) =>
    api.get<Client>(`/clients/${id}`).then((r) => r.data),

  create: (data: CreateClient) =>
    api.post<Client>("/clients", data).then((r) => r.data),

  update: (id: number, data: UpdateClient) =>
    api.patch<Client>(`/clients/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/clients/${id}`),
};

// ── Staff ─────────────────────────────────────────────────────────────────────

export const staffApi = {
  list: () => api.get<Staff[]>("/staffs").then((r) => r.data),

  get: (id: number) =>
    api.get<Staff>(`/staffs/${id}`).then((r) => r.data),

  create: (data: CreateStaff) =>
    api.post<Staff>("/staffs", data).then((r) => r.data),

  update: (id: number, data: UpdateStaff) =>
    api.patch<Staff>(`/staffs/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/staffs/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (category?: string) =>
    api.get<Service[]>("/services", { params: category ? { category } : {} }).then((r) => r.data),

  get: (id: number) =>
    api.get<Service>(`/services/${id}`).then((r) => r.data),

  create: (data: CreateService) =>
    api.post<Service>("/services", data).then((r) => r.data),

  update: (id: number, data: UpdateService) =>
    api.patch<Service>(`/services/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/services/${id}`),
};

// ── Add-ons ───────────────────────────────────────────────────────────────────

export const addonsApi = {
  // Global list / CRUD
  list: () =>
    api.get<AddOn[]>("/addons").then((r) => r.data),

  create: (data: CreateAddOn) =>
    api.post<AddOn>("/addons", data).then((r) => r.data),

  update: (id: number, data: UpdateAddOn) =>
    api.patch<AddOn>(`/addons/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/addons/${id}`),

  // Per-service
  listForService: (serviceId: number) =>
    api.get<AddOn[]>(`/addons/service/${serviceId}`).then((r) => r.data),

  attachToService: (serviceId: number, addonId: number) =>
    api.post(`/addons/service/${serviceId}/${addonId}`),

  detachFromService: (serviceId: number, addonId: number) =>
    api.delete(`/addons/service/${serviceId}/${addonId}`),
};
