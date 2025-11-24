📘Eye Clinic Management System
A full-stack web application for managing an eye clinic, including patient accounts, booking appointments, shop purchases, alerts, employee management, and generating reports.

🚀 Features
🙍‍♂️ / 🙍‍♀️ Patient Portal
- Sign up & login  
- Book and view appointments  
- View doctors  
- Edit profile  
- Shop for eye care products

👩‍⚕️ Doctor Portal
- View assigned appointments
- Edit appointments'information
- Respond to Emergency appointments
- View patients's information

☎️ Receptionist Portal
- Manage appointments
- View Patients'information
- Low-stock alerts
- Shop Management

🧑‍💼 Admin Portal
- Full employee management
- Appointment management
- Patient management
- Shop management
- Low-stock alerts
- Generate reports

🛠️ Installation Instructions
1. Required Technologies
- Node.js
- MySQL Workbench
- npm (come with Node)
2. Backend Setup
Step 1: Navigate to the backend folder
Step 2: Install dependencies using 'npm install' in the terminal
Step 3: Create a '.env' file inside '/backend'
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eyeclinic
JWT_SECRET=your_secret_key
PORT=5000
Step 4: Import MySQL database
- Open MySQL Workbench
- Go to File → Open SQL Script
- Select the database.sql
- Run the script
- Ensure the database name matches DB_NAME
Step 5: Start the backend by using 'npm start' in the terminal
If successful, you will see something like this:
<img width="388" height="102" alt="image" src="https://github.com/user-attachments/assets/fe0dd18c-da68-4196-a1bf-b7eb52e40139" />
