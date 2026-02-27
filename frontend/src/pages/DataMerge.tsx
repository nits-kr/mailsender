import React, { useState, useEffect, useRef } from "react";
import { useGetDataCountQuery, useMergeDataMutation } from "../store/apiSlice";
import {
  GitMerge,
  FileText,
  PlusCircle,
  Trash2,
  Play,
  Terminal,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ArrowRightLeft,
  Search,
  Hash,
} from "lucide-react";
import "./DataMerge.css";

const DataMerge = () => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Merge node ready. Awaiting cluster selection...",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const {
    data: allFiles,
    isLoading: isLoadingFiles,
    refetch,
  } = useGetDataCountQuery();
  const [mergeData, { isLoading: isMerging }] = useMergeDataMutation();

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const toggleFile = (file: any) => {
    if (selectedFiles.find((f) => f.filename === file.filename)) {
      setSelectedFiles((prev) =>
        prev.filter((f) => f.filename !== file.filename),
      );
      addLog(`REMOVED: ${file.filename} detached from queue.`);
    } else {
      setSelectedFiles((prev) => [...prev, file]);
      addLog(`STAGED: ${file.filename} added to merge sequence.`);
    }
  };

  const handleMerge = async () => {
    const filenames = selectedFiles.map((f) => f.filename);
    if (filenames.length < 2) {
      addLog("ERROR: Merge logic requires at least 2 clusters.");
      return;
    }

    addLog(`INIT: Master merge initiated for ${filenames.length} sources...`);

    try {
      const res = await mergeData({ filenames }).unwrap();
      addLog(`SUCCESS: ${res.message}`);
      addLog(`GENERATE: Master file -> ${res.output_file}`);
      setSelectedFiles([]);
      refetch();
    } catch (error: any) {
      addLog(
        `CRITICAL: Merge failure - ${error?.data?.message || "Disk I/O error"}`,
      );
    }
  };

  const filteredPool = (Array.isArray(allFiles) ? allFiles : []).filter(
    (f) =>
      f.filename?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedFiles.find((sf) => sf.filename === f.filename),
  );

  const totalMergeCount = selectedFiles.reduce(
    (acc, f) => acc + (f.count || 0),
    0,
  );

  return (
    <div className="merge-wrapper">
      <div className="merge-container">
        {/* Header */}
        <div className="merge-header">
          <div className="header-title-box">
            <div className="icon-badge">
              <GitMerge size={28} />
            </div>
            <div>
              <h1>Data Consolidation Portal</h1>
              <p className="subtitle">High-speed file concatenation engine</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => refetch()}>
            <RefreshCw
              size={18}
              className={isLoadingFiles ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="merge-grid">
          {/* Available Pool */}
          <div className="panel-box">
            <div className="panel-head">
              <div className="panel-label">
                <Hash size={14} /> Available Data
              </div>
              <div className="panel-meta">{filteredPool.length} Clusters</div>
            </div>
            <div className="pool-search-box">
              <div className="pool-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Filter available files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="item-list">
              {isLoadingFiles ? (
                <div className="empty-state">Fetching sources...</div>
              ) : filteredPool.length === 0 ? (
                <div className="empty-state">No matching files found.</div>
              ) : (
                filteredPool.map((file) => (
                  <div
                    key={file.filename}
                    className="merge-item"
                    onClick={() => toggleFile(file)}
                  >
                    <FileText size={14} className="text-slate-400" />
                    <span className="item-name">{file.filename}</span>
                    <span className="item-count">
                      {file.count.toLocaleString()}
                    </span>
                    <PlusCircle size={14} className="add-icon" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="merge-mid">
            <ArrowRightLeft size={24} />
          </div>

          {/* Merge Pipeline */}
          <div className="panel-box">
            <div className="panel-head">
              <div className="panel-label">
                <CheckCircle2 size={14} /> Merge Pipeline
              </div>
              <div className="item-count">
                TOTAL: {totalMergeCount.toLocaleString()}
              </div>
            </div>
            <div className="item-list">
              {selectedFiles.length === 0 ? (
                <div className="empty-state">
                  Select files from the left to stage merge.
                </div>
              ) : (
                selectedFiles.map((file) => (
                  <div
                    key={file.filename}
                    className="merge-item queued"
                    onClick={() => toggleFile(file)}
                  >
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="item-name">{file.filename}</span>
                    <span className="item-count">
                      {file.count.toLocaleString()}
                    </span>
                    <Trash2 size={14} className="remove-icon ml-auto" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Console & Actions */}
        <div className="merge-actions">
          <div className="execute-bar">
            <button
              className="merge-btn"
              onClick={handleMerge}
              disabled={isMerging || selectedFiles.length < 2}
            >
              {isMerging ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Merging
                  Buffers...
                </>
              ) : (
                <>
                  <GitMerge size={20} /> Execute Master Merge
                </>
              )}
            </button>
          </div>

          <div className="merge-console">
            <div className="console-head">
              <div className="dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="console-title">
                <Terminal size={12} /> merge_daemon_v4.0
              </div>
            </div>
            <div className="console-body" ref={consoleRef}>
              {consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`log-line ${
                    log.includes("SUCCESS")
                      ? "success"
                      : log.includes("ERROR") || log.includes("CRITICAL")
                        ? "error"
                        : ""
                  }`}
                >
                  {log}
                </div>
              ))}
              {isMerging && (
                <div className="log-line animate-pulse">
                  Piping binary streams... concatenating shards...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMerge;
