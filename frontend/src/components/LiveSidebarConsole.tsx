import React, { useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { Maximize2, X } from "lucide-react";
import API_BASE_URL from "../config/api";
import "./LiveSidebarConsole.css";

interface LiveSidebarConsoleProps {
  campaignId: string;
  statusText?: string;
  guidance?: string;
}

const LiveSidebarConsole: React.FC<LiveSidebarConsoleProps> = ({
  campaignId,
  statusText,
  guidance,
}) => {
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const fullscreenTerminalRef = useRef<HTMLDivElement>(null);

  // Connect to Socket.IO when a campaign is active
  useEffect(() => {
    if (!campaignId) return;

    // Reset logs on new campaign load
    setLiveLogs([]);

    socketRef.current = io(API_BASE_URL);

    socketRef.current.on("connect", () => {
      console.log(
        "Attached to Live Sidebar Console (Socket ID):",
        socketRef.current?.id,
      );
      socketRef.current?.emit("join_campaign", campaignId);
    });

    socketRef.current.on(
      "campaign_log",
      (data: { log: any; campaign: any }) => {
        // Handle pure stats updates (e.g., Open tracking hits) where log is null
        if (!data.log) return;

        const newLog = data.log;

        setLiveLogs((prev) => {
          // Check if log already exists (IMAP scanner might have updated it)
          const existingIndex = prev.findIndex((l) => l._id === newLog._id);

          let next = [...prev];
          if (existingIndex !== -1) {
            next[existingIndex] = newLog;
          } else {
            next = [...next, newLog]; // Append to timeline
          }

          // Limit total logs in memory to prevent lag
          if (next.length > 500) return next.slice(next.length - 500);
          return next;
        });
      },
    );

    return () => {
      if (socketRef.current && campaignId) {
        socketRef.current.emit("leave_campaign", campaignId);
        socketRef.current.disconnect();
      }
    };
  }, [campaignId]);

  // Auto scroll to bottom without moving the page
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    if (fullscreenTerminalRef.current) {
      fullscreenTerminalRef.current.scrollTop =
        fullscreenTerminalRef.current.scrollHeight;
    }
  }, [liveLogs, isFullscreen]);

  const lineClass = (type: string) => {
    if (type === "success") return "lsc-success";
    if (type === "error") return "lsc-error";
    return "lsc-info";
  };

  /**
   * Cleans up the log text by removing redundant leading timestamps (e.g., "[6:47:54 PM]")
   * that the backend might have already included in the log_text string.
   */
  const cleanLogText = (text: string) => {
    if (!text) return "";
    // Remove leading timestamp like "[6:47:54 PM]" or "[18:47:54]"
    return text.replace(/^\[\d{1,2}:\d{2}:\d{2}(\s?[APMapm]{2})?\]\s*/, "");
  };

  // Group logs into distinct "Runs" based on the "Campaign started" log
  const groupedRuns = useMemo(() => {
    if (!liveLogs || liveLogs.length === 0) return [];

    // 1. Sort all logs purely chronologically (oldest first) to accurately reconstruct the timeline
    const chronologicalLogs = [...liveLogs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const runs: { title: string; logs: any[] }[] = [];
    let currentRunLogs: any[] = [];
    let currentRunName = "INITIAL SESSION";
    let runCounter = 1;

    for (const log of chronologicalLogs) {
      if (log.log_text && log.log_text.includes("Campaign started")) {
        // We found a new run starting. Save the previous run if it has logs.
        if (currentRunLogs.length > 0) {
          runs.push({ title: currentRunName, logs: currentRunLogs });
        }
        // Start a new run
        currentRunLogs = [log]; // Include the start log in the new run

        // Extract email count for a nicer title if possible
        const match = log.log_text.match(/Emails: (\d+)/);
        const countStr = match ? ` (${match[1]} Emails)` : "";
        currentRunName = `SESSION ${runCounter}${countStr}`;
        runCounter++;
      } else {
        currentRunLogs.push(log);
      }
    }

    // Push the very last run
    if (currentRunLogs.length > 0) {
      runs.push({ title: currentRunName, logs: currentRunLogs });
    }

    // 2. We want the newest run at the BOTTOM for the sidebar terminal (so scroll to bottom works)
    // Or at the top? In ScreenLogPage it is TOP. But here it scrolls to bottom.
    // The user said "shift up and cutting instead of only log data should scroll".
    // This implies traditional terminal flow (new at bottom).
    // I will keep newest run at the BOTTOM so auto-scroll works as expected.

    // 3. Inside each run, sort by created_at (chronological for terminal feel)
    runs.forEach((run) => {
      run.logs.sort((a, b) => {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    });

    return runs;
  }, [liveLogs]);

  const renderLogs = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="lsc-terminal" ref={ref}>
      {groupedRuns.length === 0 ? (
        <div className="lsc-empty">Waiting for campaign logs...</div>
      ) : (
        groupedRuns.map((run, runIndex) => (
          <div key={`run-${runIndex}`} className="lsc-run-group">
            {groupedRuns.length > 1 && (
              <div className="lsc-run-divider">
                <span className="lsc-run-divider-text">{run.title}</span>
                <span className="lsc-run-divider-line"></span>
              </div>
            )}
            {run.logs.map((log: any, i: number) => (
              <div
                key={log._id || i}
                className={`lsc-line ${lineClass(log.type)}`}
              >
                <span className="lsc-timestamp">
                  [{new Date(log.created_at).toLocaleTimeString()}]
                </span>{" "}
                <span className="lsc-text">{cleanLogText(log.log_text)}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <div className="lsc-wrapper">
        <div className="lsc-header">
          <div className="lsc-indicator"></div>
          <span style={{ flex: 1 }}>LIVE CONSOLE</span>
          {statusText && <span className="lsc-status"> • {statusText}</span>}
          <button
            type="button"
            className="lsc-fullscreen-btn"
            onClick={() => setIsFullscreen(true)}
            title="Expand to Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {renderLogs(terminalRef)}

        {guidance && <div className="lsc-guidance">{guidance}</div>}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="lsc-fullscreen-overlay">
          <div className="lsc-fullscreen-content">
            <div className="lsc-header">
              <div className="lsc-indicator"></div>
              <span style={{ flex: 1 }}>REAL-TIME LOGS (FULL PREVIEW)</span>
              <button
                type="button"
                className="lsc-close-btn"
                onClick={() => setIsFullscreen(false)}
              >
                <X size={20} />
              </button>
            </div>
            {renderLogs(fullscreenTerminalRef)}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveSidebarConsole;
