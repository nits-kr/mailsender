import React, { useState, useEffect, useCallback } from "react";
import { Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Interface.css";
import RichTextEditor from "../components/RichTextEditor";
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useSendEmailMutation,
  useGetCampaignLogsQuery,
  useLazyGetFileInfoQuery,
  useLazyValidateOfferQuery,
  useLazyGetCampaignStatusQuery,
} from "../store/apiSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const interfaceSchema = z.object({
  accs: z.string().min(1, "IPs/Accounts are required"),
  headers: z.string().optional().nullable(),
  from_email: z
    .string()
    .email("Invalid from email")
    .min(1, "From email is required"),
  subject: z.string().min(1, "Subject is required"),
  subject_enc: z.string().optional().nullable(),
  from_name: z.string().min(1, "From name is required"),
  from_enc: z.string().optional().nullable(),
  emails: z.string().min(1, "Test emails are required"),
  msg_type: z.string().optional().nullable(),
  data_file: z.string().min(1, "Data file is required"),
  total_send: z.string().min(1, "Total send is required"),
  limit_to_send: z.string().min(1, "Limit to send is required"),
  sleep_time: z.string().min(1, "Sleep time is required"),
  offer_id: z.string().min(1, "Offer ID is required"),
  template_name: z.string().min(1, "Template name is required"),
  domain: z.string().min(1, "Domain is required"),
  wait_time: z.string().min(1, "Wait time is required"),
  message_id: z.string().optional().nullable(),
  inbox_percent: z
    .string()
    .regex(/^[0-9]*$/, "Must be a number")
    .min(1, "Inbox percent is required"),
  mail_after: z.string().min(1, "Mail after is required"),
  reply_to: z.string().optional().nullable(),
  xmailer: z.string().optional().nullable(),
  interval_time: z.string().optional().nullable(),
  charset: z.string().optional().nullable(),
  encoding: z.string().optional().nullable(),
  message_html: z.string().min(1, "HTML message is required"),
  charset_alt: z.string().optional().nullable(),
  encoding_alt: z.string().optional().nullable(),
  message_plain: z.string().optional().nullable(),
  search_replace: z.string().optional().nullable(),
  mode: z.string().optional().nullable(),
  sen_t: z.string().optional().nullable(),
});

type InterfaceFormData = z.infer<typeof interfaceSchema>;

