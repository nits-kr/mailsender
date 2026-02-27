import React, { useState, useEffect, useRef } from "react";
import { useGetDataCountQuery, useSplitDataMutation } from "../store/apiSlice";
import {
  Scissors,
  FileText,
  Hash,
  ArrowRightLeft,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
} from "lucide-react";
import "./DataSplit.css";

const DataSplit = () => {
  const [filename, setFilename] = useState("");
  const [count, setCount] = useState("50000");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Split daemon initialized. Awaiting source target...",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const {
    data: files,
    refetch,
    isLoading: isFetching,
  } = useGetDataCountQuery();
  const [splitData, { isLoading: isProcessing }] = useSplitDataMutation();

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

  const handleSplit = async () => {
    if (!filename || !count) {
      addLog("ERROR: Extraction target or limit missing.");
      return;
    }

    addLog(`INIT: Sharding sequence triggered for ${filename}`);
    addLog(`CONFIG: records_per_file = ${count}`);

    try {
      const res = await splitData({ filename, count }).unwrap();
      addLog(`SUCCESS: ${res.message}`);
      if (res.directory) {
        addLog(`PATH: Master shards located in /${res.directory}`);
      }
      refetch();
    } catch (error: any) {
      addLog(
        `CRITICAL: Operation failed - ${error?.data?.message || "Interrupted pipe"}`,
      );
    }
  };

  return (
    <div className="split-wrapper">
      <div className="split-container">
        {/* Header */}
        <div className="split-header">
          <div className="header-left">
            <div className="icon-box">
              <Scissors size={24} />
            </div>
            <div>
              <h1>Data Sharding Portal</h1>
              <p className="subtitle">High-speed file segmentation utility</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => refetch()}>
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="split-grid">
          {/* Configuration Panel */}
          <div className="config-card">
            <div className="field-group">
              <label>
                <FileText size={14} /> Source Cluster (File Name)
              </label>
              <select
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                autoFocus
              >
                <option value="">Select master file...</option>
                {Array.isArray(files) &&
                  files.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      {f.filename} ({f.count.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            <div className="field-group">
              <label>
                <Hash size={14} /> Records Per Shard (How Many Count? )
              </label>
              <input
                type="text"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Segmenting...
                </>
              ) : (
                <>
                  <Play size={18} /> Execute Sharding
                </>
              )}
            </button>

            {isProcessing && (
              <div className="status-shimmer">
                <ArrowRightLeft size={14} className="animate-bounce" />
                <span>Hashing master stream & writing buffers...</span>
              </div>
            )}
          </div>

          {/* Terminal Console */}
          <div className="console-card">
            <div className="console-head">
              <div className="dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="console-title">
                <Terminal size={12} /> shard_engine_v2.1
              </div>
            </div>
            <div className="console-body" ref={consoleRef}>
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
              {isProcessing && (
                <div className="log-entry info animate-pulse">
                  Interfacing with filesystem... generating shards...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSplit;
