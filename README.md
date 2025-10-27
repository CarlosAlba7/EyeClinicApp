# Eye Clinic Management System

A full-stack web application for managing an eye clinic's operations, including patient records, appointments, staff management, invoicing, and comprehensive reporting.

## 🎯 Project Overview

This application was built to satisfy the following requirements:

1. ✅ **User Authentication** - Role-based access control (Admin, Doctor, Receptionist)
2. ✅ **Data Entry Forms** - Complete CRUD operations for all entities
3. ✅ **Database Triggers** - 2 business constraint triggers implemented
4. ✅ **Data Queries** - 4 parameterized queries for data analysis
5. ✅ **Data Reports** - 4 comprehensive reports with analytics

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL 8.0** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## 📋 Features

### User Roles & Permissions

#### Admin
- Full access to all features
- Manage employees (CRUD)
- Manage patients (CRUD)
- Manage appointments (CRUD)
- Manage invoices (CRUD)
- View all reports and queries
- Delete any record

#### Doctor
- View patients
- View and update appointments
- View reports

#### Receptionist
- Manage patients (CRUD)
- Manage appointments (CRUD)
- Manage invoices (CRUD)
- View reports

### Core Functionality

#### Patient Management
- Add new patients with complete medical history
- Search patients by name, email, or phone
- Update patient information
- Track vision and medical history
- Insurance information management

#### Appointment Scheduling
- Schedule appointments with doctors
- Filter by status (Scheduled, Completed, Cancelled, No-Show)
- Assign doctors to appointments
- Track appointment reasons and outcomes

#### Employee Management (Admin Only)
- Add new employees with role assignment
- Track specializations and experience
- Salary management with constraint triggers
- Employee contact and emergency information

#### Invoice Management
- Create invoices linked to appointments
- Track payment status (Pending, Paid, Overdue)
- Multiple payment methods
- Invoice summary and specialist referrals

### Database Triggers

#### Trigger 1: Salary Constraint
**Name:** `before_employee_update_salary_check`
**Purpose:** Ensures receptionist salaries don't exceed average doctor salary
**Business Rule:** Maintains organizational salary hierarchy

```sql
CREATE TRIGGER before_employee_update_salary_check 
BEFORE UPDATE ON employee FOR EACH ROW
BEGIN
    DECLARE avg_doctor_salary DECIMAL(10,2);
    SELECT AVG(salary) INTO avg_doctor_salary
    FROM employee WHERE employeeType = 'Doctor';
    
    IF NEW.employeeType = 'Receptionist' AND 
       NEW.salary > avg_doctor_salary THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Receptionist salary cannot exceed average Doctor salary';
    END IF;
END
```

#### Trigger 2: Invoice Validation
**Name:** `before_invoice_insert_total_check` / `before_invoice_update_total_check`
**Purpose:** Prevents negative invoice totals
**Business Rule:** Maintains data integrity for financial records

```sql
CREATE TRIGGER before_invoice_insert_total_check 
BEFORE INSERT ON invoice FOR EACH ROW
BEGIN
    IF NEW.invoiceTotal < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invoice total cannot be negative';
    END IF;
END
```

### Reports

#### Report 1: Appointment Statistics
- Breakdown of appointments by status
- Percentage calculations
- Visual representation of appointment distribution

#### Report 2: Revenue by Month
- Monthly revenue trends
- Invoice count and averages
- Paid vs pending amounts
- Last 12 months of data

#### Report 3: Employee Performance
- Appointment counts per employee
- Completion rates
- Performance metrics by role

#### Report 4: Patient Demographics
- Gender distribution with percentages
- Age group analysis
- Population statistics

### Data Queries

#### Query 1: Patients by Condition
**Input:** Medical condition keyword
**Output:** List of patients with matching conditions in medical or vision history
**Use Case:** Quickly identify patients with specific health concerns

#### Query 2: Appointments by Date Range
**Input:** Start date and end date
**Output:** All appointments within the specified range with patient and doctor details
**Use Case:** Schedule analysis and resource planning

#### Query 3: Outstanding Invoices
**Output:** All pending and overdue invoices with patient contact information
**Analysis:** Total outstanding amount and days overdue
**Use Case:** Accounts receivable management

