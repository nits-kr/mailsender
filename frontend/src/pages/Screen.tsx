import React from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  useGetScreensQuery,
  useStopScreenMutation,
  useDeleteScreenMutation,
} from "../store/apiSlice";
import "./Screen.css";

const Screen = () => {
  const navigate = useNavigate();

  // Poll every 10 seconds automatically
  const {
    data: screens = [],
    isLoading,
    isFetching,
    refetch: refetchScreens,
  } = useGetScreensQuery(undefined, {
    pollingInterval: 10000,
  });
  const [stopScreen] = useStopScreenMutation();
  const [deleteScreen] = useDeleteScreenMutation();

  const handleLogClick = (screen: any) => {
    navigate(`/screens/${screen._id}/logs`);
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
                <th style={{ width: "18%" }}>Screen Name</th>
                <th style={{ width: "8%" }}>Temp ID</th>
                <th style={{ width: "12%" }}>MAILER</th>
                <th style={{ width: "22%" }}>DATAFILE NAME</th>
                <th style={{ width: "7%" }}>COUNT</th>
                <th style={{ width: "25%" }}>ACTION</th>
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
                      <div className="skeleton-cell sk-btn" />
                      <div className="skeleton-cell sk-btn" />
                      <div className="skeleton-cell sk-btn" />
                    </td>
                  </tr>
                ))
              ) : screens.length > 0 ? (
                screens.map((row: any) => (
                  <tr key={row._id}>
                    <td>{row._id.substring(18) || "N/A"}</td>
                    <td className="text-limegreen">{row.template_name}</td>
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
                  <td colSpan={7} className="no-screens-td">
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
