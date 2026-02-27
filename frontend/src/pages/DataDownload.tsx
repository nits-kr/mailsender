import React, { useState } from "react";
import {
  useGetDataCountQuery,
  useDownloadDataMutation,
  useGetGeneratedFileMutation,
  useDeleteDataMutation,
  useGetBufferFilesQuery,
  useDeleteBufferFileMutation,
} from "../store/apiSlice";
import {
  Download,
  Search,
  PlusCircle,
  Hash,
  Settings2,
  Terminal,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
  Globe,
  RefreshCw,
  ArrowRightLeft,
  Trash2,
  Eye,
  XCircle,
  X,
} from "lucide-react";
import "./DataDownload.css";

const DataDownload = () => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ip, setIp] = useState(window.location.hostname || "173.249.50.153");
  const [count, setCount] = useState("10000");
  const [repeat, setRepeat] = useState("1");
  const [type, setType] = useState("Random");
  const [selector, setSelector] = useState("email");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Daemon active. Ready for data extraction...",
  ]);
  const [generatedFilename, setGeneratedFilename] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const {
    data: allFiles,
    isLoading: isLoadingFiles,
    refetch,
  } = useGetDataCountQuery();
  const [downloadData, { isLoading: isDownloading }] =
    useDownloadDataMutation();
  const [getGeneratedFile, { isLoading: isReading }] =
    useGetGeneratedFileMutation();
  const [deleteDataFile] = useDeleteDataMutation();
  const { data: bufferFiles = [], refetch: refetchBuffer } =
    useGetBufferFilesQuery();
  const [deleteBufferFile] = useDeleteBufferFileMutation();

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const addFileToSelected = (file: any) => {
    if (!selectedFiles.find((f) => f.filename === file.filename)) {
      setSelectedFiles((prev) => [...prev, file]);
      addLog(`Attached cluster: ${file.filename}`);
    }
  };

  const removeFileFromSelected = (filename: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.filename !== filename));
    addLog(`Detached: ${filename}`);
  };

  const handleDelete = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    addLog(`Initiating destruction sequence for ${filename}...`);
    try {
      await deleteDataFile(filename).unwrap();
      addLog(`SUCCESS: ${filename} has been purged from the filesystem.`);

      // Sync local state: remove from selected if it was there
      setSelectedFiles((prev) => prev.filter((f) => f.filename !== filename));

      refetch();
    } catch (error: any) {
      addLog(
        `ERROR: Destruction failed - ${error?.data?.message || "File locked"}`,
      );
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, file: any) => {
    e.dataTransfer.setData("file", JSON.stringify(file));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fileData = e.dataTransfer.getData("file");
    if (fileData) {
      const file = JSON.parse(fileData);
      addFileToSelected(file);
    }
  };

  const handleDownload = async () => {
    if (selectedFiles.length === 0) {
      addLog("ERROR: Extraction pool is empty!");
      return;
    }

    addLog(
      `Executing extraction pipeline for ${selectedFiles.length} source(s)...`,
    );
    setGeneratedFilename("");
    setPreviewContent("");

    try {
      const res = await downloadData({
        filenames: selectedFiles.map((f) => f.filename),
        count,
        type,
        times: repeat,
        ip,
        selector,
      }).unwrap();

      setGeneratedFilename(res.filename);
      addLog(`SUCCESS: Extraction set generated -> ${res.filename}`);
      addLog(
        `Report: Records: ${res.finalCount} | Suppressed: ${res.suppCount}`,
      );
    } catch (error: any) {
      addLog(
        `CRITICAL: Pipeline failure - ${error?.data?.message || "Connection timeout"}`,
      );
    }
  };

  const handlePreview = async () => {
    if (!generatedFilename) return;
    addLog(`Interfacing with filesystem to read ${generatedFilename}...`);
    try {
      const res = await getGeneratedFile({
        filename: generatedFilename,
      }).unwrap();
      setPreviewContent(res.content);
      setShowPreview(true);
      addLog(`SUCCESS: Content cache loaded into preview buffer.`);
    } catch (error: any) {
      addLog(
        `ERROR: Unable to read file - ${error?.data?.message || "File locked"}`,
      );
    }
  };

  const filteredFiles = (Array.isArray(allFiles) ? allFiles : []).filter(
    (f) =>
      f.filename?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedFiles.find((sf) => sf.filename === f.filename),
  );

  const totalSelectedCount = selectedFiles.reduce(
    (acc, f) => acc + (f.count || 0),
    0,
  );
  const totalAllCount = (Array.isArray(allFiles) ? allFiles : []).reduce(
    (acc, f) => acc + (f.count || 0),
    0,
  );

  return (
    <div className="download-wrapper">
      {showPreview && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-header">
              <div className="header-left">
                <FileText size={18} />
                <span>Data Sample: {generatedFilename}</span>
              </div>
              <button
                className="close-preview"
                onClick={() => setShowPreview(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="preview-body">
              <pre>
                {previewContent ||
                  "Establishing link... Empty buffer returned."}
              </pre>
            </div>
            <div className="preview-footer">
              <span>Showing raw data sample (head stream)</span>
              <button
                className={`copy-btn ${isCopied ? "copied" : ""}`}
                onClick={() => {
                  const copyText = (text: string) => {
                    if (navigator.clipboard) {
                      navigator.clipboard
                        .writeText(text)
                        .then(() => {
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        })
                        .catch(() => {
                          // Fallback
                          const textArea = document.createElement("textarea");
                          textArea.value = text;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand("copy");
                          textArea.remove();
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        });
                    } else {
                      const textArea = document.createElement("textarea");
                      textArea.value = text;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand("copy");
                      textArea.remove();
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }
                  };
                  copyText(generatedFilename);
                }}
              >
                {isCopied ? "Copied!" : "Copy Filename"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="download-container">
        {/* Header */}
        <div className="download-header">
          <div className="header-title-box">
            <div className="icon-badge">
              <Download size={28} color="white" />
            </div>
            <div>
              <h1>Data Extract Portal</h1>
              <p className="subtitle">
                High-speed suppression & export utility
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={() => refetch()}
              title="Refresh Source List"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="workspace-grid">
          {/* AVAILABLE POOL */}
          <div className="pool-box available-pool">
            <div className="pool-header">
              <div className="pool-label">
                <Layers size={16} /> Available Clusters
              </div>
              <div className="pool-meta">
                Total: {totalAllCount.toLocaleString()}
              </div>
            </div>
            <div className="pool-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Filter master data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="pool-list scrollable">
              {isLoadingFiles ? (
                <div className="pool-state">
                  <Loader2 className="animate-spin" /> Fetching...
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="pool-state">No matching clusters</div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.filename}
                    className="pool-item draggable"
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onClick={() => addFileToSelected(file)}
                    title={file.filename}
                  >
                    <FileText size={14} className="text-slate-400" />
                    <span className="file-name">
                      {file.display_name || file.filename}
                    </span>
                    <span className="file-separator">|</span>
                    <span className="file-count">
                      {file.count.toLocaleString()}
                    </span>
                    <div className="item-actions">
                      <PlusCircle size={14} className="add-icon" />
                      <Trash2
                        size={14}
                        className="delete-item-btn"
                        onClick={(e) => handleDelete(file.filename, e)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TRANSFER ICON */}
          <div className="transfer-indicator">
            <ArrowRightLeft size={24} className="text-slate-300" />
          </div>

          {/* SELECTED POOL (DROP ZONE) */}
          <div
            className="pool-box selected-pool"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="pool-header">
              <div className="pool-label">
                <CheckCircle2 size={16} /> Selected Pipeline
              </div>
              <div className="pool-meta active">
                Total: {totalSelectedCount.toLocaleString()}
              </div>
            </div>
            <div className="pool-list scrollable">
              {selectedFiles.length === 0 ? (
                <div className="pool-state drop-cue">
                  <Download size={32} className="mb-2" />
                  Drag clusters here to stage extraction
                </div>
              ) : (
                selectedFiles.map((file) => (
                  <div key={file.filename} className="pool-item staged">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="file-name">{file.filename}</span>
                    <div className="item-controls">
                      <span className="file-count">[{file.count}]</span>
                      <Trash2
                        size={14}
                        className="remove-btn"
                        onClick={() => removeFileFromSelected(file.filename)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SETTINGS & LOGS */}
        <div className="bottom-sections">
          {/* Parameters */}
          <div className="settings-card">
            <div className="card-header">
              <Settings2 size={18} /> Configuration
            </div>
            <div className="settings-grid">
              <div className="field-group">
                <label>
                  <Globe size={14} /> Global IP
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>
                  <Hash size={14} /> Extract Limit
                </label>
                <input
                  type="text"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>
                  <RefreshCw size={14} /> Loop Count
                </label>
                <input
                  type="text"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Extraction Logic</label>
                <div className="logic-toggles">
                  <button
                    className={type === "Random" ? "active" : ""}
                    onClick={() => setType("Random")}
                  >
                    Random
                  </button>
                  <button
                    className={type === "Not Random" ? "active" : ""}
                    onClick={() => setType("Not Random")}
                  >
                    Static
                  </button>
                </div>
              </div>
              <div className="field-group span-2">
                <label>Attribute Selector</label>
                <div className="logic-toggles">
                  <button
                    className={selector === "email" ? "active" : ""}
                    onClick={() => setSelector("email")}
                  >
                    Plain Address
                  </button>
                  <button
                    className={selector === "both" ? "active" : ""}
                    onClick={() => setSelector("both")}
                  >
                    Address + Hash (MD5)
                  </button>
                </div>
              </div>
            </div>
            <button
              className={`execute-btn ${isDownloading ? "processing" : ""}`}
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Generating
                  extraction package...
                </>
              ) : (
                <>
                  <Download size={20} /> Execute Data Extraction
                </>
              )}
            </button>
          </div>

          {/* Console */}
          <div className="console-card">
            <div className="console-head">
              <div className="console-dots">
                <span className="dot d-red"></span>
                <span className="dot d-yellow"></span>
                <span className="dot d-green"></span>
              </div>
              <div className="console-title">
                <Terminal size={12} /> extract_daemon_v1.0.4
              </div>
            </div>
            <div className="console-body">
              {consoleLogs.map((log, i) => (
                <div key={i} className="log-line">
                  {log}
                </div>
              ))}
              {isDownloading && (
                <div className="log-line pulse">
                  Interfacing with SQL master... suppression in progress...
                </div>
              )}
              {generatedFilename && (
                <div className="success-banner">
                  <div className="banner-text">
                    PACKAGE_ID: {generatedFilename}
                  </div>
                  <button
                    className="preview-action-btn"
                    onClick={handlePreview}
                    disabled={isReading}
                  >
                    {isReading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Eye size={12} />
                    )}
                    View Data Sample
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GENERATED FILES HISTORY */}
        <div className="settings-card" style={{ marginTop: "20px" }}>
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} /> Generated Files
            </span>
            <button
              onClick={() => refetchBuffer()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
              }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            {bufferFiles.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                No extraction files yet. Run an extraction to see results here.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Filename
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Records
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Size
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bufferFiles.map((bf: any) => (
                    <tr
                      key={bf.filename}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          fontFamily: "monospace",
                          color: "#334155",
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {bf.filename}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#10b981",
                        }}
                      >
                        {bf.count.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        {bf.size < 1024
                          ? `${bf.size}B`
                          : `${(bf.size / 1024).toFixed(1)}KB`}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          color: "#64748b",
                        }}
                      >
                        {bf.date} {bf.time}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={async () => {
                              addLog(`Reading ${bf.filename}...`);
                              try {
                                const res = await getGeneratedFile({
                                  filename: bf.filename,
                                }).unwrap();
                                setPreviewContent(res.content);
                                setGeneratedFilename(bf.filename);
                                setShowPreview(true);
                              } catch {
                                addLog("ERROR: Could not read file.");
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#3b82f6",
                            }}
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete ${bf.filename}?`))
                                return;
                              await deleteBufferFile(bf.filename);
                              refetchBuffer();
                              addLog(`Deleted: ${bf.filename}`);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDownload;
