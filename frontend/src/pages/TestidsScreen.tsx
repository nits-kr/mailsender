import React, { useState } from "react";
import {
  useGetImapScreensQuery,
  useGetImapLogsQuery,
  useStopImapScreenMutation,
  useDeleteImapScreenMutation,
  useCreateImapScreenMutation,
  useGetTestIdsQuery,
} from "../store/apiSlice";

const TestidsScreen = () => {
  const { data: screens = [], refetch: refetchScreens } =
    useGetImapScreensQuery();
  const { data: testIds = [] } = useGetTestIdsQuery();
  const [createScreen] = useCreateImapScreenMutation();
  const [stopScreen] = useStopImapScreenMutation();
  const [deleteScreen] = useDeleteImapScreenMutation();

  const [selectedSno, setSelectedSno] = useState("");
  const [logScreenName, setLogScreenName] = useState<string | null>(null);
  const { data: logData } = useGetImapLogsQuery(logScreenName!, {
    skip: !logScreenName,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSno) return alert("Please select an email");
    try {
      const res = await createScreen({ sno: selectedSno }).unwrap();
      alert(res.message);
      refetchScreens();
    } catch (err: any) {
      alert("Error creating screen: " + (err.data?.message || err.message));
    }
  };

  const handleStop = async (name: string) => {
    try {
      await stopScreen(name).unwrap();
      refetchScreens();
    } catch (err: any) {
      alert("Error stopping screen: " + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm("Are you sure you want to delete this screen?")) return;
    try {
      await deleteScreen(name).unwrap();
      refetchScreens();
    } catch (err: any) {
      alert("Error deleting screen: " + (err.data?.message || err.message));
    }
  };

  return (
    <div className="imap-screen-container">
      <style>{`
                .imap-screen-container {
                    margin: 15px;
                    font-family: Arial, Helvetica, sans-serif;
                }
                .mainbox {
                    padding: 10px;
                    margin: 30px auto;
                    text-align: center;
                    box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
                    background: white;
                    max-width: 1400px;
                    min-height: 800px;
                    border: 1px solid #ddd;
                }
                .mainbox h1 {
                    color: #4D4D4D;
                    font-size: 28px;
                    font-weight: bold;
                    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
                    font-style: italic;
                    text-shadow: 4px 3px 3px #b0b0b0;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }
                .blinking {
                    animation: opacity 0.5s ease-in-out infinite;
                }
                @keyframes opacity {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 0; }
                }
                .refresh-icon {
                    text-align: right;
                    margin-right: 15px;
                    cursor: pointer;
                    font-size: 24px;
                    color: black;
                }
                hr {
                    border: 1px solid #f1f1f1;
                    margin-bottom: 25px;
                }
                .btn-create {
                    background: #42d838;
                    border-radius: 4px;
                    width: 250px;
                    text-align: center;
                    margin: 5px;
                    padding: 5px;
                    color: white;
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    display: block;
                }
                .create-form {
                    width: 96%;
                    height: 100px;
                    margin: 25px auto;
                    padding: 25px;
                    box-shadow: 6px 3px 80px 9px rgb(102 102 102 / 37%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                }
                .create-form select {
                    width: 350px;
                    font-weight: bold;
                    padding: 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .btn {
                    color: white;
                    font-weight: bold;
                    border: none;
                    border-radius: 12px;
                    padding: 5px 14px;
                    font-size: 13px;
                    cursor: pointer;
                    margin: 5px;
                }
                .btn-info { background-color: #2196F3; }
                .btn-info:hover { background-color: #0b7dda; }
                .btn-warning { background-color: #ff9800; }
                .btn-danger { background-color: #f44336; }
                
                .imap-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                .imap-table thead th {
                    background-color: #60D6FF;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    border: 1px solid #dee2e6;
                    font-weight: bold;
                    font-size: 15px;
                }
                .imap-table tbody td {
                    padding: 8px;
                    text-align: center;
                    border: 1px solid #dee2e6;
                    font-weight: bold;
                    font-size: 14px;
                }
                .imap-table tbody tr:nth-of-type(odd) {
                    background-color: rgba(0,0,0,.05);
                }
                .log-area {
                    margin-top: 20px;
                    background: black;
                    color: #10ff00;
                    padding: 20px;
                    min-height: 300px;
                    text-align: left;
                    border-radius: 4px;
                    border: 2px solid #10ff00;
                    overflow-y: auto;
                }
                .log-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #10ff00;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .go-back {
                    background: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    border: none;
                    color: black;
                    font-size: 20px;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>

      <div className="mainbox">
        <br />
        <br />
        <h1>
          <b>SCREEN MANAGMENT</b>
        </h1>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "red", fontSize: "16px" }} className="blinking">
            <b> Delete Screen if not using...</b>
          </span>
        </div>
        <br />
        <div className="refresh-icon" onClick={() => refetchScreens()}>
          <i className="fa fa-refresh">Refresh</i>
        </div>
        <hr />

        <details style={{ textAlign: "left", margin: "0 10px" }}>
          <summary className="btn-create">CREATE NEW SCREEN</summary>
          <div className="create-form">
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              <select
                value={selectedSno}
                onChange={(e) => setSelectedSno(e.target.value)}
              >
                <option value="">Select Email</option>
                {testIds
                  .filter((t: any) => t.status === "A")
                  .map((t: any) => (
                    <option key={t._id} value={t.sno}>
                      {t.email}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="btn btn-info"
                style={{
                  fontSize: "25px",
                  fontWeight: "600",
                  padding: "10px 20px",
                }}
              >
                START
              </button>
            </form>
          </div>
        </details>
        <br />

        <table className="imap-table">
          <thead>
            <tr>
              <th style={{ width: "8%" }}>Screen Id</th>
              <th style={{ width: "18%" }}>Screen Name</th>
              <th style={{ width: "8%" }}>CMD Id</th>
              <th style={{ width: "22%" }}>COMMAND</th>
              <th style={{ width: "22%" }}>DATAFILE NAME</th>
              <th style={{ width: "7%" }}>COUNT</th>
              <th style={{ width: "25%" }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {screens.length > 0 ? (
              screens.map((s: any) => (
                <tr key={s._id}>
                  <td>{s.screen_id}</td>
                  <td
                    style={{
                      color: s.status === "active" ? "limegreen" : "red",
                    }}
                  >
                    {s.screen_name}
                  </td>
                  <td>{s.cmd_id}</td>
                  <td>{s.command}</td>
                  <td>{s.datafile_name}</td>
                  <td>{s.count}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      onClick={() => setLogScreenName(s.datafile_name + ".txt")}
                    >
                      LOG
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleStop(s.screen_name)}
                    >
                      STOP Process
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(s.screen_name)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "20px",
                    fontStyle: "italic",
                    fontWeight: "normal",
                  }}
                >
                  No running screens found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {logScreenName && (
          <div className="log-area">
            <div className="log-header">
              <h1 style={{ margin: 0, color: "#10ff00", fontSize: "28px" }}>
                {logScreenName.replace(".txt", "")}
              </h1>
              <button
                className="go-back"
                onClick={() => setLogScreenName(null)}
              >
                Go Back
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: "20px",
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {logData?.logs || "Loading logs..."}
            </pre>
          </div>
        )}

        <br />
        <hr />
        <br />
      </div>
    </div>
  );
};

export default TestidsScreen;
