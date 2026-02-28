import React, { useState } from "react";
import { useRunServerSetupMutation } from "../store/apiSlice";

const ServerSetup = () => {
  const [config, setConfig] = useState({
    ip: "",
    pass: "",
    dev_name: "",
    ips_text: "",
    tunnel_ips: "",
    config_ips: "",
    shared_pool_ip: "",
    assigned_to: "",
    sql_file: "",
    actions: {
      install_http: false,
      install_php: false,
      install_pmta: false,
      install_ntp: false,
      flush_iptables: false,
      install_bounce: false,
      install_pmta_portal: false,
      set_crontabs: false,
      reboot_server: false,
      restart_services: false,
    },
  });

  const [runServerSetup, { isLoading: executing }] =
    useRunServerSetupMutation();
  const [output, setOutput] = useState<string | null>(null);

  const handleActionChange = (action: string) => {
    setConfig((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        //@ts-ignore
        [action]: !prev.actions[action],
      },
    }));
  };

  const handleRun = async () => {
    setOutput("Connecting to server...\n");
    try {
      const data = await runServerSetup(config).unwrap();
      setOutput(data.stdout || data.message || "Execution completed.");
    } catch (error: any) {
      setOutput(
        "ERROR: " +
          (error?.data?.message || "Failed to connect to server. Check logs."),
      );
    }
  };

  return (
    <div className="server-setup-container">
      <style>{`
                .server-setup-container {
                    background-color: #f0f8ff;
                    min-height: calc(100vh - 60px);
                    padding: 0;
                    font-family: Arial, sans-serif;
                    color: #000;
                }

                .main-title {
                    background-color: #fff;
                    border: 1px solid #c0c0c0;
                    margin: 20px auto;
                    width: 98%;
                    text-align: center;
                    padding: 5px;
                }

                .main-title h1 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .setup-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 0;
                    width: 98%;
                    margin: 0 auto;
                    border: 1px solid #a0a0a0;
                    background-color: #ffffff;
                }

                .setup-panel {
                    border: 1px solid #d0d0d0;
                    padding: 0;
                }

                .section-header {
                    background-color: #f5f5f5;
                    border-bottom: 1px solid #d0d0d0;
                    text-align: center;
                    font-size: 11px;
                    font-weight: bold;
                    padding: 3px;
                    text-transform: uppercase;
                }

                .section-content {
                    padding: 10px;
                }

                .input-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .legacy-input {
                    border: 1px solid #c0c0c0;
                    padding: 2px 5px;
                    font-size: 11px;
                    outline: none;
                    color: #000;
                }

                .legacy-textarea {
                    width: 100%;
                    border: 1px solid #c0c0c0;
                    font-size: 10px;
                    padding: 5px;
                    resize: none;
                    height: 80px;
                    color: #000;
                }

                .two-col-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                    border-top: 1px solid #d0d0d0;
                }

                .left-col { border-right: 1px solid #d0d0d0; }

                .action-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    padding: 4px 10px;
                    border-bottom: 1px dotted #ccc;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .action-row:hover { background-color: #f9f9f9; }

                .report-box {
                    background-color: #000;
                    color: #fff;
                    font-family: "Courier New", monospace;
                    font-size: 11px;
                    padding: 15px;
                    height: 300px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    white-space: pre-wrap;
                    word-break: break-all;
                    margin-top: 10px;
                    border: 2px solid #333;
                    max-width: 100%;
                }

                .submit-btn {
                    background-color: #f5f5f5;
                    border: 1px solid #808080;
                    padding: 2px 15px;
                    font-weight: bold;
                    font-size: 12px;
                    cursor: pointer;
                    margin: 10px auto;
                    display: block;
                    color: #000;
                }

                .submit-btn:active { background-color: #e0e0e0; }

                .config-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                    margin-top: 5px;
                }

                .config-table th {
                    border: 1px solid #ccc;
                    background-color: #e8e8e8;
                    padding: 4px;
                    text-transform: uppercase;
                }

                .config-table td {
                    border: 1px solid #ccc;
                    padding: 2px;
                }

                select.legacy-select {
                    font-size: 11px;
                    padding: 1px 4px;
                    border: 1px solid #c0c0c0;
                    color: #000;
                }
            `}</style>

      <div className="main-title">
        <h1>SERVER SETUP CENTOS</h1>
      </div>

      <div className="setup-grid">
        {/* Left Side: Major Inputs */}
        <div className="setup-panel">
          <div className="section-header">SERVER CREDENTIALS</div>
          <div
            className="section-content"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div className="input-row">
              IP:{" "}
              <input
                type="text"
                className="legacy-input"
                style={{ width: "200px" }}
                value={config.ip}
                onChange={(e) => setConfig({ ...config, ip: e.target.value })}
              />
            </div>
            <div className="input-row">
              PASS:{" "}
              <input
                type="password"
                className="legacy-input"
                style={{ width: "200px" }}
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              />
            </div>
          </div>

          <div className="two-col-layout">
            <div className="left-col">
              <div className="section-header">IP TUNNEL/DETUNNEL</div>
              <div className="section-content">
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    justifyContent: "center",
                  }}
                >
                  <label>
                    <input type="checkbox" /> Check IP'S
                  </label>
                  <label>
                    <input type="checkbox" /> Tunnel IP'S
                  </label>
                  <label>
                    <input type="checkbox" /> Detunnel IP'S
                  </label>
                </div>
                <div className="input-row">
                  DEV NAME:{" "}
                  <input
                    type="text"
                    className="legacy-input"
                    style={{ width: "60px" }}
                    value={config.dev_name}
                    onChange={(e) =>
                      setConfig({ ...config, dev_name: e.target.value })
                    }
                  />
                </div>
                <textarea
                  className="legacy-textarea"
                  placeholder="PLEASE INSERT IP'S HERE..."
                  value={config.ips_text}
                  onChange={(e) =>
                    setConfig({ ...config, ips_text: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="action-list">
                <ActionRow
                  label="INSTALL HTTP"
                  active={config.actions.install_http}
                  onToggle={() => handleActionChange("install_http")}
                />
                <ActionRow
                  label="INSTALL PHP"
                  active={config.actions.install_php}
                  onToggle={() => handleActionChange("install_php")}
                />
                <ActionRow
                  label="INSTALL PMTA"
                  active={config.actions.install_pmta}
                  onToggle={() => handleActionChange("install_pmta")}
                />
                <ActionRow
                  label="INSTALL NTP DATE"
                  active={config.actions.install_ntp}
                  onToggle={() => handleActionChange("install_ntp")}
                />
                <ActionRow
                  label="FLUSH IPTABLES"
                  active={config.actions.flush_iptables}
                  onToggle={() => handleActionChange("flush_iptables")}
                />
                <ActionRow
                  label="INSTALL BOUNCE PROCESSOR"
                  active={config.actions.install_bounce}
                  onToggle={() => handleActionChange("install_bounce")}
                />
                <ActionRow
                  label="INSTALL PMTA WEB PORTAL"
                  active={config.actions.install_pmta_portal}
                  onToggle={() => handleActionChange("install_pmta_portal")}
                />
                <ActionRow
                  label="SET CRONTABS"
                  active={config.actions.set_crontabs}
                  onToggle={() => handleActionChange("set_crontabs")}
                />
                <ActionRow
                  label="REBOOT SERVER"
                  active={config.actions.reboot_server}
                  onToggle={() => handleActionChange("reboot_server")}
                />
                <ActionRow
                  label="RESTART ALL SERVICE"
                  active={config.actions.restart_services}
                  onToggle={() => handleActionChange("restart_services")}
                />
                <button
                  className="submit-btn"
                  onClick={handleRun}
                  disabled={executing}
                >
                  {executing ? "Executing..." : "Submit"}
                </button>
              </div>
            </div>

            <div>
              <div className="section-header">SERVER CONFIG</div>
              <div className="section-content">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                      IP's :
                    </div>
                    <textarea
                      className="legacy-textarea"
                      style={{ height: "60px" }}
                      value={config.config_ips}
                      onChange={(e) =>
                        setConfig({ ...config, config_ips: e.target.value })
                      }
                    ></textarea>
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#666",
                      fontStyle: "italic",
                      width: "80px",
                      marginTop: "15px",
                    }}
                  >
                    Suffix : (Eth0:0, 1, 2, 3..0, 56000 PMTA)
                  </div>
                </div>

                <div className="input-row" style={{ marginTop: "10px" }}>
                  Shared Pool IP:{" "}
                  <input
                    type="text"
                    className="legacy-input"
                    style={{ width: "120px" }}
                    value={config.shared_pool_ip}
                    onChange={(e) =>
                      setConfig({ ...config, shared_pool_ip: e.target.value })
                    }
                  />
                </div>

                <table className="config-table">
                  <thead>
                    <tr>
                      <th>HOSTNAME</th>
                      <th>SERVER</th>
                      <th>PORT</th>
                      <th>TLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="legacy-input"
                          style={{ width: "95%" }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="legacy-input"
                          style={{ width: "95%" }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="legacy-input"
                          style={{ width: "95%" }}
                        />
                      </td>
                      <td>
                        <select className="legacy-select">
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className="submit-btn">Submit</button>

                <div className="section-header" style={{ marginTop: "15px" }}>
                  REPORTS
                </div>
                <div className="report-box">{output || "Process idle."}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Options & SQL */}
        <div className="setup-panel">
          <div className="section-content">
            <div
              className="input-row"
              style={{ justifyContent: "space-between" }}
            >
              ASSIGNED TO :
              <select className="legacy-select" style={{ width: "150px" }}>
                <option>Select Any</option>
                <option>ANKIT</option>
                <option>KARAN</option>
              </select>
            </div>
            <div
              className="input-row"
              style={{ justifyContent: "space-between", marginTop: "15px" }}
            >
              SELECT SQL FILE :
              <select className="legacy-select" style={{ width: "150px" }}>
                <option>143.29.155.115_sql.sql</option>
              </select>
            </div>

            <button className="submit-btn" style={{ marginTop: "20px" }}>
              Submit
            </button>

            <div
              style={{
                backgroundColor: "#000",
                height: "400px",
                width: "100%",
                marginTop: "20px",
                border: "1px solid #444",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionRow = ({ label, active, onToggle }: any) => (
  <div className="action-row">
    <span>{label}</span>
    <input type="checkbox" checked={active} onChange={onToggle} />
  </div>
);

export default ServerSetup;
