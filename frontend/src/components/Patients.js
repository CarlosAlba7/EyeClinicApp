import React, { useState, useEffect, useCallback } from "react";

import { patientAPI } from "../services/api";

const Patients = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    firstName: "",
    middleInit: "",
    lastName: "",
    gender: "",
    patientBirthdate: "",
    patientAddress: "",
    email: "",
    phone: "",
    emergencyEmail: "",
    emergencyPhone: "",
    visionHistory: "",
    medHistory: "",
    insuranceNote: "",
  });

  // ✅ FIX 1: permission based on user.role (new auth)
  const canModify = user?.role === "Admin" || user?.role === "Receptionist";

  // ✅ FIX 2: define fetchPatients BEFORE useEffect (no ESLint warning)
  const fetchPatients = useCallback(async () => {
    try {
      const response = await patientAPI.getAll({ search });
      setPatients(response.data);
    } catch (error) {
      showMessage("error", "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Load patients whenever search changes
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await patientAPI.update(editingPatient.patientID, formData);
        showMessage("success", "Patient updated successfully");
      } else {
        await patientAPI.create(formData);
        showMessage("success", "Patient created successfully");
      }
      setShowModal(false);
      resetForm();
      setLoading(true);
      fetchPatients();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      middleInit: patient.middleInit || "",
      lastName: patient.lastName || "",
      gender: patient.gender || "",
      patientBirthdate: patient.patientBirthdate?.split("T")[0] || "",
      patientAddress: patient.patientAddress || "",
      email: patient.email || "",
      phone: patient.phone || "",
      emergencyEmail: patient.emergencyEmail || "",
      emergencyPhone: patient.emergencyPhone || "",
      visionHistory: patient.visionHistory || "",
      medHistory: patient.medHistory || "",
      insuranceNote: patient.insuranceNote || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      await patientAPI.delete(id);
      showMessage("success", "Patient deleted successfully");
      setLoading(true);
      fetchPatients();
    } catch (error) {
      showMessage("error", "Failed to delete patient");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleInit: "",
      lastName: "",
      gender: "",
      patientBirthdate: "",
      patientAddress: "",
      email: "",
      phone: "",
      emergencyEmail: "",
      emergencyPhone: "",
      visionHistory: "",
      medHistory: "",
      insuranceNote: "",
    });
    setEditingPatient(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Patients</h1>
        {canModify && (
          <button onClick={openAddModal} className="btn btn-primary">
            Add New Patient
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Birthdate</th>
              {canModify && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.patientID}>
                <td>{patient.patientID}</td>
                <td>
                  {patient.firstName} {patient.middleInit} {patient.lastName}
                </td>
                <td>{patient.gender}</td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>{patient.patientBirthdate?.split("T")[0]}</td>
                {canModify && (
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="btn btn-sm btn-warning"
                      >
                        Edit
                      </button>
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => handleDelete(patient.patientID)}
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
              <h2>{editingPatient ? "Edit Patient" : "Add New Patient"}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
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
                  maxLength="1"
                  value={formData.middleInit}
                  onChange={handleInputChange}
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
                  name="patientBirthdate"
                  className="form-control"
                  value={formData.patientBirthdate}
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
                <label>Phone <span class="required-star">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="patientAddress"
                  className="form-control"
                  value={formData.patientAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Emergency Email</label>
                <input
                  type="email"
                  name="emergencyEmail"
                  className="form-control"
                  value={formData.emergencyEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Emergency Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-control"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Vision History</label>
                <textarea
                  name="visionHistory"
                  className="form-control"
                  value={formData.visionHistory}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medHistory"
                  className="form-control"
                  value={formData.medHistory}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Insurance Note</label>
                <input
                  type="text"
                  name="insuranceNote"
                  className="form-control"
                  value={formData.insuranceNote}
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  {editingPatient ? "Update" : "Create"}
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

export default Patients;
