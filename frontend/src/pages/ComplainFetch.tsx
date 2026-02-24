import React, { useState } from "react";
import { Trash2, Edit, Plus, X, ExternalLink, FileText } from "lucide-react";
import "./Interface.css";
import {
  useGetComplainAccountsQuery,
  useGetComplainFilesQuery,
  useAddComplainAccountMutation,
  useUpdateComplainAccountMutation,
  useDeleteComplainAccountMutation,
  useFetchComplainMutation,
} from "../store/apiSlice";
import API_BASE_URL from "../config/api";

const ComplainFetch = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    imap_host: "",
    imap_port: 993,
    _id: "",
  });

  // RTK Query hooks
  const { data: accountsList = [], isLoading: accountsLoading } =
    useGetComplainAccountsQuery();
  const { data: files = [], isLoading: filesLoading } =
    useGetComplainFilesQuery();
  const [addAccount] = useAddComplainAccountMutation();
  const [updateAccount] = useUpdateComplainAccountMutation();
  const [deleteAccount] = useDeleteComplainAccountMutation();
  const [fetchComplain, { isLoading: fetching }] = useFetchComplainMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateAccount({
          id: formData._id,
          email: formData.email,
          password: formData.password,
          imap_host: formData.imap_host,
          imap_port: formData.imap_port,
        }).unwrap();
      } else {
        await addAccount({
          email: formData.email,
          password: formData.password,
          imap_host: formData.imap_host,
          imap_port: formData.imap_port,
        }).unwrap();
      }
      setShowForm(false);
      setEditMode(false);
      setFormData({
        email: "",
        password: "",
        imap_host: "",
        imap_port: 993,
        _id: "",
      });
    } catch (error: any) {
      alert("Error: " + (error?.data?.message || "Failed to save account"));
    }
  };

  const handleEdit = (acc: any) => {
    setFormData({
      email: acc.email,
      password: acc.password,
      imap_host: acc.imap_host,
      imap_port: acc.imap_port,
      _id: acc._id,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sure to delete this account?")) {
      try {
        await deleteAccount(id).unwrap();
      } catch {
        alert("Failed to delete account");
      }
    }
  };

  const handleFetch = async () => {
    if (!window.confirm("Start fetching complaints from all accounts?")) return;
    try {
      const result = await fetchComplain({}).unwrap();
      alert("Fetch complete: " + (result?.message || "Done"));
    } catch (error: any) {
      alert("Fetch error: " + (error?.data?.message || "Failed"));
    }
  };

  return (
    <div className="interface-container">
      <div
        className="interface-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Complain Fetch Manager</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="interface-btn" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Account
          </button>
          <button
            className="interface-btn secondary"
            onClick={handleFetch}
            disabled={fetching}
          >
            {fetching ? "Fetching..." : "Fetch Complaints"}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          style={{
            background: "#1a1d21",
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ color: "#fff", fontWeight: "bold" }}>
              {editMode ? "Edit Account" : "Add New Account"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditMode(false);
              }}
              style={{
                color: "#aaa",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Email
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#2a2e35",
                  color: "#fff",
                }}
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#2a2e35",
                  color: "#fff",
                }}
                value={formData.password}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                IMAP Host
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#2a2e35",
                  color: "#fff",
                }}
                value={formData.imap_host}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, imap_host: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                IMAP Port
              </label>
              <input
                type="number"
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#2a2e35",
                  color: "#fff",
                }}
                value={formData.imap_port}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, imap_port: +e.target.value }))
                }
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                className="interface-btn"
                style={{ marginTop: "8px" }}
              >
                {editMode ? "Update Account" : "Add Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Table */}
      <div className="interface-section" style={{ marginBottom: "24px" }}>
        <h3 className="interface-section-title">Email Accounts</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="interface-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>IMAP Host</th>
                <th>Port</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accountsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                accountsList.map((acc: any) => (
                  <tr key={acc._id}>
                    <td>{acc.email}</td>
                    <td>{acc.imap_host}</td>
                    <td>{acc.imap_port}</td>
                    <td
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(acc)}
                        style={{
                          color: "#60a5fa",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(acc._id)}
                        style={{
                          color: "#f87171",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Files */}
      <div className="interface-section">
        <h3 className="interface-section-title">Fetched Complaint Files</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="interface-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File URL</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filesLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                files.map((file: any, idx: number) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <a
                        href={`${API_BASE_URL}${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#007bff",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FileText size={12} /> {file.url}{" "}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td>{file.date || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplainFetch;
