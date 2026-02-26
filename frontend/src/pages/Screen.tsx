import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import {
  useGetScreensQuery,
  useGetScreenLogsQuery,
  useStopScreenMutation,
  useDeleteScreenMutation,
} from "../store/apiSlice";

const Screen = () => {
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);
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
    <div style={{ padding: "0" }}>
      <style>{`
        .screen-mainbox {
          padding: 10px;
          height: auto;
          width: 95%;
          margin: 30px auto;
          text-align: center;
          background-color: white;
          color: black;
          font-family: Arial, "Trebuchet MS", verdana;
          border: 1px solid #ddd;
          -webkit-box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
          -moz-box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
          box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
        }

        .screen-mainbox h1 {
          color: #4D4D4D;
          font-size: 28px;
          font-weight: bold;
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          font-style: italic;
          text-shadow: 4px 3px 3px #b0b0b0;
          text-align: center;
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .blinking {
          animation: opacity 0.5s ease-in-out infinite;
          opacity: 1;
        }

        @keyframes opacity {
          0% { opacity: 4; }
          50% { opacity: 2; }
          100% { opacity: 0; }
        }

        .screen-hr {
          border: 1px solid #f1f1f1;
          margin-bottom: 25px;
          width: 100%;
        }

        .screen-btn {
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 12px;
          padding: 5px 14px;
          font-size: 13px;
          cursor: pointer;
          margin: 5px;
          text-decoration: none;
          display: inline-block;
        }

        .screen-btn-details {
          background-color: slateblue;
        }
        .screen-btn-details:hover {
          opacity: 0.8;
        }

        .screen-btn-info {
          background-color: #2196F3;
        }
        .screen-btn-info:hover {
          background-color: #0b7dda;
        }

        .screen-btn-warning {
          background-color: #ff9800;
        }
        .screen-btn-warning:hover {
          background-color: #e68a00;
        }

        .screen-btn-danger {
          background-color: #f44336;
        }
        .screen-btn-danger:hover {
          background-color: #da190b;
        }

        .screen-data-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
          margin-bottom: 20px;
        }

        .screen-data-table th, .screen-data-table td {
          border: 1px solid #dee2e6;
        }

        .screen-data-table thead th {
          vertical-align: bottom;
          text-align: center;
          background-color: #60D6FF;
          font-weight: bold;
          font-size: 15px;
          padding: 8px;
          color: white;
        }

        .screen-data-table tbody td {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          padding: 8px;
        }

        .screen-data-table tbody tr:nth-of-type(odd) {
          background-color: rgba(0,0,0,.05);
        }
        .screen-data-table tbody tr:nth-of-type(even) {
          background-color: transparent;
        }

        .screen-form-box {
          -webkit-box-shadow: 6px 3px 80px 9px rgb(102 102 102 / 37%);
          -moz-box-shadow: 6px 3px 80px 9px rgba(102, 102, 102, 0.37);
          box-shadow: 6px 3px 80px 9px rgb(102 102 102 / 37%);
          margin: 25px;
          padding: 25px;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .screen-input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .screen-select {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-weight: bold;
        }

        /* Log modal matching original style */
        .log-modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 100;
          display: flex;
          align-items: center; justify-content: center;
        }

        .log-content {
          background-color: black;
          color: #10ff00;
          font-size: 20px;
          padding: 20px;
          width: 80%;
          height: 80%;
          border: 2px solid #10ff00;
          overflow-y: auto;
        }

        .log-header {
          display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10ff00; padding-bottom: 10px; margin-bottom: 20px;
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        <div className="screen-mainbox">
          <br />
          <br />
          <h1>
            {" "}
            <b>SCREEN MANAGMENT</b>{" "}
          </h1>
          <br />
          <div style={{ textAlign: "center" }} id="mydiv">
            <span
              style={{ color: "red", fontSize: "16px" }}
              className="blinking"
            >
              <b> Delete Screen if not using...</b>
            </span>
          </div>
          <br />
          {/* Refresh Icon aligned completely to the right as in original UI */}
          <div style={{ textAlign: "right", margin: "0 15px 0 0" }}>
            <span
              onClick={refetchScreens}
              style={{ cursor: "pointer", color: "black" }}
            >
              <RefreshCcw size={24} />
            </span>
          </div>
          <hr className="screen-hr" />
          <br />

          <details style={{ textAlign: "left", margin: "0 10px" }}>
            <summary
              role="button"
              style={{
                background: "#42d838",
                borderRadius: "4px",
                height: "auto",
                width: "250px",
                textAlign: "center",
                margin: "5px",
                padding: "5px",
                cursor: "pointer",
                color: "white",
              }}
            >
              <b>
                <span>CREATE NEW SCREEN</span>
              </b>
            </summary>

            <div className="screen-form-box">
              <form
                onSubmit={(e) => {
                  e.preventDefault(); /* submit logic to be integrated with API later if needed */
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <input
                  type="text"
                  className="screen-input"
                  placeholder="Screen Name"
                  required
                />
                <select className="screen-select" style={{ width: "350px" }}>
                  <option value="/var/www/html/interface/send_mul_phpm_new.php">
                    INTERFACE
                  </option>
                  <option value="/var/www/html/interface_new/php_mailer_auto_send_v2.php">
                    INTERFACE AUTO TESTER
                  </option>
                  <option value="/var/www/html/ESP_Module_fsock_send_smtp_auto/auto_send.php">
                    SMTP AUTO TESTER
                  </option>
                </select>
                <input
                  type="text"
                  className="screen-input"
                  placeholder="Put svml id"
                  style={{ width: "350px" }}
                  required
                />
                <input
                  type="submit"
                  value="START"
                  className="screen-btn screen-btn-info"
                  style={{
                    fontSize: "25px",
                    fontWeight: "600",
                    padding: "10px 20px",
                  }}
                />
              </form>
            </div>
          </details>
          <br />

          <table className="screen-data-table">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>Screen Id</th>
                <th style={{ width: "18%" }}>Screen Name</th>
                <th style={{ width: "8%" }}>Temp ID</th>
                <th style={{ width: "12%" }}>MAILER</th>
                <th style={{ width: "22%" }}>DATAFILE NAME</th>
                <th style={{ width: "7%" }}>COUNT</th>
                <th style={{ width: "25%" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {screens.length > 0 ? (
                screens.map((row: any) => (
                  <tr key={row._id}>
                    <td>{row._id.substring(18) || "N/A"}</td>
                    <td style={{ color: "limegreen" }}>{row.template_name}</td>
                    <td>{row.offer_id || "---"}</td>
                    <td>{row.mailer || "---"}</td>
                    <td>{row.data_file || "NULL"}</td>
                    <td>{row.total_emails || "NULL"}</td>
                    <td>
                      <button className="screen-btn screen-btn-details">
                        DETAILS
                      </button>
                      <button
                        className="screen-btn screen-btn-info"
                        onClick={() => handleLogClick(row)}
                      >
                        LOG
                      </button>
                      <button
                        className="screen-btn screen-btn-warning"
                        onClick={() => handleStop(row._id)}
                      >
                        STOP Process
                      </button>
                      <button
                        className="screen-btn screen-btn-danger"
                        onClick={() => handleDelete(row._id)}
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
                      textAlign: "center",
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
          <br />
          <hr className="screen-hr" />
          <br />
        </div>
      </div>

      {showLogs && (
        <div className="log-modal" onClick={() => setShowLogs(false)}>
          <div className="log-content" onClick={(e) => e.stopPropagation()}>
            <div className="log-header">
              <h1 style={{ margin: 0 }}>{selectedScreen?.template_name}</h1>
              <button
                onClick={() => setShowLogs(false)}
                style={{
                  background: "white",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: "none",
                  color: "black",
                  fontSize: "20px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go Back
              </button>
            </div>
            <pre
              style={{ margin: 0, whiteSpace: "pre-wrap", textAlign: "left" }}
            >
              {logs.length > 0 ? (
                logs.map((log: any, i: number) => (
                  <div key={i}>{log.log_text}</div>
                ))
              ) : (
                <div style={{ opacity: 0.5 }}>Loading logs...</div>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Screen;
