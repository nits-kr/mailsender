import React, { useState } from "react";
import {
  Terminal,
  Shield,
  List,
  Play,
  RefreshCw,
  Database,
  Server,
  User,
  Trash2,
} from "lucide-react";
import { useRunServerSetupMutation } from "../store/apiSlice";

const SendingIpSetup = () => {
  const [config, setConfig] = useState({
    ip: "",
    pass: "",
    old_ip: "",
    old_pass: "",
    type: "sending_ip",
    actions: {
      update_upgrade: false,
      install_http: false,
      install_php: false,
      install_mysql: false,
      install_ntp: false,
      flush_iptables: false,
      install_alias: false,
      install_interfaces: false,
      set_crontabs: false,
      reboot_server: false,
      restart_services: false,
    },
  });

  const [runServerSetup, { isLoading: setupLoading }] =
    useRunServerSetupMutation();
  const [removing, setRemoving] = useState(false);
  const executing = setupLoading && !removing;
  const [output, setOutput] = useState<string | null>(null);
  const [removeOutput, setRemoveOutput] = useState<string | null>(null);

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

  const handleInstall = async () => {
    setRemoving(false);
    setOutput("Connecting to Ubuntu Sending IP server...\n");
    try {
      const data = await runServerSetup({
        ...config,
        mode: "install",
      }).unwrap();
      setOutput(data.stdout || data.message || "Installation completed.");
    } catch (error: any) {
      setOutput(
        "ERROR: " +
          (error?.data?.message || "Failed to connect to server. Check logs."),
      );
    }
  };

  const handleRemove = async () => {
    if (!config.old_ip || !config.old_pass) {
      alert("Please enter old IP and password");
      return;
    }
    setRemoving(true);
    setRemoveOutput("Removing Sending IP interfaces...\n");
    try {
      const data = await runServerSetup({
        ip: config.old_ip,
        pass: config.old_pass,
        type: "sending_ip",
        mode: "remove",
      }).unwrap();
      setRemoveOutput(data.stdout || data.message || "Removal completed.");
    } catch (error: any) {
      setRemoveOutput(
        "ERROR: " +
          (error?.data?.message || "Failed to remove IP. Check logs."),
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="sending-ip-setup-container">
      <style>{`
                .sending-ip-setup-container {
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
                    grid-template-columns: 1.5fr 1fr;
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
                    font-size: 10px;
                    outline: none;
                }

                .action-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    padding: 4px 50px;
                    border-bottom: 1px dotted #ccc;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .action-row:hover { background-color: #f9f9f9; }

                .console-output {
                    background-color: #000;
                    color: #fff;
                    font-family: "Courier New", monospace;
                    font-size: 12px;
                    padding: 10px;
                    height: 380px;
                    overflow-y: auto;
                    border: 1px solid #333;
                    margin-top: 10px;
                }

                .btn-legacy {
                    background-color: #f5f5f5;
                    border: 1px solid #808080;
                    padding: 2px 15px;
                    font-weight: bold;
                    font-size: 11px;
                    cursor: pointer;
                    margin: 10px auto;
                    display: block;
                }

                .btn-legacy:active { background-color: #e0e0e0; }

                .right-section-item {
                    border-bottom: 1px solid #d0d0d0;
                    padding: 15px 10px;
                }
            `}</style>

      <div className="main-title">
        <h1>SENDING IP UBUNTU SETUP - 20</h1>
      </div>

      <div className="setup-grid">
        {/* Left Section: Installation */}
        <div className="setup-panel">
          <div className="section-header">SERVER CREDENTIALS</div>
          <div
            className="section-content"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div className="input-row">
              IP :{" "}
              <input
                type="text"
                className="legacy-input"
                style={{ width: "200px" }}
                placeholder="Enter Sending IP"
                value={config.ip}
                onChange={(e) => setConfig({ ...config, ip: e.target.value })}
              />
            </div>
            <div className="input-row">
              PASS :{" "}
              <input
                type="password"
                className="legacy-input"
                style={{ width: "200px" }}
                placeholder="Enter Password"
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              />
            </div>
          </div>

          <div className="section-header">INSTALL SERVICES</div>
          <div className="section-content" style={{ padding: 0 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0",
              }}
            >
              <div className="action-list">
                <ActionRow
                  label="UPDATE & UPGRADE"
                  active={config.actions.update_upgrade}
                  onToggle={() => handleActionChange("update_upgrade")}
                />
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
                  label="INSTALL MYSQL"
                  active={config.actions.install_mysql}
                  onToggle={() => handleActionChange("install_mysql")}
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
                  label="INSTALL ALIAS"
                  active={config.actions.install_alias}
                  onToggle={() => handleActionChange("install_alias")}
                />
                <ActionRow
                  label="INSTALL INTERFACES"
                  active={config.actions.install_interfaces}
                  onToggle={() => handleActionChange("install_interfaces")}
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
                  className="btn-legacy"
                  style={{ marginTop: "20px" }}
                  onClick={handleInstall}
                  disabled={executing}
                >
                  {executing ? "INSTALLING..." : "INSTALL"}
                </button>
              </div>
              <div style={{ padding: "0 10px" }}>
                <div
                  className="section-header"
                  style={{ border: "1px solid #ccc", marginTop: "10px" }}
                >
                  CONSOLE OUTPUT
                </div>
                <div className="console-output">
                  {output || "Console ready..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Removal */}
        <div className="setup-panel">
          <div className="section-header">REMOVE SENDING IP</div>
          <div className="section-content">
            <div className="right-section-item">
              <div
                className="input-row"
                style={{ justifyContent: "space-between" }}
              >
                OLD SENDING IP :
                <input
                  type="text"
                  className="legacy-input"
                  style={{ width: "180px" }}
                  placeholder="Enter Old Sending IP"
                  value={config.old_ip}
                  onChange={(e) =>
                    setConfig({ ...config, old_ip: e.target.value })
                  }
                />
              </div>
              <div
                className="input-row"
                style={{ justifyContent: "space-between", marginTop: "10px" }}
              >
                OLD SENDING PASSWORD :
                <input
                  type="password"
                  className="legacy-input"
                  style={{ width: "180px" }}
                  placeholder="Enter Password"
                  value={config.old_pass}
                  onChange={(e) =>
                    setConfig({ ...config, old_pass: e.target.value })
                  }
                />
              </div>
              <button
                className="btn-legacy"
                style={{ marginTop: "20px" }}
                onClick={handleRemove}
                disabled={removing}
              >
                {removing ? "REMOVING..." : "REMOVE"}
              </button>
            </div>

            <div style={{ padding: "10px" }}>
              <div className="console-output" style={{ height: "400px" }}>
                {removeOutput || "Removal console idle."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionRow = ({ label, active, onToggle }: any) => (
  <div className="action-row">
    <span>{label}</span>
    <input
      type="radio"
      checked={active}
      onChange={onToggle}
      style={{ cursor: "pointer" }}
    />
  </div>
);

export default SendingIpSetup;
