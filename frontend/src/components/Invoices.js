import React, { useState, useEffect } from 'react';
import { invoiceAPI, appointmentAPI, patientAPI } from '../services/api';

const Invoices = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    apptID: '',
    patientID: '',
    dateIssued: new Date().toISOString().split('T')[0],
    invoiceStatus: 'Pending',
    methodOfPay: '',
    invoiceTotal: '',
    specialistRefer: '',
    summary: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [invoiceResponse, appointmentResponse, patientResponse] = await Promise.all([
        invoiceAPI.getAll({ status: statusFilter }),
        appointmentAPI.getAll({ status: 'Completed' }),
        patientAPI.getAll(),
      ]);
      setInvoices(invoiceResponse.data);
      setAppointments(appointmentResponse.data);
      setPatients(patientResponse.data);
    } catch (error) {
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

    if (name === 'apptID') {
      const selectedAppt = appointments.find(a => a.apptID === parseInt(value));
      if (selectedAppt) {
        setFormData(prev => ({ ...prev, patientID: selectedAppt.patientID }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await invoiceAPI.update(editingInvoice.invoiceID, {
          invoiceStatus: formData.invoiceStatus,
          methodOfPay: formData.methodOfPay,
          invoiceTotal: formData.invoiceTotal,
          specialistRefer: formData.specialistRefer,
          summary: formData.summary,
        });
        showMessage('success', 'Invoice updated successfully');
      } else {
        await invoiceAPI.create(formData);
        showMessage('success', 'Invoice created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      apptID: invoice.apptID,
      patientID: invoice.patientID,
      dateIssued: invoice.dateIssued?.split('T')[0] || '',
      invoiceStatus: invoice.invoiceStatus || 'Pending',
      methodOfPay: invoice.methodOfPay || '',
      invoiceTotal: invoice.invoiceTotal || '',
      specialistRefer: invoice.specialistRefer || '',
      summary: invoice.summary || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceAPI.delete(id);
        showMessage('success', 'Invoice deleted successfully');
        fetchData();
      } catch (error) {
        showMessage('error', 'Failed to delete invoice');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      apptID: '',
      patientID: '',
      dateIssued: new Date().toISOString().split('T')[0],
      invoiceStatus: 'Pending',
      methodOfPay: '',
      invoiceTotal: '',
      specialistRefer: '',
      summary: '',
    });
    setEditingInvoice(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  const canAccess = user.employeeType === 'Admin' || user.employeeType === 'Receptionist';
  if (!canAccess) {
    return (
      <div className="container">
        <div className="alert alert-error">You do not have permission to view this page.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Invoices</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          Create New Invoice
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="search-bar">
        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Patient</th>
              <th>Date Issued</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoiceID}>
                <td>{invoice.invoiceID}</td>
                <td>{invoice.patientName}</td>
                <td>{invoice.dateIssued?.split('T')[0]}</td>
                <td>${parseFloat(invoice.invoiceTotal).toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 
                      invoice.invoiceStatus === 'Paid' ? '#d4edda' :
                      invoice.invoiceStatus === 'Pending' ? '#fff3cd' : '#f8d7da',
                    color: 
                      invoice.invoiceStatus === 'Paid' ? '#155724' :
                      invoice.invoiceStatus === 'Pending' ? '#856404' : '#721c24',
                  }}>
                    {invoice.invoiceStatus}
                  </span>
                </td>
                <td>{invoice.methodOfPay || '-'}</td>
                <td>{invoice.createdByName || '-'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="btn btn-sm btn-warning"
                    >
                      Edit
                    </button>
                    {user.employeeType === 'Admin' && (
                      <button
                        onClick={() => handleDelete(invoice.invoiceID)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    )}
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
              <h2>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {!editingInvoice && (
                <>
                  <div className="form-group">
                    <label>Appointment *</label>
                    <select
                      name="apptID"
                      className="form-control"
                      value={formData.apptID}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Appointment</option>
                      {appointments.map((appt) => (
                        <option key={appt.apptID} value={appt.apptID}>
                          Appt #{appt.apptID} - {appt.patientName} - {appt.appointmentDate?.split('T')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Issued *</label>
                    <input
                      type="date"
                      name="dateIssued"
                      className="form-control"
                      value={formData.dateIssued}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Invoice Total *</label>
                <input
                  type="number"
                  name="invoiceTotal"
                  className="form-control"
                  step="0.01"
                  min="0"
                  value={formData.invoiceTotal}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="invoiceStatus"
                  className="form-control"
                  value={formData.invoiceStatus}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="methodOfPay"
                  className="form-control"
                  value={formData.methodOfPay}
                  onChange={handleInputChange}
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div className="form-group">
                <label>Specialist Referral</label>
                <input
                  type="text"
                  name="specialistRefer"
                  className="form-control"
                  value={formData.specialistRefer}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Summary</label>
                <textarea
                  name="summary"
                  className="form-control"
                  value={formData.summary}
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingInvoice ? 'Update' : 'Create'}
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

export default Invoices;
