import React, { useState } from "react";
import {
  RefreshCcw,
  Layout,
  List,
  LogOut,
  Terminal,
  StopCircle,
  Trash2,
  Maximize2,
} from "lucide-react";
import {
  useGetScreensQuery,
  useGetScreenLogsQuery,
  useStopScreenMutation,
  useDeleteScreenMutation,
} from "../store/apiSlice";

const Screen = () => {
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [logsScreenId, setLogsScreenId] = useState<string | null>(null);

  // Poll every 10 seconds automatically
  const {
    data: screens = [],
    isFetching,
    refetch: refetchScreens,
  } = useGetScreensQuery(undefined, {
    pollingInterval: 10000,
  });
  const { data: logs = [] } = useGetScreenLogsQuery(logsScreenId!, {
    skip: !logsScreenId,
  });
  const [stopScreen] = useStopScreenMutation();
  const [deleteScreen] = useDeleteScreenMutation();

  const handleLogClick = (screen: any) => {
    setSelectedScreen(screen);
    setLogsScreenId(screen._id);
    setShowLogs(true);
  };

  const handleStop = async (id: string) => {
    if (!window.confirm("Are you sure you want to stop this process?")) return;
    try {
      await stopScreen(id).unwrap();
    } catch (error) {
      console.error("Error stopping screen", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this screen?")) return;
    try {
      await deleteScreen(id).unwrap();
    } catch (error) {
      console.error("Error deleting screen", error);
    }
  };

  return (
    <div className="screen-container">
      {/* Custom Styles to guarantee visibility */}
      <style>{`
                .screen-container {
                    background-color: #ffffff;
                    min-height: calc(100vh - 60px);
                    padding: 30px 40px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: #333333;
                }

                .screen-header-title {
                    text-align: center;
                    margin-bottom: 25px;
                    position: relative;
                }

                .screen-header-title h1 {
                    color: #4D4D4D;
                    font-size: 28px;
                    font-weight: 900;
                    font-style: italic;
                    letter-spacing: 1px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                    text-transform: uppercase;
                    margin: 0;
                    font-family: "Trebuchet MS", sans-serif;
                }

                .refresh-icon {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #000000;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .refresh-icon:hover {
                    transform: translateY(-50%) rotate(180deg);
                }

                .divider {
                    border: 0;
                    border-top: 1px solid #e0e0e0;
                    margin-bottom: 30px;
                }

                .create-btn {
                    background-color: #42d838;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 16px;
                    font-weight: bold;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: all 0.2s;
                }

                .create-btn:hover {
                    background-color: #38b82e;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                .screen-table-wrapper {
                    overflow-x: auto;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                }

                .screen-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #ffffff;
                }

                .screen-table thead tr {
                    background-color: #60D6FF;
                    color: #ffffff;
                }

                .screen-table th {
                    padding: 12px 10px;
                    text-transform: uppercase;
                    font-size: 12px;
                    font-weight: 800;
                    border: 1px solid #e0e0e0;
                    text-align: center;
                }

                .screen-table td {
                    padding: 10px 8px;
                    border: 1px solid #f0f0f0;
                    font-size: 13px;
                    font-weight: 700;
                    color: #333333;
                    text-align: center;
                }

                .screen-table tbody tr:nth-child(even) {
                    background-color: #fcfcfc;
                }

                .text-left { text-align: left !important; }

                .action-btns {
                    display: flex;
                    gap: 4px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .action-btn {
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 3px 12px;
                    font-size: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    text-transform: uppercase;
                    transition: opacity 0.2s;
                }

                .btn-details { background-color: #6a5acd; }
                .btn-log { background-color: #2196F3; }
                .btn-stop { background-color: #ff9800; }
                .btn-delete { background-color: #f44336; }

                .action-btn:hover { opacity: 0.85; }

                .status-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    color: white;
                }

                .status-running { background-color: #4caf50; }
                .status-stopped { background-color: #9e9e9e; }

                /* Log Modal - Legacy Style but modern performance */
                .log-modal {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0,0,0,0.85);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .log-content {
                    background-color: #000000;
                    border: 2px solid #10ff00;
                    width: 100%;
                    max-width: 1000px;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 30px rgba(16,255,0,0.2);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .log-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(16,255,0,0.3);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #111111;
                }

                .log-header h2 {
                    margin: 0;
                    color: #10ff00;
                    font-size: 18px;
                    font-family: "Courier New", monospace;
                    text-transform: uppercase;
                }

                .close-btn {
                    background-color: #ffffff;
                    color: #000000;
                    border: none;
                    padding: 4px 15px;
                    border-radius: 4px;
                    font-weight: 900;
                    font-size: 11px;
                    cursor: pointer;
                }

                .log-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    font-family: "Courier New", monospace;
                    color: #10ff00;
                    font-size: 13px;
                }

                .log-line {
                    margin-bottom: 4px;
                    display: flex;
                    gap: 15px;
                }

                .log-time { color: rgba(16,255,0,0.5); }
                .log-success { color: #32CD32; font-weight: bold; }
                .log-error { color: #ff3333; }

                .no-data {
                    padding: 50px;
                    color: #999999;
                    font-style: italic;
                    text-align: center;
                }
            `}</style>

      <div className="screen-header-title">
        <h1>SCREEN MANAGMENT</h1>
        <div className="refresh-icon" onClick={refetchScreens}>
          <RefreshCcw size={26} />
        </div>
      </div>

      <hr className="divider" />

      <button
        className="create-btn"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        <span>▶</span> CREATE NEW SCREEN
      </button>

      {showCreateForm && (
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #eee",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Screen Name"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <select
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              <option>INTERFACE</option>
              <option>INTERFACE AUTO TESTER</option>
              <option>SMTP AUTO TESTER</option>
            </select>
            <input
              type="text"
              placeholder="Put svml id"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "250px",
              }}
            />
            <button
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                padding: "10px 25px",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              START
            </button>
          </div>
        </div>
      )}

      <div className="screen-table-wrapper">
        <table className="screen-table">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Screen Id</th>
              <th className="text-left" style={{ width: "20%" }}>
                Screen Name
              </th>
              <th style={{ width: "10%" }}>Temp ID</th>
              <th style={{ width: "12%" }}>MAILER</th>
              <th style={{ width: "22%" }}>DATAFILE NAME</th>
              <th style={{ width: "8%" }}>COUNT</th>
              <th style={{ width: "18%" }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {screens.length > 0 ? (
              screens.map((s) => (
                <tr key={s._id}>
                  <td>{s._id.substring(18)}</td>
                  <td className="text-left" style={{ color: "#32CD32" }}>
                    {s.template_name}
                  </td>
                  <td>{s.offer_id || "---"}</td>
                  <td>{s.mailer}</td>
                  <td style={{ fontWeight: "normal" }}>
                    {s.data_file || "NULL"}
                  </td>
                  <td style={{ fontWeight: "normal" }}>
                    {s.total_emails || 0}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn btn-details">
                        DETAILS
                      </button>
                      <button
                        className="action-btn btn-log"
                        onClick={() => handleLogClick(s)}
                      >
                        LOG
                      </button>
                      <button
                        className="action-btn btn-stop"
                        onClick={() => handleStop(s._id)}
                      >
                        STOP Process
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(s._id)}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  No screens found. Direct your campaigns from the Interface
                  page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showLogs && (
        <div className="log-modal" onClick={() => setShowLogs(false)}>
          <div className="log-content" onClick={(e) => e.stopPropagation()}>
            <div className="log-header">
              <h2>EXECUTION LOG: {selectedScreen?.template_name}</h2>
              <button className="close-btn" onClick={() => setShowLogs(false)}>
                CLOSE
              </button>
            </div>
            <div className="log-body">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="log-line">
                    <span className="log-time">
                      [{new Date(log.created_at).toLocaleTimeString()}]
                    </span>
                    <span
                      className={
                        log.type === "success"
                          ? "log-success"
                          : log.type === "error"
                            ? "log-error"
                            : ""
                      }
                    >
                      {log.log_text}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className="no-data"
                  style={{ color: "#10ff00", opacity: 0.5 }}
                >
                  Syncing with worker...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Screen;
