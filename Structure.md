# Eye Clinic Management System - File Structure

## Complete Directory Structure

```
eyeclinic-app/
├── backend/
│   ├── config/
│   │   └── database.js                 # MySQL database configuration
│   ├── middleware/
│   │   └── auth.js                     # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js                     # Login and authentication routes
│   │   ├── patients.js                 # Patient CRUD operations
│   │   ├── employees.js                # Employee CRUD operations
│   │   ├── appointments.js             # Appointment CRUD operations
│   │   ├── invoices.js                 # Invoice CRUD operations
│   │   └── reports.js                  # Reports and data queries
│   ├── .env                            # Environment variables (DB credentials, JWT secret)
│   ├── database-init.sql               # Database initialization script with triggers
│   ├── package.json                    # Backend dependencies
│   └── server.js                       # Main Express server file
│
└── frontend/
    ├── public/
    │   └── index.html                  # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Login.js                # Login page component
    │   │   ├── Navigation.js           # Navigation bar component
    │   │   ├── Dashboard.js            # Dashboard with statistics
    │   │   ├── Patients.js             # Patient management (CRUD)
    │   │   ├── Appointments.js         # Appointment management (CRUD)
    │   │   ├── Employees.js            # Employee management (CRUD)
    │   │   ├── Invoices.js             # Invoice management (CRUD)
    │   │   └── Reports.js              # Reports and queries page
    │   ├── services/
    │   │   └── api.js                  # Axios API service layer
    │   ├── App.js                      # Main React app component
    │   ├── App.css                     # Global styles
    │   └── index.js                    # React entry point
    └── package.json                    # Frontend dependencies
```

## File Descriptions

### Backend Files

#### `/backend/server.js`
- Main Express server
- Configures middleware (CORS, body-parser)
- Registers all API routes
- Starts server on port 5000

#### `/backend/config/database.js`
- MySQL connection pool configuration
- Exports promise-based database connection
- Uses environment variables for credentials

#### `/backend/middleware/auth.js`
- JWT token verification middleware
- Role-based authorization helper
- Protects routes requiring authentication

#### `/backend/routes/auth.js`
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user info

#### `/backend/routes/patients.js`
- GET `/api/patients` - Get all patients (with search)
- GET `/api/patients/:id` - Get single patient
- POST `/api/patients` - Create new patient
- PUT `/api/patients/:id` - Update patient
- DELETE `/api/patients/:id` - Delete patient

#### `/backend/routes/employees.js`
- GET `/api/employees` - Get all employees (with filters)
- GET `/api/employees/:id` - Get single employee
- POST `/api/employees` - Create new employee
- PUT `/api/employees/:id` - Update employee (triggers salary check)
- DELETE `/api/employees/:id` - Delete employee

#### `/backend/routes/appointments.js`
- GET `/api/appointments` - Get all appointments (with filters)
- GET `/api/appointments/:id` - Get single appointment
- POST `/api/appointments` - Create new appointment
- PUT `/api/appointments/:id` - Update appointment
- DELETE `/api/appointments/:id` - Delete appointment

#### `/backend/routes/invoices.js`
- GET `/api/invoices` - Get all invoices (with filters)
- GET `/api/invoices/:id` - Get single invoice
- POST `/api/invoices` - Create new invoice (triggers total check)
- PUT `/api/invoices/:id` - Update invoice (triggers total check)
- DELETE `/api/invoices/:id` - Delete invoice

#### `/backend/routes/reports.js`
Reports:
- GET `/api/reports/appointment-statistics` - Report 1
- GET `/api/reports/revenue-by-month` - Report 2
- GET `/api/reports/employee-performance` - Report 3
- GET `/api/reports/patient-demographics` - Report 4

Queries:
- GET `/api/reports/patients-by-condition?condition=X` - Query 1
- GET `/api/reports/appointments-by-date-range?startDate=X&endDate=Y` - Query 2
- GET `/api/reports/outstanding-invoices` - Query 3
- GET `/api/reports/doctor-workload?month=X&year=Y` - Query 4

#### `/backend/database-init.sql`
- Creates `eyeclinic` database
- Creates all tables (patient, employee, appointment, invoice, etc.)
- Inserts sample data (3 employees, 10 patients)
- Creates 2 triggers:
  - Trigger 1: `before_employee_update_salary_check` - Prevents receptionist salary > average doctor salary
  - Trigger 2: `before_invoice_insert/update_total_check` - Prevents negative invoice totals

#### `/backend/.env`
- Environment variables
- Database credentials
- JWT secret key
- Server port

#### `/backend/package.json`
Dependencies:
- express - Web framework
- mysql2 - MySQL database driver
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- body-parser - Parse request bodies

### Frontend Files

#### `/frontend/src/index.js`
- React app entry point
- Renders App component into DOM

