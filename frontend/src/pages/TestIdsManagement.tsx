import React, { useState } from "react";
import {
  useGetTestIdsQuery,
  useAddTestIdMutation,
  useUpdateTestIdMutation,
  useDeleteTestIdMutation,
} from "../store/apiSlice";
import "./TestIdsManagement.css";

const TestIdsManagement = () => {
  // ... existing state ...
  const { data: testIds = [], isLoading } = useGetTestIdsQuery();
  const [addTestId] = useAddTestIdMutation();
  const [updateTestId] = useUpdateTestIdMutation();
  const [deleteTestId] = useDeleteTestIdMutation();

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    domain: "",
    email: "",
    password: "",
    inboxhostname: "",
    spamhostname: "",
    port: "",
    status: "A",
    employee_id: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Legacy validation parity
    if (!formData.domain) return alert("Domain is required");
    if (!formData.email) return alert("Email-ID is required");
    if (!formData.password) return alert("password is required");
    if (!formData.inboxhostname) return alert("Inbox Hostname is required");
    if (!formData.spamhostname) return alert("Spam Hostname is required");
    if (!formData.status) return alert("Status is required");

    try {
      if (formData.employee_id) {
        await updateTestId({ id: formData.employee_id, ...formData }).unwrap();
      } else {
        await addTestId(formData).unwrap();
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      alert(`Error saving: ${error.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this Test ID?")) {
      try {
        await deleteTestId(id).unwrap();
      } catch (error: any) {
        alert(`Error deleting: ${error.data?.message || error.message}`);
      }
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      domain: item.domain,
      email: item.email,
      password: item.password,
      inboxhostname: item.inboxhostname,
      spamhostname: item.spamhostname,
      port: item.port,
      status: item.status,
      employee_id: item._id,
    });
    setShowModal(true);
  };

  const handleView = (item: any) => {
    setSelectedId(item);
    setViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      domain: "",
      email: "",
      password: "",
      inboxhostname: "",
      spamhostname: "",
      port: "",
      status: "A",
      employee_id: "",
    });
  };

  const filteredIds = testIds.filter(
    (item: any) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="test-ids-parity-container">
      <div className="mainbox">
        <h3 className="margin-v-20 fs-24 fw-500">Test Ids Managment portal</h3>

        <div className="search-container-legacy">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-right mb-20">
          <button
            className="btn-legacy btn-warning-legacy"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Add
          </button>
        </div>

        <div className="mainbox no-shadow-padding-0">
          <table className="imap-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>sno</th>
                <th style={{ width: "25%" }}>Email</th>
                <th style={{ width: "25%" }}>Domain</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "7%" }}>Edit</th>
                <th style={{ width: "7%" }}>View</th>
                <th style={{ width: "7%" }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredIds.length > 0 ? (
                filteredIds.map((item: any, idx: number) => (
                  <tr key={item._id}>
                    <td>{idx + 1}</td>
                    <td>{item.email}</td>
                    <td>{item.domain}</td>
                    <td>
                      {item.status === "A" ? (
                        <span className="status-active-text">ACTIVE</span>
                      ) : (
                        <span className="status-deactive-text">Deactive</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-legacy btn-success-legacy"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleView(item)}
                        className="btn-legacy btn-info-legacy"
                      >
                        view
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-legacy btn-danger-legacy"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-screens-td">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-legacy-overlay">
          <div className="modal-legacy-content">
            <div className="modal-legacy-header">
              <h4>{formData.employee_id ? "Update" : "Test Ids Portal"}</h4>
              <button onClick={() => setShowModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-legacy-body">
              <form onSubmit={handleSubmit}>
                <div className="legacy-form-group">
                  <label>Enter Domain</label>
                  <input
                    type="text"
                    name="domain"
                    className="legacy-form-control"
                    value={formData.domain}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Email Id</label>
                  <input
                    type="text"
                    name="email"
                    className="legacy-form-control"
                    value={formData.email}
                    onChange={handleInputChange}
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
                  <label>Enter Hostname For Inbox</label>
                  <input
                    type="text"
                    name="inboxhostname"
                    className="legacy-form-control"
                    value={formData.inboxhostname}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Hostname For Spam</label>
                  <input
                    type="text"
                    name="spamhostname"
                    className="legacy-form-control"
                    value={formData.spamhostname}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Port</label>
                  <input
                    type="text"
                    name="port"
                    className="legacy-form-control"
                    value={formData.port}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="legacy-form-group">
                  <label>Enter Status</label>
                  <select
                    name="status"
                    className="legacy-form-control"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="A">Active</option>
                    <option value="D">Deactive</option>
                  </select>
                </div>
                <div className="mt-15">
                  <button
                    type="submit"
                    className="btn-legacy btn-success-legacy width-26-h-34"
                  >
                    {formData.employee_id ? "Update" : "Insert"}
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

      {/* View Modal */}
      {viewModal && selectedId && (
        <div className="modal-legacy-overlay">
          <div className="modal-legacy-content">
            <div className="modal-legacy-header">
              <h4>Test Ids Details</h4>
              <button onClick={() => setViewModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-legacy-body">
              <table className="w-full border-collapse border-ddd">
                <tbody>
                  <tr>
                    <td className="w-30-p-8-b-ddd-fw-b">Domain</td>
                    <td className="w-70-p-8-b-ddd">{selectedId.domain}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Email Id</td>
                    <td className="p-8-b-ddd">{selectedId.email}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Password</td>
                    <td className="p-8-b-ddd">{selectedId.password}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Inbox hostname</td>
                    <td className="p-8-b-ddd">{selectedId.inboxhostname}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Spam hostname</td>
                    <td className="p-8-b-ddd">{selectedId.spamhostname}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Port</td>
                    <td className="p-8-b-ddd">{selectedId.port}</td>
                  </tr>
                  <tr>
                    <td className="p-8-b-ddd-fw-b">Status</td>
                    <td className="p-8-b-ddd">
                      {selectedId.status === "A" ? (
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

export default TestIdsManagement;
