import React, { useState, useEffect, useRef } from "react";
import {
  useFetchDataBounceMutation,
  useGetSmtpDetailsQuery,
} from "../store/apiSlice";
import {
  CloudDownload,
  Calendar,
  Server,
  Play,
  Terminal,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";
import "./BounceFetch.css";

const BounceFetch = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [server, setServer] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Bounce collector daemon standing by...",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const {
    data: smtpDetails,
    isLoading: isFetchingServers,
    refetch: refetchServers,
  } = useGetSmtpDetailsQuery();
  const [fetchDataBounce, { isLoading: isFetching }] =
    useFetchDataBounceMutation();

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

  const servers = Array.isArray(smtpDetails)
    ? Array.from(new Set(smtpDetails.map((s) => s.server))).filter(Boolean)
    : [];

  const handleFetch = async () => {
    if (!date || !server) {
      addLog("ERROR: Data parameters missing. Select target date and server.");
      return;
    }

    addLog(`INIT: Synchronizing with ${server}...`);
    addLog(`CONFIG: Fetching logs for period: ${date}`);

    try {
      const res = await fetchDataBounce({
        server,
        date,
      }).unwrap();
      addLog(
        `SUCCESS: ${res.message || "Bulk records synchronized successfully."}`,
      );
    } catch (error: any) {
      addLog(
        `CRITICAL: External pipe error - ${error?.data?.message || "Remote connection timed out."}`,
      );
    }
  };

  return (
    <div className="bounce-wrapper">
      <div className="bounce-container">
        {/* Header */}
        <div className="bounce-header">
          <div className="header-left">
            <div className="icon-box">
              <CloudDownload size={24} />
            </div>
            <div>
              <h1>Bounce Fetch Portal</h1>
              <p className="subtitle">
                Remote suppression synchronization bridge
              </p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => refetchServers()}>
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="bounce-grid">
          {/* Configuration Panel */}
          <div className="config-card">
            <div className="field-group">
              <label>
                <Calendar size={14} /> Extraction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>
                <Server size={14} /> Target Server Node (Select Server:)
              </label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
              >
                <option value="">Select synchronization target...</option>
                {servers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="fetch-btn"
              onClick={handleFetch}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <Loader2 className="animate-spin" size={18} />{" "}
                  Synchronizing...
                </>
              ) : (
                <>
                  <Play size={18} /> Get Bounce Logs
                </>
              )}
            </button>

            {isFetching && (
              <div className="status-shimmer">
                <Zap size={14} className="animate-pulse" />
                <span>Interfacing with MySQL remote buffer...</span>
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
                <Terminal size={12} /> fetch_bridge_v1.2
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
              {isFetching && (
                <div className="log-entry info animate-pulse">
                  Requesting records for {date}... encrypting tunnel...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BounceFetch;
