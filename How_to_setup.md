# Eye Clinic Management System - Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **MySQL Server** (version 8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify installation: `mysql --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step 1: Database Setup

1. **Start MySQL Server**
   - Ensure your MySQL server is running on your machine

2. **Create the Database**
   - Open MySQL command line or MySQL Workbench
   - Navigate to the backend folder in the project
   - Run the database initialization script:
   
   ```bash
   mysql -u root -p < database-init.sql
   ```
   
   OR manually execute the SQL file in MySQL Workbench

3. **Verify Database Creation**
   - Login to MySQL: `mysql -u root -p`
   - Check if database exists: `SHOW DATABASES;`
   - You should see `eyeclinic` in the list
   - Use the database: `USE eyeclinic;`
   - Check tables: `SHOW TABLES;`

## Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Open the `.env` file in the backend directory
   - Update the following variables with your MySQL credentials:
   
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=eyeclinic
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   ```
   
   **Important:** Replace `your_mysql_password_here` with your actual MySQL root password

4. **Test Database Connection**
   - Start the backend server:
   ```bash
   npm start
   ```
   
   - You should see: "Server is running on port 5000"
   - If you see database connection errors, check your MySQL credentials in `.env`

5. **Keep Backend Running**
   - Leave this terminal window open with the backend server running

## Step 3: Frontend Setup

1. **Open a New Terminal Window/Tab**

2. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   
   Note: This may take a few minutes to complete

4. **Start the Frontend Development Server**
   ```bash
   npm start
   ```
   
   - The application should automatically open in your default browser
   - If it doesn't, manually navigate to: http://localhost:3000

## Step 4: Login and Test

1. **Access the Application**
   - Open your browser and go to: http://localhost:3000
   - You should see the login page

2. **Login with Demo Credentials**
   
   **Admin Account:**
   - Email: admin@eyeclinic.com
   - Password: password123
   
   **Doctor Account:**
   - Email: doctor@eyeclinic.com
   - Password: password123
   
   **Receptionist Account:**
   - Email: receptionist@eyeclinic.com
   - Password: password123

3. **Verify Functionality**
   - Test navigation between different pages
   - Try creating, editing, and viewing records
   - Generate reports
   - Test different user roles to see permission differences

## Common Issues and Troubleshooting

### Issue 1: Backend won't start
**Error:** "Cannot connect to MySQL"
**Solution:**
- Verify MySQL is running: Check services or run `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database `eyeclinic` exists

### Issue 2: Frontend shows "Network Error"
**Error:** API calls failing
**Solution:**
- Ensure backend is running on port 5000
- Check backend terminal for errors
- Verify CORS is enabled (already configured)

### Issue 3: Port Already in Use
**Error:** "Port 3000 is already in use"
**Solution:**
- Kill the process using the port
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- Mac/Linux: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `PORT=3001 npm start`

### Issue 4: npm install fails
**Error:** Dependency installation errors
**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Ensure you have proper internet connection

### Issue 5: MySQL Trigger Errors
**Error:** Trigger already exists
**Solution:**
- Drop existing triggers before running init script:
```sql
DROP TRIGGER IF EXISTS before_employee_update_salary_check;
DROP TRIGGER IF EXISTS before_employee_insert_salary_check;
DROP TRIGGER IF EXISTS before_invoice_insert_total_check;
DROP TRIGGER IF EXISTS before_invoice_update_total_check;
```

## Development vs Production

### For Development (Current Setup):
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Both must be running simultaneously

### For Production (Azure):
- Build frontend: `npm run build` in frontend directory
- Deploy built files to Azure Static Web Apps
- Deploy backend to Azure App Service
- Update API base URL in frontend code
- Use environment variables for configuration

## Project Structure

```
eyeclinic-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── employees.js
│   │   ├── appointments.js
│   │   ├── invoices.js
│   │   └── reports.js
│   ├── .env
│   ├── database-init.sql
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Navigation.js
    │   │   ├── Dashboard.js
    │   │   ├── Patients.js
    │   │   ├── Appointments.js
    │   │   ├── Employees.js
    │   │   ├── Invoices.js
    │   │   └── Reports.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## Additional Notes

1. **Database Triggers:**
   - Trigger 1: Prevents receptionist salary from exceeding average doctor salary
   - Trigger 2: Prevents negative invoice totals

2. **User Roles:**
   - Admin: Full access to all features
   - Doctor: Can view and update appointments
   - Receptionist: Can manage patients, appointments, and invoices

3. **Security:**
   - JWT tokens expire after 8 hours
   - Change JWT_SECRET in production
   - Implement proper password hashing for production

4. **Data Queries Available:**
   - Query 1: Search patients by medical condition
   - Query 2: Filter appointments by date range
   - Query 3: View outstanding invoices
   - Query 4: Analyze doctor workload

5. **Reports Available:**
   - Report 1: Appointment statistics by status
   - Report 2: Monthly revenue analysis
   - Report 3: Employee performance metrics
   - Report 4: Patient demographics

## Support

If you encounter issues not covered in this guide:
1. Check the console logs in both terminal windows
2. Verify all prerequisites are correctly installed
3. Ensure ports 3000 and 5000 are not blocked by firewall
4. Review error messages carefully for specific issues

## Next Steps

After successful setup:
1. Explore all features with different user roles
2. Add more sample data through the UI
3. Test all CRUD operations
4. Generate and review different reports
5. Prepare for Azure deployment (if needed)
