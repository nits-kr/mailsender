import React, { useState } from "react";
import {
  useGetTestIdsQuery,
  useAddTestIdMutation,
  useUpdateTestIdMutation,
  useDeleteTestIdMutation,
} from "../store/apiSlice";

const TestIdsManagement = () => {
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
    (item) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="test-ids-parity-container">
      <style>{`
        .test-ids-parity-container {
            margin: 0;
            padding: 50px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 1rem;
            color: #212529;
            background-color: #fff;
        }
        .mainbox {
            padding: 20px;
            margin: -20px auto;
            text-align: center;
            box-shadow: 3px 4px 23px -4px rgb(0 0 0 / 48%);
            background: white;
            max-width: 1400px;
        }
        .legacy-table {
            width: 100% !important;
            margin: 0 auto;
            border-collapse: collapse;
            border: 1px solid #ddd;
        }
        .legacy-table thead th {
            background-color: #60D6FF;
            border-bottom: 2px solid #dee2e6;
            text-align: center;
            padding: 8px;
            font-size: 14px;
            font-weight: bold;
        }
        .legacy-table tbody td {
            padding: 8px;
            line-height: 1.42857143;
            vertical-align: top;
            border-top: 1px solid #ddd;
            font-size: 14px;
            text-align: left;
        }
        .legacy-table tbody tr:nth-of-type(odd) {
            background-color: #f9f9f9;
        }
        .btn-legacy {
            display: inline-block;
            padding: 1px 5px;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.42857143;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid transparent;
            border-radius: 3px;
            width: 55%;
            color: #fff;
            margin: 2px 0;
        }
        .btn-warning-legacy { background-color: #f0ad4e; border-color: #eea236; width: 6% !important; height: 34px !important; padding: 6px 12px !important; font-size: 14px !important; }
        .btn-success-legacy { background-color: #5cb85c; border-color: #4cae4c; }
        .btn-info-legacy { background-color: #5bc0de; border-color: #46b8da; }
        .btn-danger-legacy { background-color: #d9534f; border-color: #d43f3a; }
        
        /* Search Box Emulation */
        .search-container-legacy {
            text-align: right;
            margin-bottom: 10px;
        }
        .search-container-legacy label {
            color: red;
            font-weight: bold;
            margin-right: 5px;
        }
        .search-container-legacy input {
            border: 1px solid #ccc;
            padding: 2px 5px;
            font-size: 14px;
        }

        /* Modal Parity */
        .modal-legacy-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1050;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 30px;
        }
        .modal-legacy-content {
            background: #fff;
            width: 600px;
            border: 1px solid rgba(0,0,0,.2);
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(0,0,0,.5);
        }
        .modal-legacy-header {
            padding: 15px;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-legacy-header h4 { margin: 0; font-size: 18px; }
        .modal-legacy-body { padding: 15px; text-align: left; }
        .modal-legacy-footer { padding: 15px; border-top: 1px solid #e5e5e5; text-align: right; }
        .legacy-form-group { margin-bottom: 15px; }
        .legacy-form-group label { display: inline-block; max-width: 100%; margin-bottom: 5px; font-weight: 700; }
        .legacy-form-control {
            display: block;
            width: 100%;
            height: 34px;
            padding: 6px 12px;
            font-size: 14px;
            line-height: 1.42857143;
            color: #555;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
        }
      `}</style>

      <div className="mainbox">
        <h3 style={{ margin: "20px 0", fontSize: "24px", fontWeight: 500 }}>
          Test Ids Managment portal
        </h3>

        <div className="search-container-legacy">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ textAlign: "right", marginBottom: "20px" }}>
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

        <div className="mainbox" style={{ boxShadow: "none", padding: 0 }}>
          <table className="legacy-table table table-striped table-bordered">
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
                filteredIds.map((item, idx) => (
                  <tr key={item._id}>
                    <td>{idx + 1}</td>
                    <td>{item.email}</td>
                    <td>{item.domain}</td>
                    <td>
                      {item.status === "A" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          ACTIVE
                        </span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          Deactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-legacy btn-success-legacy"
                      >
                        Edit
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleView(item)}
                        className="btn-legacy btn-info-legacy"
                      >
                        view
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
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
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
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
              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: 0,
                  background: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  opacity: 0.5,
                }}
              >
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
                <div style={{ marginTop: "15px" }}>
                  <button
                    type="submit"
                    className="btn-legacy btn-success-legacy"
                    style={{ width: "26%", height: "34px" }}
                  >
                    {formData.employee_id ? "Update" : "Insert"}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-legacy-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-legacy"
                style={{
                  width: "26%",
                  height: "34px",
                  color: "#333",
                  background: "#fff",
                  borderColor: "#ccc",
                }}
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
              <button
                onClick={() => setViewModal(false)}
                style={{
                  border: 0,
                  background: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  opacity: 0.5,
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-legacy-body">
              <table
                className="table table-bordered w-full"
                style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "30%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Domain
                    </td>
                    <td
                      style={{
                        width: "70%",
                        padding: "8px",
                        border: "1px solid #ddd",
                      }}
                    >
                      {selectedId.domain}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Email Id
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.email}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Password
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.password}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Inbox hostname
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.inboxhostname}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Spam hostname
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.spamhostname}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Port
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.port}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      Status
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {selectedId.status === "A" ? (
                        <span style={{ color: "green" }}>ACTIVE</span>
                      ) : (
                        <span style={{ color: "red" }}>Deactive</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-legacy-footer">
              <button
                onClick={() => setViewModal(false)}
                className="btn-legacy"
                style={{
                  width: "26%",
                  height: "34px",
                  color: "#333",
                  background: "#fff",
                  borderColor: "#ccc",
                }}
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
