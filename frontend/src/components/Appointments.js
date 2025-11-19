import React, { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI, employeeAPI } from '../services/api';

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [completingAppointment, setCompletingAppointment] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [formData, setFormData] = useState({
    patientID: '',
    employeeID: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentStatus: 'Scheduled',
    reason: '',
    appointmentType: 'Normal',
  });
  const [completionData, setCompletionData] = useState({
    doctorNotes: '',
    requiresSpecialist: false,
    specialistType: '',
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterDate, filterDoctor]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      if (filterDoctor) params.employeeID = parseInt(filterDoctor);

      const [apptResponse, patientResponse, employeeResponse] = await Promise.all([
        appointmentAPI.getAll(params),
        patientAPI.getAll(),
        employeeAPI.getAll({ type: 'Doctor' }),
      ]);

      setAppointments(apptResponse.data);
      setPatients(patientResponse.data);
      setEmployees(employeeResponse.data);

    } catch (error) {
      console.error('Fetch data error:', error);
      showMessage('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await appointmentAPI.update(editingAppointment.apptID, formData);
        showMessage('success', 'Appointment updated successfully');
      } else {
        await appointmentAPI.create(formData);
        showMessage('success', 'Appointment created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientID: appointment.patientID,
      employeeID: appointment.employeeID || '',
      appointmentDate: appointment.appointmentDate?.split('T')[0] || '',
      appointmentTime: appointment.appointmentTime || '',
      appointmentStatus: appointment.appointmentStatus || 'Scheduled',
      reason: appointment.reason || '',
      appointmentType: appointment.appointmentType || 'Normal',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentAPI.delete(id);
        showMessage('success', 'Appointment deleted successfully');
        fetchData();
      } catch (error) {
        showMessage('error', 'Failed to delete appointment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientID: '',
      employeeID: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentStatus: 'Scheduled',
      reason: '',
      appointmentType: 'Normal',
    });
    setEditingAppointment(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenCompleteModal = (appointment) => {
    setCompletingAppointment(appointment);
    setCompletionData({
      doctorNotes: '',
      requiresSpecialist: false,
      specialistType: '',
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.complete(completingAppointment.apptID, completionData);
      showMessage('success', 'Appointment marked as completed');
      setShowCompleteModal(false);
      setCompletingAppointment(null);
      fetchData();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        showMessage('success', 'Appointment cancelled');
        fetchData();
      } catch (error) {
        showMessage('error', 'Failed to cancel appointment');
      }
    }
  };

  const handleCompletionInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompletionData({
      ...completionData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const canModify = user.employeeType === 'Admin' || user.employeeType === 'Receptionist';
  const canEdit = user.employeeType === 'Admin' || user.employeeType === 'Receptionist' || user.employeeType === 'Doctor';
  const isDoctor = user.employeeType === 'Doctor' || user.employeeType === 'Admin';

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Appointments</h1>
        {canModify && (
          <button onClick={openAddModal} className="btn btn-primary">
            Schedule New Appointment
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="search-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', margin: 0 }}>
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', margin: 0 }}>
          <label>Doctor</label>
          <select
            className="form-control"
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {employees
              .filter(employee => {
                if (user.employeeType === 'Doctor') {
                  // user object has userID, not employeeID
                  const empID = parseInt(employee.employeeID);
                  const userID = parseInt(user.userID);
                  return empID === userID;
                }
                return true;
              })
              .map((employee) => (
                <option key={employee.employeeID} value={String(employee.employeeID)}>
                  Dr. {employee.firstName} {employee.lastName}
                </option>
              ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', margin: 0 }}>
          <label>Status</label>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-Show">No-Show</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              setFilterDate(new Date().toISOString().split('T')[0]);
              setFilterDoctor('');
              setFilterStatus('');
            }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Reason</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.apptID}>
                <td>{appointment.apptID}</td>
                <td>{appointment.patientName}</td>
                <td>{appointment.employeeName || 'Not Assigned'}</td>
                <td>{appointment.appointmentDate?.split('T')[0]}</td>
                <td>{appointment.appointmentTime}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      appointment.appointmentType === 'Emergency' ? '#dc3545' :
                      appointment.appointmentType === 'Checkup' ? '#17a2b8' : '#6c757d',
                    color: '#fff',
                    fontWeight: appointment.appointmentType === 'Emergency' ? '700' : '500',
                  }}>
                    {appointment.appointmentType === 'Emergency' && '🚨 '}
                    {appointment.appointmentType || 'Normal'}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      appointment.appointmentStatus === 'Completed' ? '#d4edda' :
                      appointment.appointmentStatus === 'Scheduled' ? '#d1ecf1' :
                      appointment.appointmentStatus === 'Cancelled' ? '#f8d7da' : '#fff3cd',
                    color:
                      appointment.appointmentStatus === 'Completed' ? '#155724' :
                      appointment.appointmentStatus === 'Scheduled' ? '#0c5460' :
                      appointment.appointmentStatus === 'Cancelled' ? '#721c24' : '#856404',
                  }}>
                    {appointment.appointmentStatus}
                  </span>
                </td>
                <td>{appointment.reason}</td>
                {canEdit && (
                  <td>
                    <div className="table-actions">
                      {isDoctor && appointment.appointmentStatus === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleOpenCompleteModal(appointment)}
                            className="btn btn-sm btn-success"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.apptID)}
                            className="btn btn-sm btn-danger"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="btn btn-sm btn-warning"
                      >
                        Edit
                      </button>
                      {user.employeeType === 'Admin' && (
                        <button
                          onClick={() => handleDelete(appointment.apptID)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient *</label>
                <select
                  name="patientID"
                  className="form-control"
                  value={formData.patientID}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patientID} value={patient.patientID}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor</label>
                <select
                  name="employeeID"
                  className="form-control"
                  value={formData.employeeID}
                  onChange={handleInputChange}
                >
                  <option value="">Select Doctor</option>
                  {employees.map((employee) => (
                    <option key={employee.employeeID} value={employee.employeeID}>
                      {employee.firstName} {employee.lastName} - {employee.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="appointmentDate"
                  className="form-control"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  name="appointmentTime"
                  className="form-control"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="appointmentStatus"
                  className="form-control"
                  value={formData.appointmentStatus}
                  onChange={handleInputChange}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-Show">No-Show</option>
                </select>
              </div>
              <div className="form-group">
                <label>Appointment Type</label>
                <select
                  name="appointmentType"
                  className="form-control"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  name="reason"
                  className="form-control"
                  value={formData.reason}
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingAppointment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && completingAppointment && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Appointment</h2>
              <button onClick={() => setShowCompleteModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Patient:</strong> {completingAppointment.patientName}<br />
                <strong>Date:</strong> {completingAppointment.appointmentDate?.split('T')[0]}<br />
                <strong>Time:</strong> {completingAppointment.appointmentTime}
              </div>

              <div className="form-group">
                <label>Doctor's Notes *</label>
                <textarea
                  name="doctorNotes"
                  className="form-control"
                  value={completionData.doctorNotes}
                  onChange={handleCompletionInputChange}
                  placeholder="Describe what happened during the appointment..."
                  rows="5"
                  required
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="requiresSpecialist"
                    checked={completionData.requiresSpecialist}
                    onChange={handleCompletionInputChange}
                  />
                  Patient requires specialist referral
                </label>
              </div>

              {completionData.requiresSpecialist && (
                <div className="form-group">
                  <label>Specialist Type *</label>
                  <select
                    name="specialistType"
                    className="form-control"
                    value={completionData.specialistType}
                    onChange={handleCompletionInputChange}
                    required
                  >
                    <option value="">Select Specialist Type</option>
                    <option value="Optometrist">Optometrist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Optician">Optician</option>
                    <option value="Glaucoma Specialist">Glaucoma Specialist</option>
                    <option value="Retina Specialist">Retina Specialist</option>
                    <option value="Cornea Specialist">Cornea Specialist</option>
                    <option value="Pediatric Ophthalmologist">Pediatric Ophthalmologist</option>
                    <option value="Neuro-Ophthalmologist">Neuro-Ophthalmologist</option>
                    <option value="Oculoplastic Surgeon">Oculoplastic Surgeon</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-success">
                  Mark as Completed
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
