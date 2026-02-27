import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authSlice";
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../store/apiSlice";
import "./Credentials.css";

type CredentialUser = {
  _id: string;
  id: number;
  name: string;
  email: string;
  password: string;
  designation: string;
  status: string;
  header_acces?: string;
};

type CredentialForm = {
  name: string;
  email: string;
  password: string;
  designation: string;
  status: string;
  Header: string;
  employee_id: string;
};

const Credentials = () => {
  const { data: users = [] } = useGetUsersQuery();
  const [addUser, { isLoading: isSavingNew }] = useAddUserMutation();
  const [updateUser, { isLoading: isSavingEdit }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CredentialUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = useSelector(selectCurrentUser);
  const isAdmin = userInfo?.designation === "Admin";

  const getDefaultForm = (): CredentialForm => ({
    name: "",
    email: "",
    password: "",
    designation: isAdmin ? "Admin" : userInfo?.designation || "Sender",
    status: "1",
    Header: isAdmin ? "0" : "1",
    employee_id: "",
  });

  const [formData, setFormData] = useState<CredentialForm>(getDefaultForm());

  const usersList = users as CredentialUser[];

  const filteredUsers = usersList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.designation.toLowerCase().includes(term)
    );
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(getDefaultForm());
  };

  const handleEdit = (item: CredentialUser) => {
    setFormData({
      name: item.name,
      email: item.email,
      password: item.password || "",
      designation: item.designation || "Sender",
      status: item.status || "1",
      Header: item.header_acces || "0",
      employee_id: String(item.id),
    });
    setShowModal(true);
  };

  const handleView = (item: CredentialUser) => {
    setSelectedUser(item);
    setViewModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(String(id)).unwrap();
    } catch {
      alert("Error deleting user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Name is required");
      return;
    }
    if (!formData.email) {
      alert("Email-ID is required");
      return;
    }
    if (!formData.designation) {
      alert("Designation is required");
      return;
    }
    if (!formData.status) {
      alert("Status is required");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      designation: formData.designation,
      status: formData.status,
      header_acces: formData.Header,
    };

    try {
      if (formData.employee_id) {
        await updateUser({ id: formData.employee_id, ...payload }).unwrap();
      } else {
        await addUser(payload).unwrap();
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Error saving user");
    }
  };

  return (
    <div className="credentials-parity-container">
      <div className="mainbox">
        <h3 className="margin-v-20 fs-24 fw-500">Login Managment portal</h3>

        <div className="search-container-legacy">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-right mb-20">
          {isAdmin && (
            <button
              className="btn-legacy btn-warning-legacy"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add
            </button>
          )}
        </div>

        <div className="mainbox no-shadow-padding-0">
          <table className="credentials-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Employee Name</th>
                <th style={{ width: "25%" }}>Email Id</th>
                <th style={{ width: "10%" }}>Designation</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "10%" }}>Edit</th>
                <th style={{ width: "10%" }}>View</th>
                {isAdmin && <th style={{ width: "10%" }}>Delete</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name || "-"}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.designation || "-"}</td>
                    <td>
                      {item.status === "1" ? (
                        <span className="status-active-text">ACTIVE</span>
                      ) : (
                        <span className="status-deactive-text">Deactive</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn-legacy btn-success-legacy"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn-legacy btn-info-legacy"
                        onClick={() => handleView(item)}
                      >
                        view
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <button
                          className="btn-legacy btn-danger-legacy"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="no-data-td">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-legacy-overlay">
          <div className="modal-legacy-content">
            <div className="modal-legacy-header">
              <h4>Login Portal</h4>
              <button onClick={() => setShowModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-legacy-body">
              <form onSubmit={handleSubmit}>
                <div className="legacy-form-group">
                  <label>Enter Employee Name</label>
                  <input
                    type="text"
                    name="name"
                    className="legacy-form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly={!isAdmin}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Employee Email-Id</label>
                  <input
                    type="text"
                    name="email"
                    className="legacy-form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isAdmin}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Select Password</label>
                  <input
                    type="text"
                    name="password"
                    className="legacy-form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Designation</label>
                  {isAdmin ? (
                    <select
                      name="designation"
                      id="designation"
                      className="legacy-form-control"
                      value={formData.designation}
                      onChange={handleInputChange}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Sender">Sender</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="designation"
                      className="legacy-form-control"
                      value={formData.designation}
                      readOnly
                    />
                  )}
                </div>
                <div className="legacy-form-group">
                  <label>Enter Status</label>
                  {isAdmin ? (
                    <select
                      name="status"
                      className="legacy-form-control"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="1">Active</option>
                      <option value="0">Deactive</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="status"
                      className="legacy-form-control"
                      value="1"
                      readOnly
                    />
                  )}
                </div>
                <div className="legacy-form-group">
                  <label>Enter Header Access</label>
                  {isAdmin ? (
                    <select
                      name="Header"
                      className="legacy-form-control"
                      value={formData.Header}
                      onChange={handleInputChange}
                    >
                      <option value="0">NO</option>
                      <option value="1">YES</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="Header"
                      className="legacy-form-control"
                      value="1"
                      readOnly
                    />
                  )}
                </div>

                <div className="mt-15">
                  <button
                    type="submit"
                    className="btn-legacy btn-success-legacy width-26-h-34"
                    disabled={isSavingNew || isSavingEdit}
                  >
                    {isSavingNew || isSavingEdit
                      ? "Inserting"
                      : formData.employee_id
                        ? "Update"
                        : "Insert"}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-legacy-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-legacy btn-close-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && selectedUser && (
        <div className="modal-legacy-overlay">
          <div className="modal-legacy-content">
            <div className="modal-legacy-header">
              <h4>Employee Details</h4>
              <button onClick={() => setViewModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-legacy-body">
              <table className="w-full border-collapse border-ddd">
                <tbody>
                  <tr>
                    <td className="w-30-p-8-b-ddd-fw-b">Name</td>
                    <td className="w-70-p-8-b-ddd">{selectedUser.name}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Email Id</td>
                    <td className="p-8-b-ddd">{selectedUser.email}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Password</td>
                    <td className="p-8-b-ddd">{selectedUser.password}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Designation</td>
                    <td className="p-8-b-ddd">{selectedUser.designation}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Status</td>
                    <td className="p-8-b-ddd">
                      {selectedUser.status === "1" ? (
                        <span className="status-active-text">ACTIVE</span>
                      ) : (
                        <span className="status-deactive-text">Deactive</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-legacy-footer">
              <button
                onClick={() => setViewModal(false)}
                className="btn-legacy btn-close-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credentials;
