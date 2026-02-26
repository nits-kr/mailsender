import React, { useState, useEffect } from "react";
import { Trash2, Edit } from "lucide-react";
import "./ComplainFetch.css";
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
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [formData, setFormData] = useState({
    accountType: "yahoo_fbl",
    inboxImapHost: "{imap.mail.yahoo.com:993/imap/ssl}INBOX",
    spamImapHost: "{imap.mail.yahoo.com:993/imap/ssl}Bulk",
    email: "",
    password: "",
    _id: "",
  });

  // RTK Query hooks
  const { data: accountsList = [], refetch: refetchAccounts } =
    useGetComplainAccountsQuery();
  const { data: files = [], refetch: refetchFiles } =
    useGetComplainFilesQuery();

  const [addAccount] = useAddComplainAccountMutation();
  const [updateAccount] = useUpdateComplainAccountMutation();
  const [deleteAccount] = useDeleteComplainAccountMutation();
  const [fetchComplain] = useFetchComplainMutation();

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateAccount({
          id: formData._id,
          accountType: formData.accountType,
          inboxImapHost: formData.inboxImapHost,
          spamImapHost: formData.spamImapHost,
          email: formData.email,
          password: formData.password,
        }).unwrap();
        alert("Email updated successfully.");
      } else {
        await addAccount({
          accountType: formData.accountType,
          inboxImapHost: formData.inboxImapHost,
          spamImapHost: formData.spamImapHost,
          email: formData.email,
          password: formData.password,
        }).unwrap();
        alert("Email added successfully.");
      }
      setShowModal(false);
      setEditMode(false);
      resetForm();
      refetchAccounts();
    } catch (error: any) {
      alert("Error: " + (error?.data?.message || "Failed to save account"));
    }
  };

  const resetForm = () => {
    setFormData({
      accountType: "yahoo_fbl",
      inboxImapHost: "{imap.mail.yahoo.com:993/imap/ssl}INBOX",
      spamImapHost: "{imap.mail.yahoo.com:993/imap/ssl}Bulk",
      email: "",
      password: "",
      _id: "",
    });
  };

  const handleEdit = (acc: any) => {
    setFormData({
      accountType: acc.accountType,
      inboxImapHost: acc.inboxImapHost,
      spamImapHost: acc.spamImapHost,
      email: acc.email,
      password: acc.password,
      _id: acc._id,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this email?")) {
      try {
        await deleteAccount(id).unwrap();
        alert("Email deleted successfully.");
        refetchAccounts();
      } catch {
        alert("Error deleting email.");
      }
    }
  };

  const handleSubmitFetch = async () => {
    if (!selectedEmail) {
      setStatusMessage("Please select an email first.");
      return;
    }

    setStatusMessage("Processing...");
    try {
      const result = await fetchComplain({ email: selectedEmail }).unwrap();
      setStatusMessage(result?.message + "\n\n" + (result?.details || ""));
      refetchFiles();
    } catch (error: any) {
      setStatusMessage(
        "Error fetching complaints: " + (error?.data?.message || error.message),
      );
    }
  };

  return (
    <div className="imap-fetch-body">
      <div className="complain-container">
        {/* Left Div - Complain Fetcher */}
        <div className="left-div">
          <div className="heading-main">Complain Fetcher</div>
          <br />
          <button
            id="addButton"
            className="legacy-button btn-add-complainer"
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowModal(true);
            }}
          >
            ADD COMPLAINER EMAIL
          </button>
          <br />
          <br />

          <div className="form-wrapper">
            <h1>Fetch Complainer</h1>
            <label className="legacy-label">Select Email:</label>
            <select
              className="legacy-select"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              <option value="">Select Email</option>
              {accountsList.map((acc: any) => (
                <option key={acc._id} value={acc.email}>
                  {acc.email}
                </option>
              ))}
            </select>

            <label className="legacy-label">Message:</label>
            <textarea
              className="legacy-textarea"
              value={statusMessage}
              readOnly
              placeholder="Enter your message"
            ></textarea>

            <button className="legacy-button" onClick={handleSubmitFetch}>
              Submit
            </button>
          </div>
        </div>

        {/* Right Div - Complain File List */}
        <div className="right-div">
          <div id="fileList">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 id="fileListHeading">COMPLAIN FILE LIST</h2>
              <a
                href={`${API_BASE_URL}/uploads/complains/fetchLog.txt`}
                target="_blank"
                rel="noreferrer"
                className="btn-autolog"
              >
                AUTO RUN LOG
              </a>
            </div>

            <table id="fileTable">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {files.length > 0 ? (
                  files.map((file: any, idx: number) => (
                    <tr key={idx}>
                      <td>
                        <a
                          href={`${API_BASE_URL}${file.url}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {file.name}
                        </a>
                      </td>
                      <td>{file.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      No files found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal / Popup for Account Management */}
      {showModal && (
        <>
          <div
            className="popup-overlay"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="popup">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              X
            </button>
            <h1>Store Email Account Details</h1>
            <form onSubmit={handleModalSubmit}>
              <div>
                <label className="legacy-label">Account Type:</label>
                <select
                  className="legacy-select"
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({ ...formData, accountType: e.target.value })
                  }
                  required
                >
                  <option value="yahoo_fbl">Yahoo FBL</option>
                </select>
              </div>
              <div>
                <label className="legacy-label">Inbox IMAP Host:</label>
                <input
                  type="text"
                  className="legacy-input"
                  value={formData.inboxImapHost}
                  onChange={(e) =>
                    setFormData({ ...formData, inboxImapHost: e.target.value })
                  }
                  placeholder="{imap.mail.yahoo.com:993/imap/ssl}INBOX"
                  required
                />
              </div>
              <div>
                <label className="legacy-label">Spam IMAP Host:</label>
                <input
                  type="text"
                  className="legacy-input"
                  value={formData.spamImapHost}
                  onChange={(e) =>
                    setFormData({ ...formData, spamImapHost: e.target.value })
                  }
                  placeholder="{imap.mail.yahoo.com:993/imap/ssl}Bulk"
                  required
                />
              </div>
              <div>
                <label className="legacy-label">Email:</label>
                <input
                  type="email"
                  className="legacy-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter Email"
                  required
                />
              </div>
              <div>
                <label className="legacy-label">Password:</label>
                <input
                  type="text"
                  className="legacy-input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter Password"
                  required
                />
              </div>
              <button type="submit" className="legacy-button">
                Submit
              </button>
            </form>

            <div id="emailDetailsTable">
              <table id="detailsTable">
                <thead>
                  <tr>
                    <th>Account Type</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsList.map((acc: any) => (
                    <tr key={acc._id}>
                      <td>{acc.accountType}</td>
                      <td>{acc.email}</td>
                      <td>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(acc)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(acc._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComplainFetch;
