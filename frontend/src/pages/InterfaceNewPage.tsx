import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import "./InterfaceNewPage.css";
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetDefaultIpsQuery,
  useSendEmailMutation,
  useGetCampaignLogsQuery,
  useLazyGetFileInfoQuery,
  useGetPatternsQuery,
  useLazyValidateOfferQuery,
  useGetLegacyCampaignQuery,
  useSearchLegacyLinkMutation,
} from "../store/apiSlice";

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
  inb_pattern: z.string().min(1, "Inbox pattern is required"),
  restart_choice: z.string().optional().nullable(),
  script_choice: z.string().optional().nullable(),
  relay_percent: z
    .string()
    .regex(/^[0-9]*$/, "Must be a number")
    .min(1, "Relay percent is required"),
  inbox_percent: z
    .string()
    .regex(/^[0-9]*$/, "Must be a number")
    .min(1, "Inbox percent is required"),
  times_to_send: z.string().min(1, "Times to send is required"),
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

export const InterfaceNewPage = () => {
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
      inb_pattern: "1",
      restart_choice: "YES",
      script_choice: "",
      relay_percent: "100",
      inbox_percent: "",
      times_to_send: "1",
      mail_after: "1",
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

  const [searchParams] = useSearchParams();
  const legacyCampaignId = searchParams.get("c");

  const formData = watch();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [pollLogs, setPollLogs] = useState(false);

  // States for feature parity
  const [dataFileCount, setDataFileCount] = useState<number | null>(null);
  const [offerValid, setOfferValid] = useState<boolean | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // RTK Query Hooks for feature parity
  const [triggerGetFileInfo, { isFetching: isFetchingFileInfo }] =
    useLazyGetFileInfoQuery();
  const [triggerValidateOffer, { isFetching: isValidatingOffer }] =
    useLazyValidateOfferQuery();
  const { data: patterns = [] } = useGetPatternsQuery();
  const { data: legacyCampaign, isSuccess: isLegacySuccess } =
    useGetLegacyCampaignQuery(legacyCampaignId || "", {
      skip: !legacyCampaignId,
    });
  const [searchLegacyLink] = useSearchLegacyLinkMutation();

  const { data: campaignLogs = [] } = useGetCampaignLogsQuery(
    activeCampaignId || "",
    {
      skip: !activeCampaignId,
      pollingInterval: pollLogs ? 2000 : 0,
      refetchOnMountOrArgChange: true,
    },
  );

  // Stop polling after 60s max
  useEffect(() => {
    if (!pollLogs) return;
    const timer = window.setTimeout(() => setPollLogs(false), 60000);
    return () => window.clearTimeout(timer);
  }, [pollLogs]);

  // Auto-stop polling when campaign finishes
  useEffect(() => {
    if (!pollLogs || campaignLogs.length === 0) return;
    const isDone = campaignLogs.some(
      (log: any) => log.type === "success" || log.type === "error",
    );
    if (isDone) setPollLogs(false);
  }, [campaignLogs, pollLogs]);

  const { data: defaultIpsData } = useGetDefaultIpsQuery();

  useEffect(() => {
    if (defaultIpsData?.ips && !formData.accs) {
      setValue("accs", defaultIpsData.ips);
    }
  }, [defaultIpsData, setValue, formData.accs]);

  // Handle Legacy Campaign Loading (?c=ID)
  useEffect(() => {
    if (isLegacySuccess && legacyCampaign) {
      reset({
        ...formData,
        from_email: legacyCampaign.from_email || "",
        headers: legacyCampaign.headers || "",
        subject: legacyCampaign.subject || "",
        from_name: legacyCampaign.from_name || "",
        message_html: legacyCampaign.message_html || "",
        message_plain: legacyCampaign.message_plain || "",
        offer_id: legacyCampaign.offer_id || "",
        domain: legacyCampaign.domain || "",
        mode: legacyCampaign.mode || "test",
        sleep_time: legacyCampaign.sleep_time || "",
        wait_time: legacyCampaign.wait_time || "2",
        inbox_percent: legacyCampaign.inbox_percent || "",
        mail_after: legacyCampaign.mail_after || "",
      });
    }
  }, [isLegacySuccess, legacyCampaign, formData, reset]);

  // Auto-fetch Data File Info
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.data_file) {
        try {
          const res = await triggerGetFileInfo(formData.data_file).unwrap();
          setDataFileCount(res.found ? res.count : 0);
        } catch {
          setDataFileCount(0);
        }
      } else {
        setDataFileCount(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.data_file, triggerGetFileInfo]);

  // Auto-validate Offer ID
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.offer_id) {
        try {
          const res = await triggerValidateOffer(formData.offer_id).unwrap();
          setOfferValid(res.valid);
        } catch {
          setOfferValid(false);
        }
      } else {
        setOfferValid(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.offer_id, triggerValidateOffer]);

  const { data: campaigns = [] } = useGetCampaignsQuery();

  const filteredCampaigns = campaigns.filter((c: any) =>
    (c.tempname || c.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const { data: campaignDetail, isFetching: loadingCampaign } =
    useGetCampaignByIdQuery(selectedCampaignId, {
      skip: !selectedCampaignId,
    });

  const handleLoadCampaign = () => {
    if (!campaignDetail) {
      if (!selectedCampaignId) alert("Please select a campaign first");
      return;
    }

    reset({
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
      inb_pattern: campaignDetail.inb_pattern || "1",
      restart_choice: campaignDetail.restart_choice || "YES",
      script_choice: campaignDetail.script_choice || "",
      relay_percent: campaignDetail.relay_percent || "100",
      inbox_percent: campaignDetail.inbox_percent || "",
      times_to_send: campaignDetail.times_to_send || "1",
      mail_after: campaignDetail.mail_after || "1",
      reply_to: campaignDetail.reply_to || "0",
      xmailer: campaignDetail.xmailer || "0",
      interval_time: campaignDetail.interval_time || "",
      charset: campaignDetail.charset || "UTF-8",
      encoding: campaignDetail.encoding || "8bit",
      charset_alt: campaignDetail.charset_alt || "UTF-8",
      encoding_alt: campaignDetail.encoding_alt || "8bit",
      mode: campaignDetail.mode || "test",
      sen_t: campaignDetail.sen_t || "manual",
      subject_enc: "reset",
      from_enc: "reset",
    });

    setActiveCampaignId(selectedCampaignId);
    setPollLogs(false);
  };

  const [sendEmailMutation] = useSendEmailMutation();

  const onSend = async (data: InterfaceFormData) => {
    setSending(true);
    setStatus("Sending...");
    try {
      const payload = {
        ...data,
        mailing_ip: data.accs,
      };

      const result = await sendEmailMutation(payload).unwrap();
      setActiveCampaignId(result.campaign_id);
      setPollLogs(true);
      setStatus("Sent successfully!");
    } catch (error: any) {
      alert("Error: " + (error?.data?.message || "Send failed"));
      setStatus("Error sending");
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
    window.open("http://173.249.50.153/edit.php", "_blank");
  };

  const handleGetLink = async () => {
    setStatus("Searching for link...");
    try {
      const payload = {
        subject: formData.subject,
        ip: formData.accs.split("\n")[0]?.split("|")[0] || "",
        domain: formData.domain,
        offer: formData.offer_id,
      };
      const response = await searchLegacyLink(payload).unwrap();
      if (response.in_link) {
        setStatus(`Link found: ${response.in_link}`);
        alert(`Link found: ${response.in_link}`);
      } else {
        setStatus("Link not found");
      }
    } catch (error: any) {
      setStatus("Error fetching link");
    }
  };

  const displayStart = () => {
    if (!formData.interval_time) {
      alert("Provide Interval Time");
      return;
    }
    const timeInMicroSec = Number(formData.interval_time) * 1000;
    const id = setInterval(() => {
      handleSubmit(onSend)();
    }, timeInMicroSec);
    setIntervalId(id);
    setStatus("Space sending started...");
  };

  const displayStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setStatus("Space sending stopped");
    }
  };

  return (
    <div className="register-container">
      {/* Top Navbar */}
      <div className="search-bar-new">
        <div className="search-inner">
          <input
            type="text"
            className="search-input-new"
            placeholder="Campaign Search..."
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="load-btn-new"
            onClick={handleLoadCampaign}
            disabled={loadingCampaign}
          >
            {loadingCampaign ? "Loading..." : "Load"}
          </button>

          {showDropdown && filteredCampaigns.length > 0 && (
            <div className="dropdown-new">
              {filteredCampaigns.map((c: any) => (
                <div
                  key={c.id || c.sno}
                  className="dropdown-item-new"
                  onClick={() => {
                    setSearchQuery(c.name);
                    setSelectedCampaignId(c.id);
                    setShowDropdown(false);
                  }}
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-actions-new">
          <button
            className="btn-nav-new guide"
            onClick={() => navigate("/interface/guide")}
          >
            Guide
          </button>
          <button className="btn-nav-new logout">Logout</button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSend)} className="register-main">
        {/* Left Sidebar (Column 1) */}
        <div className="register-left">
          <div
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              width: "100%",
            }}
          >
            <div
              style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}
            >
              Put IP's Here (IP|From-Email)
            </div>
            <textarea
              className={`ips-textarea-new ${errors.accs ? "invalid-input" : ""}`}
              style={{ height: "200px", margin: 0 }}
              placeholder=""
              {...register("accs")}
            />
            {errors.accs && (
              <span className="error-message">{errors.accs.message}</span>
            )}
          </div>
        </div>

        {/* Middle Content (Column 2) */}
        <div className="register-middle">
          <div className="main-form-content-new">
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#2b44bc",
                marginBottom: "10px",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              • Headers & Sender Info
            </div>
            <textarea
              className={`input-field-new ${errors.headers ? "invalid-input" : ""}`}
              placeholder="Additional Header"
              rows={3}
              {...register("headers")}
            />
            {errors.headers && (
              <span className="error-message">{errors.headers.message}</span>
            )}

            <input
              className={`input-field-new ${errors.from_email ? "invalid-input" : ""}`}
              placeholder="From Email Address"
              {...register("from_email")}
            />
            {errors.from_email && (
              <span className="error-message">{errors.from_email.message}</span>
            )}

            <div className="field-row-enc-new">
              <input
                className={`input-field-new ${errors.subject ? "invalid-input" : ""}`}
                style={{ marginBottom: "5px" }}
                placeholder="Subject"
                {...register("subject")}
              />
              <div className="enc-radios-new">
                <label>
                  <input
                    type="radio"
                    value="ascii"
                    {...register("subject_enc")}
                  />{" "}
                  UTF8-Q
                </label>
                <label>
                  <input
                    type="radio"
                    value="base64"
                    {...register("subject_enc")}
                  />{" "}
                  UTF8-B
                </label>
                <label>
                  <input
                    type="radio"
                    value="reset"
                    {...register("subject_enc")}
                  />{" "}
                  RESET
                </label>
              </div>
            </div>
            {errors.subject && (
              <span className="error-message">{errors.subject.message}</span>
            )}

            <div className="field-row-enc-new">
              <input
                className={`input-field-new ${errors.from_name ? "invalid-input" : ""}`}
                style={{ marginBottom: "5px" }}
                placeholder="From Name"
                {...register("from_name")}
              />
              <div className="enc-radios-new">
                <label>
                  <input type="radio" value="ascii" {...register("from_enc")} />{" "}
                  UTF8-Q
                </label>
                <label>
                  <input
                    type="radio"
                    value="base64"
                    {...register("from_enc")}
                  />{" "}
                  UTF8-B
                </label>
                <label>
                  <input type="radio" value="reset" {...register("from_enc")} />{" "}
                  RESET
                </label>
              </div>
            </div>
            {errors.from_name && (
              <span className="error-message">{errors.from_name.message}</span>
            )}

            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#2b44bc",
                margin: "15px 0 10px 0",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              • Recipients
            </div>
            <textarea
              className={`input-field-new ${errors.emails ? "invalid-input" : ""}`}
              rows={4}
              placeholder="demo@demo.com"
              {...register("emails")}
            />
            {errors.emails && (
              <span className="error-message">{errors.emails.message}</span>
            )}

            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#2b44bc",
                margin: "15px 0 10px 0",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              • Content & Format
            </div>
            <div className="msg-type-row-new">
              <div className="type-radios-new">
                <label>
                  <input type="radio" value="plain" {...register("msg_type")} />{" "}
                  Plain
                </label>
                <label>
                  <input type="radio" value="html" {...register("msg_type")} />{" "}
                  Html
                </label>
                <label>
                  <input type="radio" value="mime" {...register("msg_type")} />{" "}
                  MIME
                </label>
              </div>
              <div className="action-btns-new">
                <button
                  type="button"
                  className="btn-action-new preview"
                  onClick={handlePreview}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="btn-action-new editor"
                  onClick={handleEditor}
                >
                  EDITOR
                </button>
              </div>
            </div>

            <div className="charset-row-new">
              <select {...register("charset")}>
                <option value="UTF-8">UTF-8</option>
              </select>
              <span> ; </span>
              <select {...register("encoding")}>
                <option value="8bit">8bit</option>
                <option value="base64">base64</option>
              </select>
            </div>

            <textarea
              className={`input-field-new ${errors.message_html ? "invalid-input" : ""}`}
              rows={6}
              placeholder="Message"
              {...register("message_html")}
            />
            {errors.message_html && (
              <span className="error-message">
                {errors.message_html.message}
              </span>
            )}

            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#2b44bc",
                margin: "15px 0 10px 0",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              • Alternative (MIME/Plain)
            </div>
            <div className="charset-row-new">
              <select {...register("charset_alt")}>
                <option value="UTF-8">UTF-8</option>
              </select>
              <span> ; </span>
              <select {...register("encoding_alt")}>
                <option value="8bit">8bit</option>
              </select>
            </div>

            <textarea
              className={`input-field-new ${errors.message_plain ? "invalid-input" : ""}`}
              rows={3}
              placeholder="MIME Messsage"
              {...register("message_plain")}
            />
            {errors.message_plain && (
              <span className="error-message">
                {errors.message_plain.message}
              </span>
            )}

            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#2b44bc",
                margin: "15px 0 10px 0",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              • Search & Replace
            </div>
            <textarea
              className={`input-field-new ${errors.search_replace ? "invalid-input" : ""}`}
              placeholder="Search@|replace"
              {...register("search_replace")}
            />
            {errors.search_replace && (
              <span className="error-message">
                {errors.search_replace.message}
              </span>
            )}

            <div className="send-btn-container-new">
              <button
                type="submit"
                className="main-send-btn-new"
                disabled={sending}
              >
                {sending ? "SENDING..." : "SEND"}
              </button>
            </div>

            {status && <div className="send-status-new">{status}</div>}
          </div>
        </div>

        {/* Settings Sidebar (Column 3) */}
        <div className="register-settings-right">
          <div className="toggle-group-new-con">
            <div className="toggle-group-new">
              <input
                type="radio"
                id="test-mode"
                className="mode-test"
                value="test"
                {...register("mode")}
              />
              <label htmlFor="test-mode">Test</label>
              <input
                type="radio"
                id="bulk-mode"
                className="mode-bulk"
                value="bulk"
                {...register("mode")}
              />
              <label htmlFor="bulk-mode">Bulk</label>
            </div>

            <div
              className="toggle-group-new"
              style={{ marginTop: "10px", display: "none" }}
            >
              <button
                type="button"
                className="btn-get-link-new"
                onClick={handleGetLink}
              >
                Get Track Link
              </button>
            </div>

            <div className="toggle-group-new">
              <input
                type="radio"
                id="manual-sen"
                className="sen-manual"
                value="manual"
                {...register("sen_t")}
              />
              <label htmlFor="manual-sen">Manual</label>
              <input
                type="radio"
                id="auto-sen"
                className="sen-auto"
                value="auto"
                {...register("sen_t")}
              />
              <label htmlFor="auto-sen">Auto</label>
            </div>
          </div>

          <div className="settings-panel-new">
            <details className="legacy-details-new" open>
              <summary className="settings-header-new">▼ Settings</summary>
              <div className="settings-grid-new">
                <div className="settings-row-new">
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      className={errors.data_file ? "invalid-input" : ""}
                      placeholder="Data File"
                      title="Data File"
                      {...register("data_file")}
                      style={{
                        paddingRight:
                          dataFileCount !== null || isFetchingFileInfo
                            ? "45px"
                            : "8px",
                      }}
                    />
                    {isFetchingFileInfo ? (
                      <span className="input-indicator-new">
                        <Loader2 className="animate-spin" size={12} />
                      </span>
                    ) : (
                      dataFileCount !== null && (
                        <div className="input-indicator-new">
                          <span
                            className={`status-badge-new ${dataFileCount > 0 ? "success" : "error"}`}
                          >
                            {dataFileCount > 0 ? (
                              dataFileCount
                            ) : (
                              <X size={10} />
                            )}
                          </span>
                          <button
                            type="button"
                            className="input-clear-btn-new"
                            onClick={() => {
                              setValue("data_file", "");
                              setDataFileCount(null);
                            }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <input
                    className={errors.total_send ? "invalid-input" : ""}
                    placeholder="Total Send"
                    title="Total Send"
                    {...register("total_send")}
                  />
                </div>
                <div className="settings-row-new">
                  <input
                    className={errors.limit_to_send ? "invalid-input" : ""}
                    placeholder="Limit_to_Send"
                    title="Limit_to_Send"
                    {...register("limit_to_send")}
                  />
                  <input
                    className={errors.sleep_time ? "invalid-input" : ""}
                    placeholder="Sleep Time"
                    title="Sleep Time"
                    {...register("sleep_time")}
                  />
                </div>
                <div className="settings-row-new">
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      className={errors.offer_id ? "invalid-input" : ""}
                      placeholder="Offer ID"
                      title="Offer ID"
                      {...register("offer_id")}
                      style={{
                        paddingRight:
                          offerValid !== null || isValidatingOffer
                            ? "30px"
                            : "8px",
                      }}
                    />
                    {isValidatingOffer ? (
                      <span className="input-indicator-new">
                        <Loader2 className="animate-spin" size={12} />
                      </span>
                    ) : (
                      offerValid !== null && (
                        <div className="input-indicator-new">
                          <span
                            className={`status-badge-new ${offerValid ? "success" : "error"}`}
                          >
                            {offerValid ? "✓" : <X size={10} />}
                          </span>
                          <button
                            type="button"
                            className="input-clear-btn-new"
                            onClick={() => {
                              setValue("offer_id", "");
                              setOfferValid(null);
                            }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <input
                    className={errors.template_name ? "invalid-input" : ""}
                    placeholder="Template"
                    title="Template Name"
                    {...register("template_name")}
                  />
                </div>
                <div className="settings-row-new">
                  <input
                    className={errors.domain ? "invalid-input" : ""}
                    placeholder="Domain"
                    title="Domain"
                    {...register("domain")}
                  />
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
                </div>
                <div className="settings-row-new">
                  <input
                    placeholder="Msg ID"
                    title="Message ID"
                    {...register("message_id")}
                  />
                  <select
                    className={errors.inb_pattern ? "invalid-input" : ""}
                    title="Inbox Pattern"
                    {...register("inb_pattern")}
                  >
                    <option value="1">Inbox Pattern</option>
                    {patterns.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="settings-row-new">
                  <select
                    title="Restart_Choice"
                    {...register("restart_choice")}
                  >
                    <option value="YES">Restart_Choice</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                  <input
                    placeholder="Script_Mail_Choice"
                    title="Script_Mail_Choice"
                    {...register("script_choice")}
                  />
                </div>
                <div className="settings-row-new">
                  <input
                    className={errors.relay_percent ? "invalid-input" : ""}
                    placeholder="Relay Percent"
                    title="Relay Percent"
                    {...register("relay_percent")}
                  />
                  <input
                    className={errors.inbox_percent ? "invalid-input" : ""}
                    placeholder="Inbox Percent"
                    title="Inbox Percent"
                    {...register("inbox_percent")}
                  />
                </div>
                <div className="settings-row-new">
                  <input
                    className={errors.times_to_send ? "invalid-input" : ""}
                    placeholder="Times_To_Send"
                    title="Times_To_Send"
                    {...register("times_to_send")}
                  />
                  <input
                    className={errors.mail_after ? "invalid-input" : ""}
                    placeholder="Mail_After_Every"
                    title="Mail_After_Every"
                    {...register("mail_after")}
                  />
                </div>
                <div className="settings-row-new">
                  <select title="Reply to" {...register("reply_to")}>
                    <option value="0">Reply to</option>
                    <option value="1">YES</option>
                    <option value="0">NO</option>
                  </select>
                  <select title="XMAILER" {...register("xmailer")}>
                    <option value="0">XMAILER</option>
                    <option value="1">YES</option>
                    <option value="0">NO</option>
                  </select>
                </div>
              </div>
            </details>

            <details className="legacy-details-new" open>
              <summary className="settings-header-new">▼ Space Sending</summary>
              <div className="space-sending-box-new">
                <div className="interval-control-new">
                  <input
                    type="number"
                    placeholder="Interval Time"
                    title="Interval Time"
                    {...register("interval_time")}
                  />
                  <button
                    type="button"
                    className="btn-start-new"
                    onClick={displayStart}
                    disabled={!!intervalId}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="btn-stop-new"
                    onClick={displayStop}
                    disabled={!intervalId}
                  >
                    Stop
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </form>
    </div>
  );
};

// No default export needed
