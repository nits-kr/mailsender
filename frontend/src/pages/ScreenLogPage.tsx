import React, { useEffect, useRef, useState } from "react";
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
    if (initialLogs.length > 0 && liveLogs.length === 0) {
      setLiveLogs(initialLogs);
    }
  }, [initialLogs]);

  const { data: stats } = useGetCampaignStatsQuery(id!, {
    skip: !id,
    pollingInterval: polling ? 1000 : 0,
  });

  const [stopScreen] = useStopScreenMutation();
  const [clearLogs, { isLoading: isClearing }] = useClearCampaignLogsMutation();

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLogs]);

  // Stop polling stats when campaign is done
  useEffect(() => {
    if (stats?.status === "Completed" || stats?.status === "Stopped") {
      setPolling(false);
    }
  }, [stats]);

  // Socket.io Connection Hook
  useEffect(() => {
    if (!id) return;

    socketRef.current = io(API_BASE_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to Real-time Logs");
      socketRef.current?.emit("join_campaign", id);
    });

    socketRef.current.on("new_log", (newLog) => {
      setLiveLogs((prev) => {
        // Check if log already exists to prevent duplicates (and allow updates like success -> inbox)
        const existingIdx = prev.findIndex((log) => log._id === newLog._id);
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = newLog;
          return next;
        }

        // Prepend new log and strictly cap at 1000 items to prevent browser memory crash
        const next = [newLog, ...prev];
        if (next.length > 1000) return next.slice(0, 1000);
        return next;
      });
    });

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
    // The backend already completely formats the log string with accurate aggregate mathematics.
    // If it exists, use it directly.
    if (log.log_text) return log.log_text;

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

    return (
      `Total Mail Sent : ${sentTotal} || ` +
      `Total Mail Received : ${received} || ` +
      `INBOX : ${inbox} || ` +
      `SPAM : ${spam} || ` +
      `MAIL STATUS : ${status} || ` +
      `Inbox Percentage : ${inboxPct}%`
    );
  };

  const lineClass = (type: string) => {
    if (type === "success") return "log-line-success";
    if (type === "error") return "log-line-error";
    return "log-line-info";
  };

  const sent = stats?.success_count ?? 0;
  const errors = stats?.error_count ?? 0;
  const total = stats?.total_emails ?? 0;
  const status = stats?.status ?? "—";

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
        <h2 className="slp-title">{stats?.template_name ?? id}</h2>
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
            {stats?.inbox_count ?? 0}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">OPENS</span>
          <span className="slp-stat-value" style={{ color: "#a855f7" }}>
            {stats?.open_count ?? 0}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">SPAM</span>
          <span className="slp-stat-value slp-red">
            {Math.max(0, stats?.spam_count ?? 0)}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">PROMO</span>
          <span className="slp-stat-value slp-orange">
            {stats?.promo_count ?? 0}
          </span>
        </span>
        {total > 0 && (
          <>
            <span className="slp-stat-sep">|</span>
            <span className="slp-stat">
              <span className="slp-stat-label">PROGRESS</span>
              <span className="slp-stat-value">
                {(((sent + errors) / total) * 100).toFixed(1)}%
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
        {liveLogs.map((log: any, i: number) => (
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ScreenLogPage;
