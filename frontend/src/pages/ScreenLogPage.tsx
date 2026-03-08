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

  // Robustly sort logs DESC (newest first based on last activity)
  const sortLogsDesc = (logs: any[]) => {
    return [...logs].sort((a, b) => {
      const getVal = (val: any) => {
        const d = new Date(
          val.updatedAt ||
            val.updated_at ||
            val.createdAt ||
            val.created_at ||
            0,
        ).getTime();
        return isNaN(d) ? 0 : d;
      };
      return getVal(b) - getVal(a);
    });
  };

  // Initialize liveLogs immediately when initialLogs load
  useEffect(() => {
    if (initialLogs.length > 0) {
      setLiveLogs(sortLogsDesc(initialLogs));
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
      console.log("✅ Connected to Real-time Logs", socketRef.current?.id);
      socketRef.current?.emit("join_campaign", id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
    });

    socketRef.current.on(
      "campaign_log",
      (data: { log: any; campaign: any }) => {
        console.log("📩 Received Real-time Log:", data);
        const newLog = data.log;
        if (!newLog) return;

        setLiveLogs((prev) => {
          // Check if log already exists (IMAP scanner might have updated it)
          const existingIndex = prev.findIndex((l) => l._id === newLog._id);

          let next = [...prev];
          if (existingIndex !== -1) {
            next[existingIndex] = newLog;
          } else {
            next = [newLog, ...next];
          }

          // Sort DESC and keep only last 1000
          const sorted = sortLogsDesc(next);
          return sorted.slice(0, 1000);
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

  const sent = localStats?.success_count ?? 0;
  const errors = localStats?.error_count ?? 0;
  const total = localStats?.total_emails ?? 0;
  const status = localStats?.status ?? "—";

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
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">OPENS</span>
          <span className="slp-stat-value" style={{ color: "#a855f7" }}>
            {localStats?.open_count ?? 0}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">SPAM</span>
          <span className="slp-stat-value slp-red">
            {Math.max(0, localStats?.spam_count ?? 0)}
          </span>
        </span>
        <span className="slp-stat-sep">|</span>
        <span className="slp-stat">
          <span className="slp-stat-label">PROMO</span>
          <span className="slp-stat-value slp-orange">
            {localStats?.promo_count ?? 0}
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
