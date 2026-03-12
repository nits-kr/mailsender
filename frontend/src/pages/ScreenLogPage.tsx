import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetScreenLogsQuery,
  useGetCampaignStatsQuery,
  useStopScreenMutation,
  useClearCampaignLogsMutation,
} from "../store/apiSlice";
import API_BASE_URL from "../config/api";
import { io, Socket } from "socket.io-client";
import "./ScreenLogPage.css";

const ScreenLogPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [polling, setPolling] = useState(true);

  // Live Socket Logs
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // We only fetch the initial batch of logs (no polling for logs anymore)
  const { data: initialLogs = [], isFetching: logsFetching } =
    useGetScreenLogsQuery(id!, {
      skip: !id,
      refetchOnMountOrArgChange: true,
    });

  // Initialize liveLogs immediately when initialLogs load
  useEffect(() => {
    if (initialLogs.length > 0) {
      // Sort: highest inbox_percent first, then newest-first by created_at
      const sorted = [...initialLogs].sort((a, b) => {
        const pctDiff = (b.inbox_percent ?? 0) - (a.inbox_percent ?? 0);
        if (pctDiff !== 0) return pctDiff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setLiveLogs(sorted);
    }
  }, [initialLogs]);

  const { data: stats } = useGetCampaignStatsQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const [localStats, setLocalStats] = useState<any>(null);

  // Initialize local stats completely once RTK query finishes
  useEffect(() => {
    if (stats && !localStats) {
      setLocalStats(stats);
    }
  }, [stats]);

  const [stopScreen] = useStopScreenMutation();
  const [clearLogs, { isLoading: isClearing }] = useClearCampaignLogsMutation();

  /* 
  // Disable auto-scroll to bottom for newest-first view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLogs]);
  */

  // Stop polling stats when campaign is done
  useEffect(() => {
    if (
      localStats?.status === "Completed" ||
      localStats?.status === "Stopped"
    ) {
      setPolling(false);
    }
  }, [localStats]);

  // Socket.io Connection Hook
  useEffect(() => {
    if (!id) return;

    socketRef.current = io(API_BASE_URL);

    socketRef.current.on("connect", () => {
      console.log(
        "Connected to Real-time Logs. Socket ID:",
        socketRef.current?.id,
      );
      socketRef.current?.emit("join_campaign", id);
    });

    socketRef.current.on(
      "campaign_log",
      (data: { log: any; campaign: any }) => {
        const newLog = data.log;
        if (!newLog) return;

        setLiveLogs((prev) => {
          // Check if log already exists (IMAP scanner might have updated it)
          const existingIndex = prev.findIndex((l) => l._id === newLog._id);

          // Add/Update log and Robustly sort DESC by created_at for a "smooth" experience
          let next = [...prev];
          if (existingIndex !== -1) {
            next[existingIndex] = newLog;
          } else {
            next = [newLog, ...next];
          }

          // Limit total logs in memory to prevent browser lag on huge campaigns
          if (next.length > 2000) return next.slice(0, 2000);
          return next;
        });

        // Update header stats in sync with the log update
        if (data.campaign) {
          setLocalStats(data.campaign);
        }
      },
    );

    return () => {
      if (socketRef.current && id) {
        socketRef.current.emit("leave_campaign", id);
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const handleStop = async () => {
    if (!id) return;
    if (!window.confirm("Stop this campaign?")) return;
    await stopScreen(id).unwrap().catch(console.error);
    setPolling(false);
  };

  const handleClearLogs = async () => {
    if (!id) return;
    if (
      !window.confirm(
        "Are you sure you want to permanently clear all logs for this campaign?",
      )
    )
      return;
    try {
      await clearLogs(id).unwrap();
      setLiveLogs([]);
    } catch (error) {
      console.error("Failed to clear logs", error);
      alert("Error clearing logs");
    }
  };

  const formatLogLine = (log: any) => {
    let text = log.log_text || "";

    if (!text) {
      // Fallback for very old unformatted logs
      const sentTotal = log.sent ?? 0;
      const inbox = log.inbox ?? 0;
      const spam = log.spam ?? 0;
      const received = log.received ?? 0;
      const inboxPct =
        log.inbox_percent != null
          ? log.inbox_percent
          : sentTotal > 0
            ? ((inbox / sentTotal) * 100).toFixed(2)
            : "0";
      const status =
        log.mail_status || (log.type === "success" ? "success" : "error");

      text =
        `Total Mail Sent : ${sentTotal} || ` +
        `Total Mail Received : ${received} || ` +
        `INBOX : ${inbox} || ` +
        `SPAM : ${spam} || ` +
        /* `PROMO : ${log.promo || 0} || ` +
        `SOCIAL : ${log.social || 0} || ` +
        `UPDATES : ${log.updates || 0} || ` + */
        `MAIL STATUS : ${status} || ` +
        `Inbox % : ${inboxPct}%`;
    }

    // Dynamically strip out Promo, Social, and Updates from the backend string for the UI
    text = text.replace(/\s*\|\|\s*(PROMO|Promo)\s*:\s*\d+/g, "");
    text = text.replace(/\s*\|\|\s*(SOCIAL|Social)\s*:\s*\d+/g, "");
    text = text.replace(/\s*\|\|\s*(UPDATES|Updates)\s*:\s*\d+/g, "");
    text = text.replace(/\s*\|\|\s*(OPENED|Opened)\s*:\s*\d+/g, "");

    return text;
  };

  const lineClass = (type: string) => {
    if (type === "success") return "log-line-success";
    if (type === "error") return "log-line-error";
    return "log-line-info";
  };

  const sent = localStats?.success_count ?? 0;
  const errors = localStats?.error_count ?? 0;
  const total = localStats?.total_emails ?? 0;
  const status = localStats?.status ?? "—";

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

        // Extract email count for a nicer title if possible, fallback to simple counter
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

    // 2. We want the newest run at the TOP of the page
    runs.reverse();

    // 3. Inside each run, we want the BEST inbox result at the top
    runs.forEach((run) => {
      run.logs.sort((a, b) => {
        // First sort by inbox_percent descending
        const pctDiff = (b.inbox_percent || 0) - (a.inbox_percent || 0);
        if (pctDiff !== 0) return pctDiff;
        // Tie-breaker: newest first
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    });

    return runs;
  }, [liveLogs]);

  return (
    <div className="slp-container">
      {/* Header Bar */}
      <div className="slp-header">
        <button className="slp-back-btn" onClick={() => navigate("/screen")}>
          ← Go Back
        </button>
        <button
          className="slp-back-btn"
          onClick={handleClearLogs}
          disabled={isClearing}
          style={{
            marginLeft: "10px",
            borderColor: "#ef4444",
            color: "#fca5a5",
          }}
        >
          {isClearing ? "Clearing..." : "🗑️ Clear Logs"}
        </button>
        <h2 className="slp-title">{localStats?.template_name ?? id}</h2>
        <div className="slp-actions">
          {polling ? (
            <span className="slp-live-badge">● LIVE</span>
          ) : (
            <span className="slp-done-badge">■ {status}</span>
          )}
          {(status === "Running" || status === "Pending") && (
            <button className="slp-stop-btn" onClick={handleStop}>
              STOP
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="slp-stats-bar">
        <span className="slp-stat">
          <span className="slp-stat-label">TOTAL</span>
          <span className="slp-stat-value">{total}</span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">SENT</span>
          <span className="slp-stat-value slp-green">{sent}</span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">ERRORS</span>
          <span className="slp-stat-value slp-red">{errors}</span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">INBOX</span>
          <span className="slp-stat-value slp-green">
            {localStats?.inbox_count ?? 0}
          </span>
        </span>
        {/* <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">OPENS</span>
          <span className="slp-stat-value" style={{ color: "#a855f7" }}>
            {localStats?.open_count ?? 0}
          </span>
        </span> */}
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">SPAM</span>
          <span className="slp-stat-value slp-red">
            {Math.max(0, localStats?.spam_count ?? 0)}
          </span>
        </span>
        {/* <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">PROMO</span>
          <span className="slp-stat-value slp-orange">
            {localStats?.promo_count ?? 0}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">SOCIAL</span>
          <span className="slp-stat-value slp-blue">
            {localStats?.social_count ?? 0}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">UPDATES</span>
          <span className="slp-stat-value slp-purple">
            {localStats?.updates_count ?? 0}
          </span>
        </span> */}
        {total > 0 && (
          <>
            <span className="slp-stat-sep">|</span>
            <span className="slp-stat">
              <span className="slp-stat-label">PROGRESS</span>
              <span className="slp-stat-value">
                {Math.min(100, ((sent + errors) / total) * 100).toFixed(1)}%
              </span>
            </span>
          </>
        )}
      </div>

      {/* Terminal Window */}
      <div className="slp-terminal">
        {liveLogs.length === 0 && logsFetching && (
          <div className="slp-loading">Connecting to campaign logs...</div>
        )}
        {liveLogs.length === 0 && !logsFetching && (
          <div className="slp-loading">No logs yet for this campaign.</div>
        )}

        {groupedRuns.map(
          (run: { title: string; logs: any[] }, runIndex: number) => (
            <div key={`run-${runIndex}`} className="slp-run-group">
              {groupedRuns.length > 1 && (
                <div className="slp-run-divider">
                  <span className="slp-run-divider-line"></span>
                  <span className="slp-run-divider-text">{run.title}</span>
                  <span className="slp-run-divider-line"></span>
                </div>
              )}

              {run.logs.map((log: any, i: number) => (
                <div
                  key={log._id || i}
                  className={`slp-log-line ${lineClass(log.type)}`}
                >
                  <span className="slp-timestamp">
                    [{new Date(log.created_at).toLocaleTimeString()}]
                  </span>{" "}
                  {formatLogLine(log)}
                </div>
              ))}
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ScreenLogPage;