const Interface = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InterfaceFormData>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: {
      accs: "",
      headers: "",
      from_email: "",
      subject: "",
      subject_enc: "reset",
      from_name: "",
      from_enc: "reset",
      emails: "",
      msg_type: "html",
      data_file: "",
      total_send: "",
      limit_to_send: "",
      sleep_time: "",
      offer_id: "",
      template_name: "",
      domain: "",
      wait_time: "2",
      message_id: "",
      inbox_percent: "",
      mail_after: "",
      reply_to: "0",
      xmailer: "0",
      interval_time: "",
      charset: "UTF-8",
      encoding: "8bit",
      message_html: "",
      charset_alt: "UTF-8",
      encoding_alt: "8bit",
      message_plain: "",
      search_replace: "",
      mode: "test",
      sen_t: "manual",
    },
  });

  const formData = watch();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [pollLogs, setPollLogs] = useState(false);
  const [status, setStatus] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [dataFileCount, setDataFileCount] = useState<number | null>(null);
  const [offerValid, setOfferValid] = useState<boolean | null>(null);
  const [postSendGuidance, setPostSendGuidance] = useState<string>("");
  const [campaignStatus, setCampaignStatus] = useState<string>("0");
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [sendError, setSendError] = useState<string>("");

  const [triggerGetFileInfo, { isFetching: isFetchingFileInfo }] =
    useLazyGetFileInfoQuery();

  const [triggerValidateOffer, { isFetching: isValidatingOffer }] =
    useLazyValidateOfferQuery();

  const [triggerGetCampaignStatus] = useLazyGetCampaignStatusQuery();

  // Polling for logs when a campaign is active
  const { data: campaignLogs = [] } = useGetCampaignLogsQuery(
    activeCampaignId || "",
    {
      skip: !activeCampaignId,
      pollingInterval: pollLogs ? 2000 : 0,
    },
  );

  useEffect(() => {
    if (!pollLogs) return;
    const timer = window.setTimeout(() => setPollLogs(false), 60000);
    return () => window.clearTimeout(timer);
  }, [pollLogs]);

  // Auto-stop polling when campaign finishes (success OR error log appears)
  useEffect(() => {
    if (!pollLogs || campaignLogs.length === 0) return;
    const isDone = campaignLogs.some((log: any) => {
      const typeDone = log.type === "success" || log.type === "error";
      const textDone =
        log.log_text?.includes("SENT SUCCESS") ||
        log.log_text?.includes("ERROR");
      return typeDone || textDone;
    });
    if (isDone) setPollLogs(false);
  }, [campaignLogs, pollLogs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.querySelector(".legacy-search-container");
      if (container && !container.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all campaigns for the search dropdown
  const { data: campaigns = [] } = useGetCampaignsQuery();

  const filteredCampaigns = campaigns.filter((c: any) =>
    (c.tempname || c.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // Fetch campaign details when manually triggered by "Load"
  // We don't want it to auto-sync always, so we use a flag or manual trigger logic
  const { data: campaignDetail, isFetching: loadingCampaign } =
    useGetCampaignByIdQuery(selectedCampaignId, {
      skip: !selectedCampaignId,
    });

  const handleLoadCampaign = () => {
    if (!campaignDetail) {
      if (!selectedCampaignId) alert("Please select a campaign first");
      return;
    }

    // Map campaign fields to our detailed form state with 100% parity using reset
    reset({
      ...formData,
      accs: campaignDetail.accs || formData.accs,
      headers: campaignDetail.headers || "",
      from_email: campaignDetail.from_email || "",
      subject: campaignDetail.subject || "",
      from_name: campaignDetail.from_name || "",
      emails: campaignDetail.emails || "",
      msg_type: campaignDetail.msg_type || "html",
      message_html: campaignDetail.message_html || "",
      message_plain: campaignDetail.message_plain || "",
      search_replace: campaignDetail.search_replace || "",
      data_file: campaignDetail.data_file || "",
      total_send: String(campaignDetail.total_send || ""),
      limit_to_send: campaignDetail.limit_to_send || "",
      sleep_time: campaignDetail.sleep_time || "",
      offer_id: campaignDetail.offer_id || "",
      template_name: campaignDetail.template_name || "",
      domain: campaignDetail.domain || "",
      wait_time: campaignDetail.wait_time || "2",
      message_id: campaignDetail.message_id || "",
      inbox_percent: campaignDetail.inbox_percent || "",
      mail_after: campaignDetail.mail_after || "",
      reply_to: campaignDetail.reply_to || "0",
      xmailer: campaignDetail.xmailer || "0",
      interval_time: campaignDetail.interval_time || "",
      charset: campaignDetail.charset || "UTF-8",
      encoding: campaignDetail.encoding || "8bit",
      charset_alt: campaignDetail.charset_alt || "UTF-8",
      encoding_alt: campaignDetail.encoding_alt || "8bit",
      mode: campaignDetail.mode || "test",
      sen_t: campaignDetail.sen_t || "manual",
    });

    setCampaignStatus(campaignDetail.status || "0");

    // Start tracking logs for this campaign
    setActiveCampaignId(selectedCampaignId);
    setPollLogs(false);

    // Auto fetch file count if data_file is present
    if (campaignDetail.data_file) {
      handleFetchFileInfo(campaignDetail.data_file);
    }
  };

  const handleFetchFileInfo = useCallback(
    async (filename: string) => {
      if (!filename) {
        setDataFileCount(null);
        return;
      }
      try {
        const res = await triggerGetFileInfo(filename).unwrap();
        if (res.found) {
          setDataFileCount(res.count);
        } else {
          setDataFileCount(0);
        }
      } catch {
        setDataFileCount(0);
      }
    },
    [triggerGetFileInfo],
  );

  const handleValidateOffer = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        const res = await triggerValidateOffer(id).unwrap();
        setOfferValid(res.valid);
      } catch {
        setOfferValid(false);
      }
    },
    [triggerValidateOffer],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.data_file) {
        handleFetchFileInfo(formData.data_file);
      } else {
        setDataFileCount(null);
      }
    }, 400); // Faster response
    return () => clearTimeout(timer);
  }, [formData.data_file, handleFetchFileInfo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.offer_id) {
        handleValidateOffer(formData.offer_id);
      } else {
        setOfferValid(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.offer_id, handleValidateOffer]);

  const [sendEmailMutation] = useSendEmailMutation();

  // Poll live campaign status every 3s when a campaign is running
  useEffect(() => {
    if (!activeCampaignId) return;
    const interval = setInterval(async () => {
      try {
        const result =
          await triggerGetCampaignStatus(activeCampaignId).unwrap();
        setLiveStatus(result);
        if (result.status === "Completed" || result.status === "Stopped") {
          clearInterval(interval);
          setPollLogs(false);
        }
      } catch {
        // silent fail
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeCampaignId]);

  const onSend = async (data: any) => {
    setSending(true);
    setSendError("");
    try {
      const payload = {
        ...data,
        mailing_ip: data.accs,
      };

      const result = await sendEmailMutation(payload).unwrap();
      setActiveCampaignId(result.campaign_id);
      setLiveStatus(null);
      setPollLogs(true);
      setPostSendGuidance(result.guidance || "");
      setStatus("Last sent: " + new Date().toLocaleTimeString());
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.error ||
        "Send failed. Check all required fields and try again.";
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    const win = window.open(
      "",
      "popup",
      "toolbar=no,status=no,scrollbars=yes,width=800,height=600",
    );
    if (win) {
      win.document.write(formData.message_html);
      win.document.close();
    }
  };

  const handleEditor = () => {
    setShowEditor(true);
  };

  return (
    <div className="interface-page">
      {/* Search and Navigation Bar */}
      <div className="interface-top-navbar">
        <div className="search-load-box">
          <div className="legacy-search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Campaign Search..."
              autoComplete="off"
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showDropdown && filteredCampaigns.length > 0 && (
              <div className="dropdown-content show">
                {filteredCampaigns.map((c: any) => (
                  <div
                    key={c.id || c.sno || c._id}
                    className="dropdown-item"
                    onClick={() => {
                      setSearchQuery(c.tempname || c.name);
                      setSelectedCampaignId(c.id || c.sno || c._id);
                      setShowDropdown(false);
                    }}
                  >
                    {c.tempname || c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="load-btn"
            disabled={loadingCampaign}
            onClick={handleLoadCampaign}
          >
            {loadingCampaign ? "Loading..." : "Load"}
          </button>
          {selectedCampaignId && (
            <div
              className={`status-badge status-${campaignStatus}`}
              style={{
                marginLeft: "15px",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "white",
                backgroundColor:
                  campaignStatus === "1"
                    ? "#10b981"
                    : campaignStatus === "2"
                      ? "#ef4444"
                      : "#f59e0b",
              }}
            >
              {campaignStatus === "1"
                ? "APPROVED"
                : campaignStatus === "2"
                  ? "REJECTED"
                  : "PENDING"}
            </div>
          )}
        </div>
        <div className="nav-right-btns">
          <button
            className="guide-btn"
            onClick={() => navigate("/interface/guide")}
          >
            Guide
          </button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Main Interface Form */}
      <div className="legacy-form-container">
        {/* Left Sidebar (Curvy) */}
        <div className="sidebar-left">
          <h3>ADMIN</h3>
          <textarea
            className={`ips-textarea ${errors.accs ? "invalid-input" : ""}`}
            placeholder="Put IP's Here (IP|From-Email)"
            {...register("accs")}
          />
          {errors.accs && (
            <span className="error-text">{String(errors.accs.message)}</span>
          )}
        </div>

        {/* Column 2: Main Form Content */}
        <div className="content-middle">
          <div className="main-form-content">
            <div className="legacy-form-group">
              <textarea
                className={`legacy-textarea ${errors.headers ? "invalid-input" : ""}`}
                rows={4}
                placeholder="Additional Header"
                {...register("headers")}
              />
            </div>

            <div className="legacy-form-group compact-form-group">
              <input
                className={`legacy-input ${errors.from_email ? "invalid-input" : ""}`}
                placeholder="From Email Address"
                {...register("from_email")}
              />
              {errors.from_email && (
                <span className="error-text">
                  {String(errors.from_email.message)}
                </span>
              )}
            </div>

            <div className="legacy-form-group">
              <input
                className={`legacy-input ${errors.subject ? "invalid-input" : ""}`}
                placeholder="Subject"
                {...register("subject")}
              />
              {errors.subject && (
                <span className="error-text">
                  {String(errors.subject.message)}
                </span>
              )}
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    value="ascii"
                    {...register("subject_enc")}
                  />{" "}
                  UTF8-Q
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    value="base64"
                    {...register("subject_enc")}
                  />{" "}
                  UTF8-B
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    value="reset"
                    {...register("subject_enc")}
                  />{" "}
                  RESET
                </label>
              </div>
            </div>

            <div className="legacy-form-group">
              <input
                className={`legacy-input ${errors.from_name ? "invalid-input" : ""}`}
                placeholder="From Name"
                {...register("from_name")}
              />
              {errors.from_name && (
                <span className="error-text">
                  {String(errors.from_name.message)}
                </span>
              )}
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" value="ascii" {...register("from_enc")} />{" "}
                  UTF8-Q
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    value="base64"
                    {...register("from_enc")}
                  />{" "}
                  UTF8-B
                </label>
                <label className="radio-item">
                  <input type="radio" value="reset" {...register("from_enc")} />{" "}
                  RESET
                </label>
              </div>
            </div>

            <div className="legacy-form-group">
              <textarea
                className={`legacy-textarea ${errors.emails ? "invalid-input" : ""}`}
                rows={4}
                placeholder="demo@demo.com"
                {...register("emails")}
              />
              {errors.emails && (
                <span className="error-text">
                  {String(errors.emails.message)}
                </span>
              )}
              <div
                className="radio-group"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "15px" }}>
                  <label className="radio-item">
                    <input
                      type="radio"
                      value="html"
                      {...register("msg_type")}
                    />{" "}
                    HTML
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      value="plain"
                      {...register("msg_type")}
                      defaultChecked
                    />{" "}
                    PLAIN
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      value="mime"
                      {...register("msg_type")}
                    />{" "}
                    MIME
                  </label>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="preview-btn"
                    onClick={handlePreview}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="editor-btn"
                    onClick={handleEditor}
                  >
                    EDITOR
                  </button>
                </div>
              </div>
            </div>

            <div className="select-row">
              <select
                className={`legacy-select ${errors.charset ? "invalid-input" : ""}`}
                {...register("charset")}
              >
                <option value="UTF-8">UTF-8</option>
                <option value="us-ascii">US-ASCII</option>
                <option value="iso-8859-1">ISO-8859-1</option>
                <option value="windows-1251">WINDOWS-1251</option>
              </select>
              <span>;</span>
              <select
                className={`legacy-select ${errors.encoding ? "invalid-input" : ""}`}
                {...register("encoding")}
              >
                <option value="8bit">8bit</option>
                <option value="binary">binary</option>
                <option value="quoted-printable">quoted-printable</option>
                <option value="7bit">7bit</option>
                <option value="base64">base64</option>
              </select>
            </div>

            <div className="legacy-form-group">
              <textarea
                className={`legacy-textarea ${errors.message_html ? "invalid-input" : ""}`}
                rows={10}
                placeholder="Message"
                {...register("message_html")}
              />
              {errors.message_html && (
                <span className="error-text">
                  {String(errors.message_html.message)}
                </span>
              )}
            </div>

            <div className="select-row">
              <select
                className={`legacy-select ${errors.charset_alt ? "invalid-input" : ""}`}
                {...register("charset_alt")}
              >
                <option value="UTF-8">UTF-8</option>
                <option value="us-ascii">US-ASCII</option>
                <option value="iso-8859-1">ISO-8859-1</option>
                <option value="windows-1251">WINDOWS-1251</option>
              </select>
              <span>;</span>
              <select
                className={`legacy-select ${errors.encoding_alt ? "invalid-input" : ""}`}
                {...register("encoding_alt")}
              >
                <option value="8bit">8bit</option>
                <option value="binary">binary</option>
                <option value="quoted-printable">quoted-printable</option>
                <option value="7bit">7bit</option>
                <option value="base64">base64</option>
              </select>
            </div>

            <div className="legacy-form-group">
              <textarea
                className={`legacy-textarea ${errors.message_plain ? "invalid-input" : ""}`}
                rows={4}
                placeholder="MIME Message"
                {...register("message_plain")}
              />
            </div>

            <div className="legacy-form-group">
              <textarea
                className={`legacy-textarea ${errors.search_replace ? "invalid-input" : ""}`}
                rows={4}
                placeholder="Search@|replace"
                {...register("search_replace")}
              />
            </div>

            <div className="send-container">
              <button
                type="button"
                className="send-btn"
                onClick={handleSubmit(onSend)}
                disabled={sending}
              >
                {sending ? "SENDING..." : "SEND"}
              </button>
              {/* Mode badge */}
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    formData.sen_t === "auto" ? "#6366f1" : "#0ea5e9",
                  color: "white",
                  textTransform: "uppercase",
                }}
              >
                {formData.mode} + {formData.sen_t}
              </span>
              {status && (
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backgroundColor: "#0ea5e9",
                    color: "white",
                  }}
                >
                  {status}
                </span>
              )}
            </div>

            {/* ── Error Banner (replaces alert popup) ─────────────────── */}
            {sendError && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px 16px",
                  backgroundColor: "#1e0a0a",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span
                  style={{ color: "#ef4444", fontSize: "16px", flexShrink: 0 }}
                >
                  ✖
                </span>
                <div>
                  <div
                    style={{
                      color: "#ef4444",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    Send Failed
                  </div>
                  <div
                    style={{
                      color: "#fca5a5",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {sendError}
                  </div>
                </div>
                <button
                  onClick={() => setSendError("")}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* ── Mode-Aware Live Status Panel ─────────────────────────── */}
            {activeCampaignId && liveStatus && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "11px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    CAMPAIGN LIVE STATUS
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        liveStatus.status === "Running"
                          ? "#16a34a"
                          : liveStatus.status === "Completed"
                            ? "#0ea5e9"
                            : "#ef4444",
                      color: "white",
                    }}
                  >
                    {liveStatus.status}
                  </span>
                </div>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {[
                    {
                      label: "Sent",
                      value: liveStatus.success_count || 0,
                      color: "#10b981",
                    },
                    {
                      label: "Errors",
                      value: liveStatus.error_count || 0,
                      color: "#ef4444",
                    },
                    {
                      label: "Total",
                      value: liveStatus.total_emails || 0,
                      color: "#94a3b8",
                    },
                    ...(liveStatus.type === "test_auto" ||
                    liveStatus.type === "bulk_auto"
                      ? [
                          {
                            label: "Inbox",
                            value: liveStatus.inbox_count || 0,
                            color: "#10b981",
                          },
                          {
                            label: "Spam",
                            value: liveStatus.spam_count || 0,
                            color: "#f97316",
                          },
                          {
                            label: "Bounce",
                            value: liveStatus.bounce_count || 0,
                            color: "#ef4444",
                          },
                        ]
                      : []),
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "6px",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          color: stat.color,
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mode-specific hints */}
                {liveStatus.type === "test_manual" && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    📋 <strong>Test + Manual</strong>: Check your inbox manually
                    for placement results.
                  </div>
                )}
                {liveStatus.type === "test_auto" && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    🤖 <strong>Test + Auto</strong>: IMAP scanner will check
                    inbox placement in ~5 min. View results on Intelligence
                    Dashboard.
                  </div>
                )}
                {liveStatus.type === "bulk_manual" && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    📤 <strong>Bulk + Manual</strong>:{" "}
                    {liveStatus.total_queued || 0} of {liveStatus.total_emails}{" "}
                    queued. Click SEND again to dispatch next batch.
                  </div>
                )}
                {liveStatus.type === "bulk_auto" && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    ⚡ <strong>Bulk + Auto</strong>: AutoRunner is sending in
                    batches. {liveStatus.total_queued || 0} of{" "}
                    {liveStatus.total_emails} queued. Dashboard updates every
                    3s.
                  </div>
                )}
              </div>
            )}

            {campaignLogs.length > 0 && (
              <div
                className="console-section"
                style={{ marginTop: "30px", width: "100%" }}
              >
                <div className="section-header-legacy">
                  CONSOLE LOGS (REAL-TIME)
                </div>
                <div className="console-window">
                  {campaignLogs.map((log: any, idx: number) => (
                    <div
                      key={log._id || idx}
                      className={`console-line ${log.type}`}
                    >
                      <span className="timestamp">
                        [{new Date(log.created_at).toLocaleTimeString()}]
                      </span>
                      <pre className="log-text">{log.log_text}</pre>
                    </div>
                  ))}
                </div>
                {postSendGuidance && (
                  <div
                    className="guidance-box"
                    style={{
                      marginTop: "15px",
                      padding: "15px",
                      backgroundColor: "#1e293b",
                      borderRadius: "6px",
                      border: "1px solid #ef4444",
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        color: "#ef4444",
                        whiteSpace: "pre-wrap",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {postSendGuidance}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Settings Sidebar Right */}
        <div className="sidebar-settings-right">
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn blue-toggle ${formData.mode === "test" ? "active" : ""}`}
              onClick={() => setValue("mode", "test")}
            >
              Test
            </button>
            <button
              type="button"
              className={`toggle-btn blue-toggle ${formData.mode === "bulk" ? "active" : ""}`}
              onClick={() => setValue("mode", "bulk")}
            >
              Bulk
            </button>
          </div>

          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${formData.sen_t === "manual" ? "active" : ""}`}
              onClick={() => setValue("sen_t", "manual")}
            >
              Manual
            </button>
            <button
              type="button"
              className={`toggle-btn blue-toggle ${formData.sen_t === "auto" ? "active" : ""}`}
              onClick={() => setValue("sen_t", "auto")}
            >
              Auto
            </button>
          </div>

          {/* Settings Section */}
          <details className="legacy-details" open>
            <summary className="menu-btn">▼ Settings</summary>
            <div className="settings-grid">
              <div className="settings-row">
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    className={errors.data_file ? "invalid-input" : ""}
                    placeholder="Data File"
                    title="Data File"
                    {...register("data_file")}
                    style={{
                      width: "100%",
                      paddingRight:
                        dataFileCount !== null || isFetchingFileInfo
                          ? "60px"
                          : "8px",
                    }}
                  />
                  {errors.data_file && (
                    <span className="error-text small">
                      {String(errors.data_file.message)}
                    </span>
                  )}
                  {isFetchingFileInfo ? (
                    <span
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Loader2
                        className="animate-spin"
                        size={14}
                        color="#3b82f6"
                      />
                    </span>
                  ) : (
                    dataFileCount !== null && (
                      <span
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: dataFileCount > 0 ? "#10b981" : "#ef4444",
                          pointerEvents: dataFileCount === 0 ? "auto" : "none",
                          cursor: dataFileCount === 0 ? "pointer" : "default",
                        }}
                        onClick={() => {
                          if (dataFileCount === 0) {
                            setValue("data_file", "");
                            setDataFileCount(null);
                          }
                        }}
                      >
                        {dataFileCount > 0 ? (
                          dataFileCount.toLocaleString()
                        ) : (
                          <X size={14} />
                        )}
                      </span>
                    )
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.total_send ? "invalid-input" : ""}
                    placeholder="Total Send"
                    title="Total Send"
                    {...register("total_send")}
                  />
                  {errors.total_send && (
                    <span className="error-text small">
                      {String(errors.total_send.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.limit_to_send ? "invalid-input" : ""}
                    placeholder="Limit_to_Send"
                    title="Limit_to_Send"
                    {...register("limit_to_send")}
                  />
                  {errors.limit_to_send && (
                    <span className="error-text small">
                      {String(errors.limit_to_send.message)}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.sleep_time ? "invalid-input" : ""}
                    placeholder="Sleep Time"
                    title="Sleep Time"
                    {...register("sleep_time")}
                  />
                  {errors.sleep_time && (
                    <span className="error-text small">
                      {String(errors.sleep_time.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    className={errors.offer_id ? "invalid-input" : ""}
                    placeholder="Offer ID"
                    title="Offer ID"
                    {...register("offer_id")}
                    style={{
                      width: "100%",
                      paddingRight:
                        isValidatingOffer || offerValid !== null
                          ? "30px"
                          : "8px",
                    }}
                  />
                  {errors.offer_id && (
                    <span className="error-text small">
                      {String(errors.offer_id.message)}
                    </span>
                  )}
                  {isValidatingOffer ? (
                    <span
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <Loader2
                        className="animate-spin"
                        size={12}
                        color="#3b82f6"
                      />
                    </span>
                  ) : (
                    offerValid !== null && (
                      <span
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "12px",
                          color: offerValid ? "#10b981" : "#ef4444",
                          cursor: offerValid === false ? "pointer" : "default",
                          pointerEvents: offerValid === false ? "auto" : "none",
                        }}
                        onClick={() => {
                          if (offerValid === false) {
                            setValue("offer_id", "");
                            setOfferValid(null);
                          }
                        }}
                      >
                        {offerValid ? "✓" : <X size={12} />}
                      </span>
                    )
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.template_name ? "invalid-input" : ""}
                    placeholder="Template Name"
                    title="Template Name"
                    {...register("template_name")}
                  />
                  {errors.template_name && (
                    <span className="error-text small">
                      {String(errors.template_name.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.domain ? "invalid-input" : ""}
                    placeholder="Domain"
                    title="Domain"
                    {...register("domain")}
                  />
                  {errors.domain && (
                    <span className="error-text small">
                      {String(errors.domain.message)}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <select
                    className={errors.wait_time ? "invalid-input" : ""}
                    title="Wait Time"
                    {...register("wait_time")}
                  >
                    <option value="2">Wait Time</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  {errors.wait_time && (
                    <span className="error-text small">
                      {String(errors.wait_time.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.message_id ? "invalid-input" : ""}
                    placeholder="Message ID"
                    title="Message ID"
                    {...register("message_id")}
                  />
                  {errors.message_id && (
                    <span className="error-text small">
                      {String(errors.message_id.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.inbox_percent ? "invalid-input" : ""}
                    placeholder="Inbox Percent"
                    title="Inbox Percent"
                    {...register("inbox_percent")}
                  />
                  {errors.inbox_percent && (
                    <span className="error-text small">
                      {String(errors.inbox_percent.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <input
                    className={errors.mail_after ? "invalid-input" : ""}
                    placeholder="Inbox test after"
                    title="Inbox test after"
                    {...register("mail_after")}
                  />
                  {errors.mail_after && (
                    <span className="error-text small">
                      {String(errors.mail_after.message)}
                    </span>
                  )}
                </div>
              </div>
              <div className="settings-row">
                <div style={{ flex: 1 }}>
                  <select
                    className={errors.reply_to ? "invalid-input" : ""}
                    title="Reply to"
                    {...register("reply_to")}
                  >
                    <option value="0">Reply to</option>
                    <option value="1">YES</option>
                    <option value="0">NO</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <select
                    className={errors.xmailer ? "invalid-input" : ""}
                    title="XMAILER"
                    {...register("xmailer")}
                  >
                    <option value="0">XMAILER</option>
                    <option value="1">YES</option>
                    <option value="0">NO</option>
                  </select>
                </div>
              </div>
            </div>
          </details>

          {/* Space Sending Section */}
          <details className="legacy-details" open>
            <summary className="menu-btn">▼ Space Sending</summary>
            <div className="space-sending-box">
              <div className="interval-control">
                <input
                  className={errors.interval_time ? "invalid-input" : ""}
                  placeholder="Interval"
                  title="Interval Time"
                  type="number"
                  {...register("interval_time")}
                />
                <button className="start-btn">Start</button>
                <button className="stop-btn">Stop</button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {showEditor && (
        <RichTextEditor
          value={watch("message_html")}
          onChange={(content) =>
            setValue("message_html", content, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default Interface;
