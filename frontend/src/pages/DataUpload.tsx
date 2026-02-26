import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  FileUp,
  Monitor,
} from "lucide-react";
import API_BASE_URL from "../config/api";
import "./DataUpload.css";

const DataUpload = () => {
  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState("Desktop");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<{
    type: string;
    message: string;
    logs: string[];
  }>({
    type: "",
    message: "",
    logs: ["Waiting for file selection..."],
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setStatus((prev) => ({
      ...prev,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${msg}`],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      addLog(
        `File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      );
    }
  };

  const handleUpload = () => {
    if (!displayName || !selectedFile) {
      setStatus((prev) => ({
        ...prev,
        type: "error",
        message: "Display name and file are required!",
      }));
      addLog("ERROR: Validation failed - Missing fields");
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus((prev) => ({
      ...prev,
      type: "info",
      message: "Initialising upload...",
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Starting data transmission...`,
      ],
    }));

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("displayName", displayName);
    formData.append("mode", mode);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
        if (percentComplete === 100) {
          addLog("File transmitted. Server is processing...");
        }
      }
    });

    xhr.addEventListener("load", () => {
      setLoading(false);
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setStatus((prev) => ({
            ...prev,
            type: "success",
            message: "Data successfully inserted into database!",
          }));
          addLog(
            `SUCCESS: ${response.file?.display_name || displayName} recorded in master database.`,
          );
          setDisplayName("");
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          const error = JSON.parse(xhr.responseText);
          setStatus((prev) => ({
            ...prev,
            type: "error",
            message: error.message || "Upload failed",
          }));
          addLog(
            `ERROR: Server rejected the request - ${error.message || xhr.statusText}`,
          );
        }
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          type: "error",
          message: "Invalid server response",
        }));
        addLog("ERROR: Failed to parse server response.");
      }
    });

    xhr.addEventListener("error", () => {
      setLoading(false);
      setStatus((prev) => ({
        ...prev,
        type: "error",
        message: "Network error occurred.",
      }));
      addLog("ERROR: Connection lost or network failure.");
    });

    xhr.open("POST", `${API_BASE_URL}/api/data/upload`);

    // Add Authorization header
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
      } catch (e) {}
    }

    xhr.send(formData);
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        {/* Header */}
        <div className="upload-header">
          <div className="upload-header-title">
            <div className="header-icon-circle">
              <Database size={28} color="white" />
            </div>
            <div>
              <h2>Data Insert Portal</h2>
              <p className="header-subtitle">
                Import and process bulk email data
              </p>
            </div>
          </div>
          <div className="mode-badge">
            <Monitor size={14} /> {mode} Mode
          </div>
        </div>

        <div className="upload-body">
          {/* Main Form Section */}
          <div className="upload-form-section">
            <div className="section-title-modern">
              <FileText size={18} /> Configuration
            </div>

            <div className="upload-form-grid">
              <div className="input-group-modern">
                <label className="label-modern">Display Name</label>
                <div className="input-wrapper-modern">
                  <input
                    type="text"
                    placeholder="e.g., April_Batch_01"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field-modern"
                  />
                </div>
              </div>

              <div className="input-group-modern">
                <label className="label-modern">Upload Mode</label>
                <div className="radio-group-modern">
                  <label
                    className={`radio-label-modern ${mode === "Desktop" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === "Desktop"}
                      onChange={() => setMode("Desktop")}
                    />
                    Desktop
                  </label>
                </div>
              </div>
            </div>

            <div
              className="file-drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept=".txt,.csv"
              />
              <div className="drop-zone-content">
                {selectedFile ? (
                  <>
                    <FileUp size={48} className="text-blue-500 mb-2" />
                    <span className="file-name-display">
                      {selectedFile.name}
                    </span>
                    <span className="file-size-display">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={48} className="text-gray-400 mb-2" />
                    <span className="drop-text">
                      Click to browse email data file
                    </span>
                    <span className="drop-subtext">
                      Supports .txt and .csv formats
                    </span>
                  </>
                )}
              </div>
            </div>

            {loading && (
              <div className="progress-container-modern">
                <div className="progress-stats">
                  <span className="progress-label">Uploading...</span>
                  <span className="progress-percent">{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              className={`btn-upload-modern ${loading ? "loading" : ""}`}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> Insert Into DB
                </>
              )}
            </button>
          </div>

          {/* Console / Log Section */}
          <div className="upload-log-section">
            <div className="section-title-modern">
              <Terminal size={18} /> Console Output
            </div>

            <div className="console-wrapper">
              <div className="console-header-bar">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
                <span className="console-title">upload_terminal_v2.0</span>
              </div>
              <div className="console-content">
                {status.logs.map((log, idx) => (
                  <div key={idx} className="console-line">
                    {log}
                  </div>
                ))}
                {loading && (
                  <div className="console-line blink">
                    Processing chunks... System engaging master-db-01
                  </div>
                )}
                {status.type === "success" && (
                  <div className="console-line text-green-400 font-bold">
                    ✓ DONE: Insertion completed successfully.
                  </div>
                )}
                {status.type === "error" && (
                  <div className="console-line text-red-500 font-bold">
                    ✖ FATAL: {status.message}
                  </div>
                )}
              </div>
            </div>

            {status.message && !loading && (
              <div className={`status-alert ${status.type}`}>
                {status.type === "error" ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
