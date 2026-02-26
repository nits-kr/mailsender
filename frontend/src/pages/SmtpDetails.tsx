import React, { useState, useEffect } from "react";
import {
  useGetSmtpDetailsQuery,
  useAddSmtpDetailsMutation,
  useDeleteSmtpDetailsMutation,
  useGetUsersQuery,
} from "../store/apiSlice";

const SmtpDetails = () => {
  const { data: smtpData = [], isFetching, refetch } = useGetSmtpDetailsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [addSmtp, { isLoading: isAdding }] = useAddSmtpDetailsMutation();
  const [deleteSmtp] = useDeleteSmtpDetailsMutation();

  const [serverName, setServerName] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [ipData, setIpData] = useState("");

  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  })();

  const isAdmin =
    userInfo?.designation === "Admin" || userInfo?.designation === "admin";

  useEffect(() => {
    if (userInfo && !isAdmin) {
      setAssignTo(userInfo.id.toString());
    } else if (users.length > 0 && !assignTo) {
      setAssignTo(users[0].id.toString());
    }
  }, [userInfo, isAdmin, users, assignTo]);

  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName || !assignTo || !ipData)
      return alert("All fields are required");

    try {
      await addSmtp({
        server: serverName,
        assign: assignTo,
        ip: ipData,
      }).unwrap();
      setServerName("");
      setIpData("");
      refetch();
      // Optional: alert success like the legacy script might
    } catch (error: any) {
      alert(
        "Failed to insert SMTP details: " +
          (error.data?.message || error.message),
      );
    }
  };

  const handleDelete = async (sno: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteSmtp(sno).unwrap();
        refetch();
      } catch (err) {
        alert("Failed to delete record");
      }
    }
  };

  return (
    <div style={{ padding: "0" }}>
      <style>{`
        .smtp-mainbox {
          padding: 10px;
          width: 95%;
          margin: 30px auto;
          background-color: white;
          color: black;
          font-family: Arial, "Trebuchet MS", verdana;
          border: 1px solid #ddd;
          -webkit-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
          -moz-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
          box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
        }

        .smtp-title {
          text-align: center;
          font-size: 24px;
          margin: 10px 0;
          font-weight: bold;
        }

        .smtp-hr {
          border: 1px solid #f1f1f1;
          margin-bottom: 25px;
          width: 100%;
        }

        .smtp-form-table {
          margin: 0 auto;
          border: 0;
        }

        .smtp-form-table td {
          padding: 5px;
        }

        .smtp-input {
          box-sizing: border-box;
          width: 400px;
          font-size: 18px;
          height: 34px;
          padding: 3px 7px;
          border: 1px solid #aaa;
          border-radius: 4px;
        }
        
        .smtp-select {
          width: 28%;
          min-width: 400px;
          font-size: 18px;
          height: 34px;
          padding: 3px 7px;
          border: 1px solid #aaa;
          border-radius: 4px;
        }

        .smtp-textarea {
          font-family: monospace;
          padding: 5px;
          border: 1px solid #aaa;
        }

        .smtp-btn {
          border: none;
          border-radius: 12px;
          color: white;
          padding: 5px 14px;
          font-size: 17px;
          cursor: pointer;
          text-decoration: none;
        }

        .smtp-btn-info {
          background-color: #2196F3;
        }
        .smtp-btn-info:hover {
          background-color: #0b7dda;
        }

        .smtp-btn-danger {
          background-color: #f44336;
        }
        .smtp-btn-danger:hover {
          background-color: #da190b;
        }

        .smtp-data-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }

        .smtp-data-table th, .smtp-data-table td {
          border: 1px solid #dee2e6;
        }

        .smtp-data-table thead th {
          vertical-align: bottom;
          text-align: center;
          background-color: #60D6FF;
          font-weight: bold;
          font-size: large;
          padding: 8px;
        }

        .smtp-data-table tbody td {
          text-align: center;
          font-weight: bold;
          font-size: large;
          padding: 8px;
        }

        .smtp-data-table tbody tr:nth-of-type(odd) {
          background-color: rgba(0,0,0,.05);
        }
        .smtp-data-table tbody tr:nth-of-type(even) {
          background-color: transparent;
        }
      `}</style>

      <div className="smtp-mainbox">
        <div className="smtp-title">
          <h3>SMTP DETAILS</h3>
        </div>
        <hr className="smtp-hr" />

        <div style={{ textAlign: "center" }}>
          <form onSubmit={handleInsert}>
            <table className="smtp-form-table">
              <tbody>
                <tr>
                  <td></td>
                  <td>
                    <input
                      className="smtp-input"
                      type="text"
                      placeholder="SERVER NAME"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      required
                    />
                    <br />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <br />
                    <select
                      className="smtp-select"
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      required
                      disabled={!isAdmin}
                    >
                      {isAdmin ? (
                        users.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))
                      ) : (
                        <option value={userInfo?.id}>{userInfo?.name}</option>
                      )}
                    </select>
                    <br />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <br />
                    <textarea
                      className="smtp-textarea"
                      cols={90}
                      rows={10}
                      placeholder="IP|HOSTNAME|USER|PASS|PORT|TLS"
                      value={ipData}
                      onChange={(e) => setIpData(e.target.value)}
                      required
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td align="center">
                    <br />
                    <button
                      type="submit"
                      disabled={isAdding}
                      className="smtp-btn smtp-btn-info"
                    >
                      {isAdding ? "Working..." : "Insert"}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>

        <br />
        <hr className="smtp-hr" />

        <div style={{ margin: "10px", paddingBottom: "20px" }}>
          <table className="smtp-data-table">
            <thead>
              <tr>
                <th> Sno </th>
                <th> Assign to </th>
                <th> SERVER </th>
                <th> IP </th>
                <th> HOSTNAME </th>
                <th> USER </th>
                <th> PASS </th>
                <th> PORT </th>
                <th> TLS </th>
                {isAdmin && <th> ACTION </th>}
              </tr>
            </thead>
            <tbody>
              {smtpData.map((row: any) => (
                <tr key={row.sno}>
                  <td> {row.sno} </td>
                  <td> {row.name || row.accountname} </td>
                  <td> {row.server} </td>
                  <td> {row.assignedip} </td>
                  <td> {row.hostname} </td>
                  <td> {row.user} </td>
                  <td> {row.pass} </td>
                  <td> {row.port} </td>
                  <td> {row.tls} </td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => handleDelete(row.sno)}
                        className="smtp-btn smtp-btn-danger"
                      >
                        DELETE
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {smtpData.length === 0 && !isFetching && (
                <tr>
                  <td
                    colSpan={isAdmin ? 10 : 9}
                    style={{
                      textAlign: "center",
                      fontStyle: "italic",
                      fontWeight: "normal",
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
    </div>
  );
};

export default SmtpDetails;
