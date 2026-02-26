import React, { useState } from "react";
import {
  useGetImapScreensQuery,
  useGetImapLogsQuery,
  useStopImapScreenMutation,
  useDeleteImapScreenMutation,
  useCreateImapScreenMutation,
  useGetTestIdsQuery,
} from "../store/apiSlice";
import "./TestidsScreen.css";

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
      <div className="mainbox">
        <br />
        <br />
        <h1>
          <b>SCREEN MANAGMENT</b>
        </h1>
        <div className="text-center">
          <span className="font-red fs-16 blinking">
            <b> Delete Screen if not using...</b>
          </span>
        </div>
        <br />
        <div className="refresh-icon" onClick={() => refetchScreens()}>
          <i className="fa fa-refresh">Refresh</i>
        </div>
        <hr />

        <details className="margin-lr-10">
          <summary className="btn-create">CREATE NEW SCREEN</summary>
          <div className="create-form">
            <form onSubmit={handleCreate} className="flex-center-gap-20">
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
              <button type="submit" className="btn btn-info btn-start">
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
                    className={
                      s.status === "active"
                        ? "status-active"
                        : "status-inactive"
                    }
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
                <td colSpan={7} className="no-screens-td">
                  No running screens found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {logScreenName && (
          <div className="log-area">
            <div className="log-header">
              <h1 className="log-title">{logScreenName.replace(".txt", "")}</h1>
              <button
                className="go-back"
                onClick={() => setLogScreenName(null)}
              >
                Go Back
              </button>
            </div>
            <pre className="log-pre">{logData?.logs || "Loading logs..."}</pre>
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
