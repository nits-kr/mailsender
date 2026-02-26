import React, { useState } from "react";
import {
  useGetMailboxEmailsQuery,
  useGetMailboxDataQuery,
} from "../store/apiSlice";
import "./TestidsMailbox.css";

const TestidsMailbox = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [fetchEmail, setFetchEmail] = useState("");
  const { data: emails = [] } = useGetMailboxEmailsQuery();
  const { data: mailboxData = [], isFetching } = useGetMailboxDataQuery(
    fetchEmail,
    { skip: !fetchEmail },
  );

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    setFetchEmail(selectedEmail);
  };

  return (
    <div className="mailbox-container">
      <div className="mailbox-mainbox">
        <h3>IMAP MAILBOX</h3>
        <hr />

        <div className="fetch-form">
          <form onSubmit={handleFetch}>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              required
            >
              <option value="">Select Email</option>
              {emails.map((email: string) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
            <button type="submit" className="mailbox-btn mailbox-btn-info">
              Fetch
            </button>
          </form>
        </div>

        <hr />

        <div className="mailbox-search-box">
          Search: <input type="text" className="mailbox-search-input" />
        </div>

        {fetchEmail && (
          <div className="fetch-email-header">
            <h3>{fetchEmail}</h3>
          </div>
        )}

        <table className="mailbox-table" id="example">
          <thead>
            <tr>
              <th style={{ width: "3%" }}>Sno</th>
              <th style={{ width: "10%" }}>Time</th>
              <th style={{ width: "15%" }}>SUBJECT</th>
              <th style={{ width: "12%" }}>FROM</th>
              <th style={{ width: "12%" }}>To</th>
              <th style={{ width: "8%" }}>STATUS</th>
              <th style={{ width: "10%" }}>IP</th>
              <th style={{ width: "15%" }}>MESSAGE ID</th>
            </tr>
          </thead>
          <tbody>
            {mailboxData.length > 0 ? (
              mailboxData.map((row: any) => (
                <tr key={row.sno}>
                  <td>{row.sno}</td>
                  <td>{row.last_update_time}</td>
                  <td>{row.subject}</td>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td
                    className={
                      row.status === "INBOX" ? "status-inbox" : "status-spam"
                    }
                  >
                    {row.status}
                  </td>
                  <td>{row.ip}</td>
                  <td>{row.message_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data-cell">
                  {isFetching
                    ? "Loading data..."
                    : "No data available in table"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mailbox-entries-info">
          Showing{" "}
          {mailboxData.length > 0 ? `1 to ${mailboxData.length}` : "0 to 0"} of{" "}
          {mailboxData.length} entries
        </div>
      </div>
    </div>
  );
};

export default TestidsMailbox;
