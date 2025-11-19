import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://eyeclinic-backend.vercel.app/api"
    : "http://localhost:5000/api";


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
// Patient Portal API
export const patientPortalAPI = {
  // General info about the logged-in user (employee or patient)
  getProfile: () => api.get("/auth/me"),
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
  complete: (id, data) => api.post(`/appointments/${id}/complete`, data),
  cancel: (id) => api.post(`/appointments/${id}/cancel`),
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

// Shop API
export const shopAPI = {
  getAllItems: () => api.get("/shop/items"),
  getItemById: (id) => api.get(`/shop/items/${id}`),
  createItem: (data) => api.post("/shop/items", data),
  updateItem: (id, data) => api.put(`/shop/items/${id}`, data),
  deleteItem: (id) => api.delete(`/shop/items/${id}`),
  addToCart: (data) => api.post("/shop/cart", data),
  getCart: () => api.get("/shop/cart"),
  updateCartItem: (cartID, data) => api.put(`/shop/cart/${cartID}`, data),
  removeFromCart: (cartID) => api.delete(`/shop/cart/${cartID}`),
  checkout: (data) => api.post("/shop/checkout", data),
  getOrders: () => api.get("/shop/orders"),
  getAllOrders: () => api.get("/shop/orders/all"),
  updateOrderStatus: (orderID, status) => api.put(`/shop/orders/${orderID}/status`, { status }),
};

// Doctor Alerts API
export const doctorAlertsAPI = {
  getMyAlerts: () => api.get("/doctor-alerts/my"),
  getUnreadCount: () => api.get("/doctor-alerts/unread-count"),
  markAsRead: (id) => api.put(`/doctor-alerts/${id}/mark-read`),
  markAllAsRead: () => api.put("/doctor-alerts/mark-all-read"),
  deleteAlert: (id) => api.delete(`/doctor-alerts/${id}`),
  getEmergencyAlerts: () => api.get("/doctor-alerts/emergency"),
};

export default api;
