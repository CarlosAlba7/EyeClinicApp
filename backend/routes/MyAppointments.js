import React, { useEffect, useState } from "react";
import { patientPortalAPI } from "../services/api";
import "./MyAppointments.css";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    patientPortalAPI.getMyAppointments().then((res) => setAppointments(res.data));
  }, []);

  return (
    <div className="page-container">
      <h1>My Appointments</h1>

      <div className="appointments-list">
        {appointments.length === 0 && <p>No appointments found.</p>}

        {appointments.map((appt) => (
          <div className="appointment-card" key={appt.appointmentID}>
            <h3>{appt.status}</h3>
            <p><strong>Date:</strong> {appt.appointmentDate}</p>
            <p><strong>Time:</strong> {appt.appointmentTime}</p>
            <p><strong>Doctor:</strong> {appt.doctorName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