#### Query 4: Doctor Workload
**Input:** Optional month and year
**Output:** Appointment breakdown by doctor including scheduled, completed, and cancelled
**Use Case:** Staff workload balancing and resource allocation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- npm or yarn

### Installation

1. **Clone or extract the project**
   ```bash
   cd eyeclinic-app
   ```

2. **Setup Database**
   ```bash
   mysql -u root -p < backend/database-init.sql
   ```

3. **Configure Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Edit `.env` file:
   ```
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

4. **Start Backend**
   ```bash
   npm start
   ```

5. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

6. **Access Application**
   - Open browser to http://localhost:3000
   - Use demo credentials to login

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eyeclinic.com | password123 |
| Doctor | doctor@eyeclinic.com | password123 |
| Receptionist | receptionist@eyeclinic.com | password123 |

## 📁 Project Structure

```
eyeclinic-app/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API route handlers
│   ├── .env            # Environment variables
│   ├── database-init.sql
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API service layer
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing (production ready)
- SQL injection prevention via parameterized queries
- CORS configuration
- Token expiration (8 hours)

## 📊 Database Schema

### Main Tables
- **patient** - Patient records and medical history
- **employee** - Staff information and credentials
- **appointment** - Appointment scheduling
- **invoice** - Billing and payments
- **exam** - Examination records
- **prescription** - Prescriptions
- **insurance** - Insurance providers
- **coveredby** - Patient-insurance relationships
- **dependents** - Employee dependents

### Relationships
- One-to-many: Patient → Appointments
- One-to-many: Employee → Appointments
- One-to-one: Appointment → Invoice
- Many-to-many: Patient ↔ Insurance (via coveredby)

## 🎨 UI Features

- Responsive design (mobile-friendly)
- Clean and modern interface
- Color-coded status indicators
- Search and filter capabilities
- Modal forms for data entry
- Real-time validation
- Success/error notifications

## 🔧 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Patients
- GET `/api/patients` - List patients
- POST `/api/patients` - Create patient
- PUT `/api/patients/:id` - Update patient
- DELETE `/api/patients/:id` - Delete patient

### Appointments
- GET `/api/appointments` - List appointments
- POST `/api/appointments` - Create appointment
- PUT `/api/appointments/:id` - Update appointment
- DELETE `/api/appointments/:id` - Delete appointment

### Employees
- GET `/api/employees` - List employees
- POST `/api/employees` - Create employee
- PUT `/api/employees/:id` - Update employee
- DELETE `/api/employees/:id` - Delete employee

### Invoices
- GET `/api/invoices` - List invoices
- POST `/api/invoices` - Create invoice
- PUT `/api/invoices/:id` - Update invoice
- DELETE `/api/invoices/:id` - Delete invoice

### Reports
- GET `/api/reports/appointment-statistics`
- GET `/api/reports/revenue-by-month`
- GET `/api/reports/employee-performance`
- GET `/api/reports/patient-demographics`
- GET `/api/reports/patients-by-condition?condition=X`
- GET `/api/reports/appointments-by-date-range?startDate=X&endDate=Y`
- GET `/api/reports/outstanding-invoices`
- GET `/api/reports/doctor-workload?month=X&year=Y`

## 🐛 Troubleshooting

### Backend Issues
- **Can't connect to database:** Check MySQL is running and credentials in `.env`
- **Port already in use:** Kill process on port 5000 or change PORT in `.env`
- **Trigger errors:** Drop existing triggers before running database-init.sql

### Frontend Issues
- **API errors:** Ensure backend is running on port 5000
- **Build errors:** Delete node_modules and run `npm install` again
- **Port conflicts:** Use `PORT=3001 npm start` to use different port

## 📝 Additional Documentation

- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `FILE_STRUCTURE.md` - Complete file organization and descriptions

## 🚢 Deployment

### Azure Preparation (for future deployment)
1. Build frontend: `npm run build` in frontend directory
2. Configure Azure App Service for backend
3. Configure Azure Static Web Apps for frontend
4. Update API base URL in frontend
5. Configure MySQL database on Azure
6. Set environment variables in Azure portal

## 📄 License

This project is created for educational purposes.

## 👥 Authors

Eye Clinic Management System - Full Stack Application

## 🙏 Acknowledgments

- React documentation
- Express.js documentation
- MySQL documentation
- Stack Overflow community