#### `/frontend/src/App.js`
- Main application component
- React Router setup
- Route protection and authentication
- Navigation between pages

#### `/frontend/src/App.css`
- Global styles for entire application
- Responsive design
- Component-specific styles
- Utility classes

#### `/frontend/src/services/api.js`
- Axios configuration
- API base URL setup
- Request/response interceptors
- JWT token management
- All API endpoints organized by entity

#### `/frontend/src/components/Login.js`
- Login form
- Credentials validation
- JWT token storage
- User session management
- Demo credentials display

#### `/frontend/src/components/Navigation.js`
- Top navigation bar
- Role-based menu items
- User information display
- Logout functionality

#### `/frontend/src/components/Dashboard.js`
- Statistics cards
- Quick action buttons
- Real-time data aggregation
- Role-based content

#### `/frontend/src/components/Patients.js`
- Patient list with search
- Create patient form
- Edit patient form
- Delete patient
- Role-based permissions (Admin, Receptionist)

#### `/frontend/src/components/Appointments.js`
- Appointment list with filters
- Schedule appointment form
- Edit appointment form
- Delete appointment
- Patient and doctor selection
- Status management

#### `/frontend/src/components/Employees.js`
- Employee list with filters
- Add employee form
- Edit employee form
- Delete employee
- Salary validation (triggers)
- Admin-only access

#### `/frontend/src/components/Invoices.js`
- Invoice list with filters
- Create invoice form
- Edit invoice form
- Delete invoice
- Appointment and patient linking
- Payment tracking

#### `/frontend/src/components/Reports.js`
- Report generation buttons
- Query input forms
- Data visualization
- Export-ready tables
- 4 reports + 4 queries

#### `/frontend/public/index.html`
- HTML template
- React root div
- Meta tags

#### `/frontend/package.json`
Dependencies:
- react - UI library
- react-dom - React DOM rendering
- react-router-dom - Client-side routing
- react-scripts - Build scripts
- axios - HTTP client

## How Files Work Together

### Authentication Flow:
1. User enters credentials in `Login.js`
2. Request sent via `api.js` to `backend/routes/auth.js`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token included in all subsequent requests via `api.js` interceptor
6. Backend `auth.js` middleware validates token on protected routes

### Data Flow Example (Creating a Patient):
1. User fills form in `Patients.js`
2. Form submission calls `patientAPI.create()` from `api.js`
3. Request sent to `POST /api/patients` in `backend/routes/patients.js`
4. Route validates user has Admin/Receptionist role
5. Data inserted into MySQL via `database.js` connection
6. Success response returned to frontend
7. Patient list refreshed to show new patient

### Trigger Activation Example:
1. Admin updates employee salary in `Employees.js`
2. PUT request sent to `/api/employees/:id`
3. MySQL trigger `before_employee_update_salary_check` fires
4. Trigger checks if receptionist salary exceeds average doctor salary
5. If violation: Error thrown, caught by backend, returned to frontend
6. If valid: Update proceeds normally

## Port Configuration

- **Backend:** Port 5000 (configurable in `.env`)
- **Frontend:** Port 3000 (default React dev server)
- **MySQL:** Port 3306 (default MySQL port)

## Database Tables

1. **patient** - Patient information and medical history
2. **employee** - Staff information and credentials
3. **appointment** - Appointment scheduling
4. **invoice** - Billing information
5. **exam** - Examination records
6. **prescription** - Prescription details
7. **insurance** - Insurance company information
8. **coveredby** - Patient-insurance relationship
9. **dependents** - Employee dependents

## Key Features by File

### User Authentication (Requirement 1)
- Files: `auth.js` (backend), `Login.js`, `api.js`
- 3 Roles: Admin, Doctor, Receptionist

### Data Entry Forms (Requirement 2)
- Files: `Patients.js`, `Employees.js`, `Appointments.js`, `Invoices.js`
- All support Create, Read, Update, Delete operations

### Triggers (Requirement 3)
- File: `database-init.sql`
- Trigger 1: Salary constraint for receptionists
- Trigger 2: Negative invoice total prevention

### Data Queries (Requirement 4)
- File: `reports.js` (backend), `Reports.js` (frontend)
- 4 queries with parameters

### Data Reports (Requirement 5)
- File: `reports.js` (backend), `Reports.js` (frontend)
- 4 comprehensive reports with analytics

## Running the Application

1. Start MySQL server
2. Run `npm start` in `/backend` directory
3. Run `npm start` in `/frontend` directory
4. Access application at `http://localhost:3000`

## Configuration Files

- `/backend/.env` - Database and JWT configuration
- `/backend/package.json` - Backend dependencies
- `/frontend/package.json` - Frontend dependencies
- `/backend/database-init.sql` - Database schema and sample data
