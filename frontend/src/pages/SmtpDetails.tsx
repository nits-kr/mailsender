import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/authSlice";
import {
  useGetSmtpDetailsQuery,
  useAddSmtpDetailsMutation,
  useDeleteSmtpDetailsMutation,
  useGetUsersQuery,
} from "../store/apiSlice";
import "./SmtpDetails.css";

const SmtpDetails = () => {
  const { data: smtpData = [], isFetching, refetch } = useGetSmtpDetailsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [addSmtp, { isLoading: isAdding }] = useAddSmtpDetailsMutation();
  const [deleteSmtp] = useDeleteSmtpDetailsMutation();

  const [serverName, setServerName] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [ipData, setIpData] = useState("");

  const userInfo = useSelector(selectCurrentUser);

  const isAdmin =
    userInfo?.designation === "Admin" || userInfo?.designation === "admin";

  useEffect(() => {
    if (userInfo && !isAdmin) {
      setAssignTo(userInfo._id?.toString() || "");
    } else if (users.length > 0 && !assignTo) {
      setAssignTo(users[0]._id?.toString() || "");
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
    <div className="p-0">
      <div className="smtp-mainbox">
        <div className="smtp-title-container">
          <h3>SMTP DETAILS</h3>
        </div>
        <hr className="smtp-hr" />

        <div className="text-center">
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
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))
                      ) : (
                        <option value={userInfo?._id}>{userInfo?.name}</option>
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

        <div className="margin-10 pb-20">
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
                  <td colSpan={isAdmin ? 10 : 9} className="no-data-td">
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
