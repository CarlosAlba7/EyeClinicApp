import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  signup: (data) => api.post("/auth/patient-signup", data),
};

// Patient API
export const patientAPI = {
  getAll: (params) => api.get("/patients", { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};
// Patient Portal API
export const patientPortalAPI = {
  // Patient profile (name, email, etc.)
  getProfile: () => api.get("/patient/me"),

  // All appointments for the logged-in patient
  getMyAppointments: () => api.get("/patient-appointments/my"),
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Invoice API
export const invoiceAPI = {
  getAll: (params) => api.get("/invoices", { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// Reports API
export const reportAPI = {
  appointmentStatistics: () => api.get("/reports/appointment-statistics"),
  revenueByMonth: () => api.get("/reports/revenue-by-month"),
  employeePerformance: () => api.get("/reports/employee-performance"),
  patientDemographics: () => api.get("/reports/patient-demographics"),
  patientsByCondition: (condition) =>
    api.get("/reports/patients-by-condition", { params: { condition } }),
  appointmentsByDateRange: (startDate, endDate) =>
    api.get("/reports/appointments-by-date-range", {
      params: { startDate, endDate },
    }),
  outstandingInvoices: () => api.get("/reports/outstanding-invoices"),
  doctorWorkload: (month, year) =>
    api.get("/reports/doctor-workload", { params: { month, year } }),
};

export default api;
