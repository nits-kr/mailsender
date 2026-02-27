import React, { useState, useEffect, useRef } from "react";
import { useGetDataCountQuery, useDeleteDataMutation } from "../store/apiSlice";
import {
  Trash2,
  FileX2,
  Search,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  AlertTriangle,
  Flame,
  Eraser,
} from "lucide-react";
import "./DataDelete.css";

const DataDelete = () => {
  const [filename, setFilename] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Destruction engine initialized. Standing by for target selection...",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const {
    data: files,
    isLoading: isFetching,
    refetch,
  } = useGetDataCountQuery();
  const [deleteData, { isLoading: isDeleting }] = useDeleteDataMutation();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const handleDelete = async (targetFilename?: string) => {
    const fileToDelete = targetFilename || filename;

    if (!fileToDelete) {
      addLog("ERROR: Target vector missing. Select or input filename.");
      return;
    }

    if (
      !window.confirm(
        `Are you absolutely sure you want to PERMANENTLY purge ${fileToDelete}? This action is irreversible.`,
      )
    ) {
      addLog(`CANCEL: Destruction sequence aborted for ${fileToDelete}`);
      return;
    }

    addLog(`INIT: PURGE command sent for ${fileToDelete}...`);

    try {
      await deleteData(fileToDelete).unwrap();
      addLog(`SUCCESS: ${fileToDelete} has been completely erased from disk.`);
      setFilename("");
      refetch();
    } catch (error: any) {
      addLog(
        `CRITICAL: Purge failed - ${error?.data?.message || "Internal system error"}`,
      );
    }
  };

  const filteredFiles = Array.isArray(files)
    ? files.filter((f) =>
        f.filename?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  return (
    <div className="delete-wrapper">
      <div className="delete-container">
        {/* Header */}
        <div className="delete-header">
          <div className="header-left">
            <div className="icon-box">
              <FileX2 size={24} />
            </div>
            <div>
              <h1>Data Destruction Portal</h1>
              <p className="subtitle">L0 System purge & cleanup utility</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => refetch()}>
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Stacked Layout Wrapper */}
        <div className="delete-content">
          {/* Top Section: Action (Centered) */}
          <div className="action-section">
            <div className="input-row">
              <span className="input-label">Filename To Erase = </span>
              <input
                type="text"
                placeholder="Enter cluster name..."
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            <button
              className="big-delete-btn"
              onClick={() => handleDelete()}
              disabled={isDeleting || (!filename && !isDeleting)}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Erasing...
                </>
              ) : (
                <>
                  <Eraser size={18} /> Delete File
                </>
              )}
            </button>
          </div>

          {/* Middle Section: Console (Status Wide) */}
          <div className="console-card">
            <div className="console-head">
              <div className="dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="console-title">
                <Terminal size={12} /> wipe_daemon_v9.0
              </div>
            </div>
            <div className="console-body" ref={consoleRef}>
              <div className="log-entry font-bold text-red-400 mb-2">
                Delete Process Status...
              </div>
              {consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`log-entry ${
                    log.includes("SUCCESS")
                      ? "success"
                      : log.includes("ERROR") || log.includes("CRITICAL")
                        ? "error"
                        : log.includes("INIT")
                          ? "info"
                          : ""
                  }`}
                >
                  {log}
                </div>
              ))}
              {isDeleting && (
                <div className="log-entry info animate-pulse">
                  Wiping data records... zeroing binary stream...
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Browser (Table Wide) */}
          <div className="browser-card">
            <div className="browser-head">
              <div className="meta-text text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <FileText size={14} className="inline mr-2" /> File Name
              </div>
              <div className="search-field">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="SEARCH AVAILABLE DATA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="delete-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th className="text-right">Count</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.filename}>
                      <td>
                        <div className="filename-cell">{file.filename}</div>
                      </td>
                      <td className="text-right">
                        <span className="count-badge">
                          {file.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(file.filename)}
                          className="text-red-500 font-bold hover:underline text-[11px]"
                        >
                          [DELETE]
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-20 text-slate-400 italic"
                      >
                        No targets found matching synchronization logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDelete;
