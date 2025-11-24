import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Employees = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    middleInit: '',
    lastName: '',
    gender: '',
    birthdate: '',
    employeeAddress: '',
    employeeType: '',
    specialization: '',
    yearsExperience: '',
    startedOn: '',
    endedOn: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    emergencyEmail: '',
    salary: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, [search, typeFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ search, type: typeFilter });
      setEmployees(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch employees');
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
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.employeeID, formData);
        showMessage('success', 'Employee updated successfully');
      } else {
        await employeeAPI.create(formData);
        showMessage('success', 'Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      middleInit: employee.middleInit || '',
      lastName: employee.lastName || '',
      gender: employee.gender || '',
      birthdate: employee.birthdate?.split('T')[0] || '',
      employeeAddress: employee.employeeAddress || '',
      employeeType: employee.employeeType || '',
      specialization: employee.specialization || '',
      yearsExperience: employee.yearsExperience || '',
      startedOn: employee.startedOn?.split('T')[0] || '',
      endedOn: employee.endedOn?.split('T')[0] || '',
      email: employee.email || '',
      phone: employee.phone || '',
      emergencyPhone: employee.emergencyPhone || '',
      emergencyEmail: employee.emergencyEmail || '',
      salary: employee.salary || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        showMessage('success', 'Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        showMessage('error', 'Failed to delete employee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleInit: '',
      lastName: '',
      gender: '',
      birthdate: '',
      employeeAddress: '',
      employeeType: '',
      specialization: '',
      yearsExperience: '',
      startedOn: '',
      endedOn: '',
      email: '',
      phone: '',
      emergencyPhone: '',
      emergencyEmail: '',
      salary: '',
    });
    setEditingEmployee(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const userRole = (user?.employeeType || user?.role || "");

  if (loading) return <div className="loading">Loading...</div>;
  if (userRole !== 'Admin') {
    return (
      <div className="container">
        <div className="alert alert-error">You do not have permission to view this page.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Employees</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          Add New Employee
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Doctor">Doctor</option>
          <option value="Receptionist">Receptionist</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Specialization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employeeID}>
                <td>{employee.employeeID}</td>
                <td>{employee.firstName} {employee.middleInit} {employee.lastName}</td>
                <td>{employee.employeeType}</td>
                <td>{employee.specialization || '-'}</td>
                <td>{employee.email}</td>
                <td>{employee.phone || '-'}</td>
                <td>${employee.salary ? parseFloat(employee.salary).toLocaleString() : '-'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-sm btn-warning"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.employeeID)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Middle Initial</label>
                <input
                  type="text"
                  name="middleInit"
                  className="form-control"
                  maxLength="1"
                  value={formData.middleInit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Employee Type *</label>
                <select
                  name="employeeType"
                  className="form-control"
                  value={formData.employeeType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {formData.employeeType === 'Doctor' && (
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Salary</label>
                <input
                  type="number"
                  name="salary"
                  className="form-control"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="birthdate"
                  className="form-control"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="employeeAddress"
                  className="form-control"
                  value={formData.employeeAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startedOn"
                  className="form-control"
                  value={formData.startedOn}
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Create'}
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
    </div>
  );
};

export default Employees;
