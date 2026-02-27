import React, { useState, useEffect, useRef } from "react";
import { useUpdateDataStatusMutation } from "../store/apiSlice";
import {
  Mail,
  Play,
  Terminal,
  Loader2,
  Activity,
  DatabaseZap,
  ShieldAlert,
} from "lucide-react";
import "./BounceUpdate.css"; // Reusing the shared update portal styles

const ComplainUpdate = () => {
  const [ids, setIds] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Complainer update pipeline standby.",
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

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

  const handleUpdate = async () => {
    const trimmedIds = ids.trim();
    if (!trimmedIds) {
      addLog("ERROR: Data stream empty. Please paste complaint identifiers.");
      return;
    }

    addLog("INIT: Preparing batch complaint update...");

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
        type: "complain",
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
        <h2 className="bounce-update-title">Complain Upload Portal</h2>

        <div className="config-panel">
          <div className="config-header">
            <ShieldAlert size={18} className="text-emerald-400" />
            <span>Complaint Data Parameters</span>
          </div>

          <div className="config-body">
            <div className="full-width-field">
              <label className="field-label mb-2">
                <Activity size={12} /> Identifiers (One per line)
              </label>
              <textarea
                className="config-textarea w-full"
                placeholder="Paste complaint email addresses here..."
                value={ids}
                onChange={(e) => setIds(e.target.value)}
                spellCheck={false}
                style={{ height: "300px" }}
              />
            </div>
          </div>

          <div className="action-bar pb-6">
            <button
              className="update-btn"
              onClick={handleUpdate}
              disabled={isUpdating || !ids.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> PROCESSING...
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
              <Terminal size={12} /> complain_daemon_v2.0
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

export default ComplainUpdate;
