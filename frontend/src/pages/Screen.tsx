import React from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  useGetScreensQuery,
  useStopScreenMutation,
  useResumeScreenMutation,
  useDeleteScreenMutation,
} from "../store/apiSlice";
import "./Screen.css";

const Screen = () => {
  const navigate = useNavigate();

  // Poll every 5 seconds automatically
  const {
    data: screens = [],
    isLoading,
    isFetching,
    refetch: refetchScreens,
  } = useGetScreensQuery(undefined, {
    pollingInterval: 5000,
  });
  const [stopScreen] = useStopScreenMutation();
  const [resumeScreen] = useResumeScreenMutation();
  const [deleteScreen] = useDeleteScreenMutation();

  const handleLogClick = (screen: any) => {
    navigate(`/screens/${screen._id}/logs`);
  };

  const handleStop = async (id: string, name: string) => {
    if (!window.confirm(`Stop campaign "${name}"?`)) return;
    try {
      await stopScreen(id).unwrap();
    } catch (error) {
      console.error("Error stopping screen", error);
    }
  };

  const handleResume = async (id: string, name: string) => {
    if (!window.confirm(`Resume campaign "${name}"?`)) return;
    try {
      await resumeScreen(id).unwrap();
    } catch (error) {
      console.error("Error resuming screen", error);
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

  const getStatusBadge = (status: string) => {
    const s = status || "Running";
    let bg = "#10b981"; // green = Running
    if (s === "Stopped") bg = "#ef4444";
    else if (s === "Completed") bg = "#3b82f6";
    else if (s === "Pending") bg = "#f59e0b";

    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: bg,
        }}
      >
        {s}
      </span>
    );
  };

  return (
    <div className="p-0">
      <div className="text-center">
        <div className="screen-mainbox">
          <br />
          <br />
          <h1>
            {" "}
            <b>SCREEN MANAGMENT</b>{" "}
          </h1>
          <br />
          <div className="text-center" id="mydiv">
            <span className="text-red-f16 blinking">
              <b> Delete Screen if not using...</b>
            </span>
          </div>
          <br />
          <div className="text-right-m-0-15-0-0">
            <span onClick={refetchScreens} className="cursor-pointer-black">
              <RefreshCw
                size={36}
                className={isFetching ? "animate-spin" : ""}
              />
            </span>
          </div>
          <hr className="screen-hr" />
          <br />

          <details className="text-left-m-0-10">
            <summary role="button" className="details-summary">
              <b>
                <span>CREATE NEW SCREEN</span>
              </b>
            </summary>

            <div className="screen-form-box">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="form-flex"
              >
                <input
                  type="text"
                  className="screen-input"
                  placeholder="Screen Name"
                  required
                />
                <select className="screen-select w-350">
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
                  className="screen-input w-350"
                  placeholder="Put svml id"
                  required
                />
                <input
                  type="submit"
                  value="START"
                  className="screen-btn screen-btn-info btn-start"
                />
              </form>
            </div>
          </details>
          <br />

          <table className="screen-data-table">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>Screen Id</th>
                <th style={{ width: "15%" }}>Screen Name</th>
                <th style={{ width: "8%" }}>Temp ID</th>
                <th style={{ width: "10%" }}>MAILER</th>
                <th style={{ width: "18%" }}>DATAFILE NAME</th>
                <th style={{ width: "6%" }}>COUNT</th>
                <th style={{ width: "9%" }}>STATUS</th>
                <th style={{ width: "26%" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || (isFetching && screens.length === 0) ? (
                // Skeleton Rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    <td>
                      <div
                        className="skeleton-cell sk-text"
                        style={{ width: "40px" }}
                      />
                    </td>
                    <td>
                      <div className="skeleton-cell sk-text" />
                    </td>
                    <td>
                      <div
                        className="skeleton-cell sk-text"
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton-cell sk-text"
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <div className="skeleton-cell sk-text" />
                    </td>
                    <td>
                      <div
                        className="skeleton-cell sk-text"
                        style={{ width: "40px" }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton-cell sk-text"
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <div className="skeleton-cell sk-btn" />
                      <div className="skeleton-cell sk-btn" />
                      <div className="skeleton-cell sk-btn" />
                    </td>
                  </tr>
                ))
              ) : screens.length > 0 ? (
                screens.map((row: any) => {
                  const isStopped =
                    row.status === "Stopped" || row.status === "Completed";
                  return (
                    <tr key={row._id}>
                      <td>{row._id.substring(18) || "N/A"}</td>
                      <td className="text-limegreen">{row.template_name}</td>
                      <td>{row.offer_id || "---"}</td>
                      <td>{row.mailer || "---"}</td>
                      <td>{row.data_file || "NULL"}</td>
                      <td>{row.total_emails || "NULL"}</td>
                      <td>{getStatusBadge(row.status)}</td>
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
                        {isStopped ? (
                          <button
                            className="screen-btn screen-btn-success"
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                            }}
                            onClick={() =>
                              handleResume(row._id, row.template_name)
                            }
                          >
                            ▶ RESUME
                          </button>
                        ) : (
                          <button
                            className="screen-btn screen-btn-warning"
                            onClick={() =>
                              handleStop(row._id, row.template_name)
                            }
                          >
                            ■ STOP
                          </button>
                        )}
                        <button
                          className="screen-btn screen-btn-danger"
                          onClick={() => handleDelete(row._id)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="no-screens-td">
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
    </div>
  );
};

export default Screen;
