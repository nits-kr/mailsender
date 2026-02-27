import React, { useState, useEffect, useRef } from "react";
import {
  useUpdateDataStatusMutation,
  useGetSmtpDetailsQuery,
} from "../store/apiSlice";
import {
  Database,
  Calendar,
  Server,
  Play,
  Terminal,
  Loader2,
  RefreshCw,
  DatabaseZap,
  Activity,
  ServerCrash,
} from "lucide-react";
import "./BounceUpdate.css";

const BounceUpdate = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [server, setServer] = useState("");
  const [ids, setIds] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Bounce update pipeline ready.",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const {
    data: smtpDetails,
    isLoading: isFetchingServers,
    refetch: refetchServers,
  } = useGetSmtpDetailsQuery();
  const [updateDataStatus, { isLoading: isUpdating }] =
    useUpdateDataStatusMutation();

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

  const handleUpdate = async () => {
    const trimmedIds = ids.trim();
    if (!trimmedIds) {
      addLog("ERROR: Data stream empty. Please paste email identifiers.");
      return;
    }

    if (!server) {
      addLog(
        "ERROR: Target node unselected. Please define synchronization target.",
      );
      return;
    }

    addLog(`INIT: Preparing batch update for ${server}...`);
    addLog(`PARAMS: Processing logs for date index: ${date}`);

    try {
      const idArray = trimmedIds
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

      addLog(
        `INFO: Payload construction complete. ${idArray.length} records in queue.`,
      );

      const res = await updateDataStatus({
        ids: idArray,
        type: "bounce",
        // server,
        // date,
      }).unwrap();

      addLog(`SUCCESS: ${res.message || "Update completed"}`);
      addLog(`STAT: Total Processed: ${res.totalCount || 0}`);
      addLog(`STAT: Updated in DB: ${res.updatedCount || 0}`);
      setIds("");
    } catch (error: any) {
      addLog(
        `CRITICAL: Pipeline disruption - ${error?.data?.message || error?.message || "Source node unreachable"}`,
      );
    }
  };

  return (
    <div className="bounce-update-wrapper">
      <div className="bounce-update-container">
        <h2 className="bounce-update-title">Bounce Upload Portal</h2>

        <div className="config-panel">
          <div className="config-header">
            <Database size={18} className="text-emerald-400" />
            <span>Update Parameters</span>
            {isFetchingServers && (
              <Loader2 size={12} className="animate-spin ml-auto" />
            )}
          </div>

          <div className="config-body">
            <div className="field-row" style={{ display: "none" }}>
              <div className="field-group">
                <label className="field-label">
                  <Calendar size={12} /> Extraction Date
                </label>
                <input
                  type="date"
                  className="config-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">
                  <Server size={12} /> Target Server Node
                </label>
                <div className="flex gap-2">
                  <select
                    className="config-select flex-1"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                  >
                    <option value="">Select target node...</option>
                    {servers.map((s: any) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => refetchServers()}
                    title="Refresh Node List"
                  >
                    <RefreshCw
                      size={14}
                      className={isFetchingServers ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="full-width-field">
              <label className="field-label mb-2">
                <Activity size={12} /> Identifiers (One per line)
              </label>
              <textarea
                className="config-textarea w-full"
                placeholder="Paste bounce email addresses here..."
                value={ids}
                onChange={(e) => setIds(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          <div className="action-bar pb-6">
            <button
              className="update-btn"
              onClick={handleUpdate}
              disabled={isUpdating || !ids.trim() || !server}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> PROCESING...
                </>
              ) : (
                <>
                  <DatabaseZap size={18} /> INSERT INTO DB
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic Console */}
        <div className="console-card">
          <div className="console-head">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="console-title text-emerald-400">
              <Terminal size={12} /> update_daemon_v2.0
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
                      : log.includes("INIT") || log.includes("INFO")
                        ? "info"
                        : ""
                }`}
              >
                {log}
              </div>
            ))}
            {isUpdating && (
              <div className="log-entry info animate-pulse">
                Iterating identifier stack... mapping suppression vectors...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BounceUpdate;
