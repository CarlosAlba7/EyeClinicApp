import { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

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
    email: '',
    phone: '',
    salary: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, filterType]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;

      const response = await employeeAPI.getAll(params);
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

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName || '',
        middleInit: employee.middleInit || '',
        lastName: employee.lastName || '',
        gender: employee.gender || '',
        birthdate: employee.birthdate ? employee.birthdate.split('T')[0] : '',
        employeeAddress: employee.employeeAddress || '',
        employeeType: employee.employeeType || '',
        specialization: employee.specialization || '',
        yearsExperience: employee.yearsExperience || '',
        startedOn: employee.startedOn ? employee.startedOn.split('T')[0] : '',
        email: employee.email || '',
        phone: employee.phone || '',
        salary: employee.salary || ''
      });
    } else {
      setEditingEmployee(null);
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
        email: '',
        phone: '',
        salary: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (employeeID) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeeAPI.delete(employeeID);
      showMessage('success', 'Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete employee');
    }
  };

  if (loading && employees.length === 0) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Employee Management</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '200px' }}
          />
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Types</option>
            <option value="Doctor">Doctors</option>
            <option value="Receptionist">Receptionists</option>
            <option value="Admin">Admins</option>
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
          >
            Add New Employee
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : employees.length === 0 ? (
          <p>No employees found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Specialization</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Start Date</th>
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
                  <td>{employee.specialization || 'N/A'}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>{employee.startedOn ? new Date(employee.startedOn).toLocaleDateString() : 'N/A'}</td>
                  <td>${parseFloat(employee.salary || 0).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleOpenModal(employee)}
                      className="btn btn-sm btn-info"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.employeeID)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={handleCloseModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name <span class="required-star">*</span></label>
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
                    value={formData.middleInit}
                    onChange={handleInputChange}
                    maxLength="1"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name <span class="required-star">*</span></label>
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
                  <label>Gender <span class="required-star">*</span></label>
                  <select
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Birthdate <span class="required-star">*</span></label>
                  <input
                    type="date"
                    name="birthdate"
                    className="form-control"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Employee Type <span class="required-star">*</span></label>
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
                  <>
                    <div className="form-group">
                      <label>Specialization <span class="required-star">*</span></label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-control"
                        value={formData.specialization}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Years of Experience <span class="required-star">*</span></label>
                      <input
                        type="number"
                        name="yearsExperience"
                        className="form-control"
                        value={formData.yearsExperience}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
                  <label>Email <span class="required-star">*</span></label>
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
                  <label>Start Date <span class="required-star">*</span></label>
                  <input
                    type="date"
                    name="startedOn"
                    className="form-control"
                    value={formData.startedOn}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Salary <span class="required-star">*</span></label>
                  <input
                    type="number"
                    name="salary"
                    className="form-control"
                    value={formData.salary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Create'} Employee
                </button>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default EmployeeManagement;
