# Eye Clinic Management System - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                    http://localhost:3000                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │ (JWT Token in Headers)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   REACT FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components:                                          │   │
│  │  • Login.js (Authentication)                         │   │
│  │  • Dashboard.js (Statistics)                         │   │
│  │  • Patients.js (CRUD)                                │   │
│  │  • Employees.js (CRUD)                               │   │
│  │  • Appointments.js (CRUD)                            │   │
│  │  • Invoices.js (CRUD)                                │   │
│  │  • Reports.js (Queries & Reports)                    │   │
│  │  • Navigation.js (Menu)                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services:                                            │   │
│  │  • api.js (Axios HTTP Client)                        │   │
│  │    - Adds JWT tokens to requests                     │   │
│  │    - Handles responses and errors                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │ JSON Data
                         │
┌────────────────────────▼────────────────────────────────────┐
│              EXPRESS.JS BACKEND SERVER                       │
│                http://localhost:5000/api                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware:                                          │   │
│  │  • CORS (Allow frontend requests)                    │   │
│  │  • Body Parser (Parse JSON)                          │   │
│  │  • auth.js (Verify JWT tokens)                       │   │
│  │  • authorizeRoles (Check permissions)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes:                                              │   │
│  │  • /api/auth (Login, Get User)                       │   │
│  │  • /api/patients (CRUD operations)                   │   │
│  │  • /api/employees (CRUD operations)                  │   │
│  │  • /api/appointments (CRUD operations)               │   │
│  │  • /api/invoices (CRUD operations)                   │   │
│  │  • /api/reports (Queries & Reports)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │ (mysql2 driver)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    MySQL DATABASE                            │
│                     Port 3306                                │
│                 Database: eyeclinic                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                              │   │
│  │  • patient (10 records)                              │   │
│  │  • employee (3 records)                              │   │
│  │  • appointment                                        │   │
│  │  • invoice                                            │   │
│  │  • exam                                               │   │
│  │  • prescription                                       │   │
│  │  • insurance                                          │   │
│  │  • coveredby                                          │   │
│  │  • dependents                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Triggers:                                            │   │
│  │  • before_employee_update_salary_check               │   │
│  │  • before_employee_insert_salary_check               │   │
│  │  • before_invoice_insert_total_check                 │   │
│  │  • before_invoice_update_total_check                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Login Flow
```
User enters credentials
    ↓
Login.js sends POST request
    ↓
/api/auth/login receives request
    ↓
Validates email/password against employee table
    ↓
Generates JWT token
    ↓
Returns token + user info to frontend
    ↓
Frontend stores token in localStorage
    ↓
All future requests include token in Authorization header
```

### 2. Creating a Patient Flow
```
User fills patient form
    ↓
Patients.js sends POST request with data
    ↓
auth.js middleware verifies JWT token
    ↓
authorizeRoles checks user is Admin or Receptionist
    ↓
/api/patients route receives validated request
    ↓
INSERT query executes on patient table
    ↓
Success response returns new patientID
    ↓
Frontend refreshes patient list
    ↓
User sees new patient in table
```

### 3. Trigger Activation Flow
```
Admin tries to update employee salary
    ↓
Employees.js sends PUT request
    ↓
Backend validates and processes request
    ↓
UPDATE query executes on employee table
    ↓
BEFORE UPDATE trigger fires
    ↓
Trigger checks: Is employeeType = 'Receptionist'?
    ↓
Trigger calculates average doctor salary
    ↓
Trigger compares new salary vs average
    ↓
If salary > average: Trigger throws error
    ↓
Backend catches error and returns to frontend
    ↓
Frontend shows error message to user
```

### 4. Generating a Report Flow
```
User clicks "Generate Report" button
    ↓
Reports.js sends GET request
    ↓
/api/reports/appointment-statistics processes request
    ↓
Complex SQL query with GROUP BY and aggregations
    ↓
Database calculates statistics
    ↓
Results returned as JSON array
    ↓
Frontend receives data
    ↓
Reports.js renders data in formatted table
    ↓
User views report with statistics
```

## Component Interaction Diagram

```
┌─────────────┐
│   App.js    │ ← Main Router
└──────┬──────┘
       │
       ├─────────────┬─────────────┬──────────────┬─────────────┐
       │             │             │              │             │
┌──────▼──────┐ ┌───▼────┐  ┌────▼─────┐  ┌────▼─────┐  ┌───▼──────┐
│   Login     │ │Dashboard│  │ Patients │  │Employees │  │Invoices  │
└─────────────┘ └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
                     │            │             │              │
                     └────────────┴─────────────┴──────────────┘
                                   │
                            ┌──────▼──────┐
                            │   api.js    │ ← Axios Service
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │   Backend   │
                            │   Routes    │
                            └─────────────┘
```

## Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│          │  Login  │          │  Verify │          │
│  Client  ├────────►│  Backend ├────────►│   MySQL  │
│          │         │          │         │          │
└────┬─────┘         └────┬─────┘         └──────────┘
     │                    │
     │   JWT Token        │
     │◄───────────────────┤
     │                    │
     │   Subsequent       │
     │   Requests         │
     │   (with token)     │
     ├───────────────────►│
     │                    │
     │   Protected        │
     │   Data             │
     │◄───────────────────┤
     │                    │
```

## Database Relationships

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│ Patient  │────────►│ Appointment  │◄────────│ Employee │
└────┬─────┘         └──────┬───────┘         └──────────┘
     │                      │
     │                      │
     │                      ▼
     │               ┌──────────┐
     │               │ Invoice  │
     │               └──────────┘
     │
     ▼
┌──────────────┐
│  CoveredBy   │
│  (Junction)  │
└──────┬───────┘
       │
       ▼
┌──────────┐
│Insurance │
└──────────┘
```

## Request/Response Flow

```
Frontend (React)
    │
    │ 1. User Action (e.g., click "Add Patient")
    │
    ▼
API Service (api.js)
    │
    │ 2. Prepare HTTP request with JWT token
    │
    ▼
Backend (Express)
    │
    │ 3. Verify token (auth middleware)
    │ 4. Check permissions (authorizeRoles)
    │ 5. Process request (route handler)
    │
    ▼
Database (MySQL)
    │
    │ 6. Execute SQL query
    │ 7. Trigger fires (if applicable)
    │ 8. Return results
    │
    ▼
Backend (Express)
    │
    │ 9. Format response
    │ 10. Send JSON response
    │
    ▼
API Service (api.js)
    │
    │ 11. Handle response/error
    │
    ▼
Frontend (React)
    │
    │ 12. Update UI
    │ 13. Show success/error message
    │
```

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  React Components + CSS + HTML          │
│  - Login, Dashboard, CRUD Forms         │
│  - Reports, Tables, Modals              │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Application Layer               │
│  React Router + Axios + State Mgmt      │
│  - Routing, API calls, Data flow        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Business Logic Layer            │
│  Express.js + Middleware                │
│  - Authentication, Authorization        │
│  - Route handlers, Validation           │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Data Access Layer               │
│  MySQL Driver (mysql2)                  │
│  - SQL queries, Connection pooling      │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Database Layer                  │
│  MySQL 8.0                              │
│  - Tables, Triggers, Constraints        │
└─────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         User (Browser)                  │
└───────────────┬─────────────────────────┘
                │
                │ HTTPS (in production)
                │
┌───────────────▼─────────────────────────┐
│         Frontend (React)                │
│  • Stores JWT in localStorage           │
│  • Includes token in all requests       │
└───────────────┬─────────────────────────┘
                │
                │ JWT Token in Authorization header
                │
┌───────────────▼─────────────────────────┐
│         Backend (Express)               │
│  • Verifies JWT signature               │
│  • Checks token expiration              │
│  • Validates user role                  │
└───────────────┬─────────────────────────┘
                │
                │ Parameterized queries
                │
┌───────────────▼─────────────────────────┐
│         Database (MySQL)                │
│  • Enforces constraints                 │
│  • Executes triggers                    │
│  • Maintains data integrity             │
└─────────────────────────────────────────┘
```

## Deployment Architecture (Azure Ready)

```
┌─────────────────────────────────────────┐
│    Azure Static Web Apps                │
│    (Frontend - React Build)             │
│    https://yourapp.azurestaticapps.net  │
└───────────────┬─────────────────────────┘
                │
                │ API Calls
                │
┌───────────────▼─────────────────────────┐
│    Azure App Service                    │
│    (Backend - Node.js)                  │
│    https://yourapi.azurewebsites.net    │
└───────────────┬─────────────────────────┘
                │
                │ Connection String
                │
┌───────────────▼─────────────────────────┐
│    Azure Database for MySQL             │
│    (Production Database)                │
└─────────────────────────────────────────┘
```

## Key Design Patterns Used

1. **MVC Pattern** - Model (Database), View (React Components), Controller (Express Routes)
2. **Repository Pattern** - Database access abstracted through route handlers
3. **Middleware Pattern** - Authentication and authorization as middleware
4. **Service Layer Pattern** - api.js acts as service layer for HTTP calls
5. **Component Pattern** - Reusable React components
6. **JWT Authentication** - Stateless authentication mechanism
7. **RESTful API** - Standard HTTP methods and resource-based URLs

## Performance Considerations

- **Connection Pooling** - MySQL connection pool for efficient database access
- **JWT Tokens** - Stateless authentication reduces database queries
- **Efficient Queries** - Indexed columns and optimized SQL queries
- **React Optimization** - Component-based architecture with efficient re-renders
- **Lazy Loading** - Components load on demand via routing

---

This architecture supports scalability, security, and maintainability while meeting all project requirements.
