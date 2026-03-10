import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Send, Link, Square, Copy, Play } from "lucide-react";
import { io, Socket } from "socket.io-client";
import {
  useCreateFsockAutoCampaignMutation,
  useGetFsockAutoCampaignQuery,
  useStopFsockAutoCampaignMutation,
  useLazyGetFileInfoQuery,
  useLazyValidateOfferQuery,
} from "../store/apiSlice";
import API_BASE_URL from "../config/api";
import "./FsockAutoSend.css";

const fsockSchema = z.object({
  from_email: z.string().email("Invalid email").min(1, "Required"),
  mailing_ip: z.string().min(1, "SMTP details required"),
  headers: z.string().optional(),
  sub: z.string().min(1, "Subject required"),
  sencode: z.string().min(1, "Required"),
  from: z.string().optional(),
  fmencode: z.string().min(1, "Required"),
  emails: z.string().min(1, "Test emails required"),
  mode: z.enum(["Test", "Bulk"]),
  message_html: z.string().min(1, "HTML required"),
  message_plain: z.string().optional(),
  offerId: z.string().optional(),
  domain: z.string().optional(),
  datafile: z.string().optional(),
  msgid: z.string().optional(),
  total_limit: z.string().optional(),
  send_limit: z.string().optional(),
  sleep: z.string().optional().default("2"),
  wait: z.string().optional().default("1"),
  inbox_percentage: z.string().optional().default("100"),
  test_after: z.string().optional().default("100"),
});

type FsockFormData = z.infer<typeof fsockSchema>;

const FsockAutoSend = () => {
  const [searchParams] = useSearchParams();
  const cId = searchParams.get("c");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FsockFormData>({
    resolver: zodResolver(fsockSchema) as any,
    defaultValues: {
      sencode: "reset",
      fmencode: "reset",
      mode: "Bulk",
      mailing_ip:
        "ESP (SMTP)    : (IP|Return@Path)\nNote : You can use all functions in Return Path",
      headers: "",
      message_plain: "",
      msgid: "",
      sleep: "2",
      wait: "1",
      inbox_percentage: "100",
      test_after: "100",
    },
    mode: "onChange",
  });

  const formData = watch();

  // API hooks
  const [createCampaign] = useCreateFsockAutoCampaignMutation();
  const [stopCampaign] = useStopFsockAutoCampaignMutation();
  const { data: campaignData, isSuccess: isCampaignSuccess } =
    useGetFsockAutoCampaignQuery(cId || "", { skip: !cId });

  const [triggerGetFileInfo, { isFetching: isFetchingFileInfo }] =
    useLazyGetFileInfoQuery();
  const [triggerValidateOffer, { isFetching: isValidatingOffer }] =
    useLazyValidateOfferQuery();

  // Local State
  const [isLoading, setIsLoading] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(
    cId || null,
  );
  const [logs, setLogs] = useState<any[]>([]);
  const [campaignStatus, setCampaignStatus] = useState<string>("Pending");

  const [dataFileCount, setDataFileCount] = useState<number | null>(null);
  const [offerValid, setOfferValid] = useState<boolean | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Populate form if campaignId is present in URL
  useEffect(() => {
    if (isCampaignSuccess && campaignData) {
      reset({
        from_email: campaignData.from_email || "",
        headers: campaignData.headers || "",
        sub: campaignData.subject || "",
        from: campaignData.from_name || "",
        message_html: campaignData.message_html || "",
        message_plain: campaignData.message_plain || "",
        mailing_ip: campaignData.mailing_ip_raw || formData.mailing_ip,
        offerId: campaignData.offer_id || "",
        domain: campaignData.domain || "",
        datafile: campaignData.data_file || "",
        msgid: campaignData.msgid || "",
        total_limit: String(campaignData.total_limit || ""),
        send_limit: String(campaignData.send_limit || ""),
        sleep: String(campaignData.sleep_time || ""),
        wait: String(campaignData.wait_time || ""),
        inbox_percentage: String(campaignData.inbox_percentage || ""),
        test_after: String(campaignData.test_after || ""),
        emails: campaignData.test_email_raw || "",
        sencode: campaignData.subject_enc || "reset",
        fmencode: campaignData.from_enc || "reset",
        mode: "Bulk",
      });
      setCampaignStatus(campaignData.status);
    }
  }, [isCampaignSuccess, campaignData, reset]);

  // Socket connection for live logs
  useEffect(() => {
    if (!activeCampaignId) return;

    if (!socketRef.current) {
      try {
        const urlObj = new URL(API_BASE_URL);
        const socketUrl = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port || (urlObj.protocol === "https:" ? "443" : "80")}`;
        socketRef.current = io(socketUrl, { transports: ["websocket"] });
      } catch (e) {
        console.error("Socket URL error:", e);
      }
    }

    const socket = socketRef.current;
    if (socket) {
      socket.emit("join_campaign", activeCampaignId);
      socket.on("campaign_log", (payload: any) => {
        if (payload && payload.log) {
          setLogs((prev) => [...prev, payload.log]);
        }
        if (payload && payload.campaign && payload.campaign.status) {
          setCampaignStatus(payload.campaign.status);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit("leave_campaign", activeCampaignId);
        socket.off("campaign_log");
      }
    };
  }, [activeCampaignId]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Validate Datafile
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.datafile) {
        try {
          const res = await triggerGetFileInfo(formData.datafile).unwrap();
          setDataFileCount(res.found ? res.count : 0);
        } catch {
          setDataFileCount(0);
        }
      } else {
        setDataFileCount(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.datafile, triggerGetFileInfo]);

  // Validate Offer
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.offerId) {
        try {
          const res = await triggerValidateOffer(formData.offerId).unwrap();
          setOfferValid(res.valid);
        } catch {
          setOfferValid(false);
        }
      } else {
        setOfferValid(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.offerId, triggerValidateOffer]);

  // Format log line styling
  const getLogClass = (type: string) => {
    switch (type) {
      case "success":
        return "log-success";
      case "error":
        return "log-error";
      case "warn":
        return "log-warn";
      default:
        return "log-info";
    }
  };

  const onSend: SubmitHandler<FsockFormData> = async (data) => {
    setIsLoading(true);
    setLogs([
      { _id: "1", log_text: "Validating Campaign Request...", type: "info" },
    ]);
    try {
      const payload = {
        ...data,
        from_name: data.from,
        test_emails: data.emails,
        subject_enc: data.sencode,
        from_enc: data.fmencode,
        auto_start: data.mode === "Bulk",
        sleep_time: data.sleep,
        wait_time: data.wait,
      };

      const res = await createCampaign(payload).unwrap();
      setActiveCampaignId(res.campaignId);
      setCampaignStatus("Running");
      window.history.replaceState({}, "", `?c=${res.campaignId}`);
      setLogs((prev) => [
        ...prev,
        {
          _id: "2",
          log_text: `Campaign created successfully! ID: ${res.campaignId}`,
          type: "success",
        },
        { _id: "3", log_text: "Waiting for worker to attach...", type: "info" },
      ]);
    } catch (error: any) {
      setLogs((prev) => [
        ...prev,
        {
          _id: "err",
          log_text: `HTTP Error: ${error.data?.message || error.message || "Unknown error"}`,
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeCampaignId) return;
    try {
      await stopCampaign(activeCampaignId).unwrap();
      setCampaignStatus("Stopped");
    } catch (err: any) {
      alert(
        "Failed to send stop signal: " + (err.data?.message || err.message),
      );
    }
  };

  const copyTrackLink = () => {
    if (!activeCampaignId) {
      alert("No active campaign to copy.");
      return;
    }
    const link = `${window.location.origin}/fsock-send-smtp-auto?c=${activeCampaignId}`;
    navigator.clipboard.writeText(link);
    alert("Track link copied to clipboard!");
  };

  return (
    <div className="fsock-container-parity">
      <fieldset className="fsock-fieldset">
        <form onSubmit={handleSubmit(onSend)}>
          <table className="fsock-main-table">
            <tbody>
              <tr className="fsock-header-row">
                <td className="fsock-blue-header">
                  <h2>FAST MAILER (AUTO-SEND)</h2>
                  {campaignStatus !== "Pending" && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#cbd5e1",
                        fontWeight: 600,
                      }}
                    >
                      Status:{" "}
                      <span
                        style={{
                          color:
                            campaignStatus === "Completed"
                              ? "#4ade80"
                              : campaignStatus === "Running"
                                ? "#60a5fa"
                                : "#f87171",
                        }}
                      >
                        {campaignStatus}
                      </span>
                    </div>
                  )}
                </td>
                <td className="fsock-top-center">
                  <table className="fsock-content-table">
                    <tbody>
                      <tr>
                        <td className="fsock-label">
                          From Email Address
                          <img
                            src="/help.png"
                            className="fsock-help-icon"
                            alt="help"
                            onClick={() => window.open("/fsock-help", "_blank")}
                            style={{
                              float: "none",
                              marginLeft: "8px",
                              opacity: 0.8,
                              cursor: "pointer",
                            }}
                          />
                        </td>
                        <td className="fsock-input-group">
                          <input
                            type="text"
                            placeholder="Enter From Email..."
                            className={errors.from_email ? "invalid-input" : ""}
                            {...register("from_email")}
                          />
                          {errors.from_email && (
                            <div className="fsock-error">
                              {errors.from_email.message}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="fsock-left-col">
                  <textarea
                    className={`fsock-ip-textarea ${errors.mailing_ip ? "invalid-input" : ""}`}
                    {...register("mailing_ip")}
                  />
                  {errors.mailing_ip && (
                    <div className="fsock-error">
                      {errors.mailing_ip.message}
                    </div>
                  )}

                  <div className="mt-20-fw-b">
                    RESULT{" "}
                    {activeCampaignId &&
                      `(Logs for ID: ${activeCampaignId.slice(-6)})`}{" "}
                    :
                  </div>
                  <div className="fsock-result-area" ref={logContainerRef}>
                    {logs.length === 0 ? (
                      <div className="text-gray-500 italic text-center mt-10">
                        Awaiting execution...
                      </div>
                    ) : (
                      logs.map((log, i) => (
                        <div
                          key={log._id || i}
                          className={`log-line ${getLogClass(log.type)}`}
                        >
                          {log.log_text}
                        </div>
                      ))
                    )}
                  </div>
                </td>
                <td className="fsock-right-col">
                  <table className="fsock-content-table">
                    <tbody>
                      <tr>
                        <td className="fsock-label">Headers</td>
                        <td className="fsock-input-group">
                          <textarea
                            className="fsock-textarea-standard"
                            placeholder="X-Mailer: MyMailer&#10;List-Unsubscribe: &lt;mailto:unsub@domain.com&gt;"
                            {...register("headers")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">Subject</td>
                        <td className="fsock-input-group">
                          <input
                            type="text"
                            className={`fsock-input-standard ${errors.sub ? "invalid-input" : ""}`}
                            {...register("sub")}
                          />
                          {errors.sub && (
                            <div className="fsock-error">
                              {errors.sub.message}
                            </div>
                          )}
                          <div className="mt-5">
                            <input
                              type="radio"
                              value="ascii"
                              {...register("sencode")}
                            />{" "}
                            UTF8-Q &nbsp;
                            <input
                              type="radio"
                              value="base64"
                              {...register("sencode")}
                            />{" "}
                            UTF8-B &nbsp;
                            <input
                              type="radio"
                              value="reset"
                              {...register("sencode")}
                            />{" "}
                            RESET
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">From Name</td>
                        <td className="fsock-input-group">
                          <input
                            type="text"
                            className={`fsock-input-standard ${errors.from ? "invalid-input" : ""}`}
                            {...register("from")}
                          />
                          {errors.from && (
                            <div className="fsock-error">
                              {errors.from.message}
                            </div>
                          )}
                          <div className="mt-5">
                            <input
                              type="radio"
                              value="ascii"
                              {...register("fmencode")}
                            />{" "}
                            UTF8-Q &nbsp;
                            <input
                              type="radio"
                              value="base64"
                              {...register("fmencode")}
                            />{" "}
                            UTF8-B &nbsp;
                            <input
                              type="radio"
                              value="reset"
                              {...register("fmencode")}
                            />{" "}
                            RESET
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">Test Emails</td>
                        <td className="fsock-input-group">
                          <textarea
                            className={`fsock-textarea-standard !min-h-[60px] ${errors.emails ? "invalid-input" : ""}`}
                            placeholder="test1@domain.com (Max 4)"
                            {...register("emails")}
                          />
                          {errors.emails && (
                            <div className="fsock-error">
                              {errors.emails.message}
                            </div>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">Send Mode</td>
                        <td className="fsock-input-group">
                          <input
                            type="radio"
                            value="Test"
                            {...register("mode")}
                          />{" "}
                          <b>Test</b> &nbsp;&nbsp;
                          <input
                            type="radio"
                            value="Bulk"
                            {...register("mode")}
                          />{" "}
                          <b>Bulk</b>
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">Preview</td>
                        <td className="fsock-input-group">
                          <button
                            type="button"
                            className="fsock-send-btn"
                            onClick={() => {
                              const inf =
                                formData.message_html +
                                (formData.message_plain || "");
                              const win = window.open(
                                "",
                                "popup",
                                "toolbar=no, status=no, scrollbars=yes, width=800, height=600",
                              );
                              if (win) {
                                win.document.write(inf);
                                win.document.close();
                              }
                            }}
                          >
                            Preview Template
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label">Body</td>
                        <td className="fsock-input-group">
                          <textarea
                            className={`fsock-body-html ${errors.message_html ? "invalid-input" : ""}`}
                            placeholder="<html><body>Hello</body></html>"
                            {...register("message_html")}
                          />
                          {errors.message_html && (
                            <div className="fsock-error">
                              {errors.message_html.message}
                            </div>
                          )}
                          <textarea
                            className="fsock-body-plain"
                            placeholder="Plain text fallback"
                            {...register("message_plain")}
                          />
                        </td>
                      </tr>

                      {/* Mini table fields */}
                      <tr>
                        <td className="fsock-label"></td>
                        <td className="fsock-input-group">
                          <table className="fsock-mini-table">
                            <tbody>
                              <tr>
                                <td className="fsock-mini-label">Offer Id :</td>
                                <td style={{ width: "180px" }}>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      type="text"
                                      className={`fsock-mini-input ${errors.offerId ? "invalid-input" : ""}`}
                                      placeholder="Put Offer Id"
                                      {...register("offerId")}
                                      style={{
                                        paddingRight:
                                          offerValid !== null ||
                                          isValidatingOffer
                                            ? "30px"
                                            : "8px",
                                      }}
                                    />
                                    {isValidatingOffer ? (
                                      <span className="fsock-mini-indicator">
                                        <Loader2
                                          className="animate-spin"
                                          size={12}
                                        />
                                      </span>
                                    ) : (
                                      offerValid !== null && (
                                        <div className="fsock-indicator-group">
                                          <span
                                            className={`fsock-mini-indicator ${offerValid ? "success" : "error"}`}
                                          >
                                            {offerValid ? "✓" : <X size={10} />}
                                          </span>
                                          {!isValidatingOffer && (
                                            <button
                                              type="button"
                                              className="fsock-clear-btn-mini"
                                              onClick={() => {
                                                setValue("offerId", "");
                                                setOfferValid(null);
                                              }}
                                            >
                                              <X size={10} />
                                            </button>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  Domain :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className={`fsock-mini-input ${errors.domain ? "invalid-input" : ""}`}
                                    placeholder="Domain"
                                    {...register("domain")}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="fsock-mini-label">Datafile :</td>
                                <td style={{ width: "180px" }}>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      type="text"
                                      className={`fsock-mini-input ${errors.datafile ? "invalid-input" : ""}`}
                                      placeholder="Put DataFile Name"
                                      {...register("datafile")}
                                      style={{
                                        paddingRight:
                                          dataFileCount !== null ||
                                          isFetchingFileInfo
                                            ? "45px"
                                            : "8px",
                                      }}
                                    />
                                    {isFetchingFileInfo ? (
                                      <span className="fsock-mini-indicator">
                                        <Loader2
                                          className="animate-spin"
                                          size={12}
                                        />
                                      </span>
                                    ) : (
                                      dataFileCount !== null && (
                                        <div className="fsock-indicator-group">
                                          <span
                                            className={`fsock-mini-indicator ${dataFileCount > 0 ? "success" : "error"}`}
                                          >
                                            {dataFileCount > 0 ? (
                                              dataFileCount
                                            ) : (
                                              <X size={10} />
                                            )}
                                          </span>
                                          {!isFetchingFileInfo && (
                                            <button
                                              type="button"
                                              className="fsock-clear-btn-mini"
                                              onClick={() => {
                                                setValue("datafile", "");
                                                setDataFileCount(null);
                                              }}
                                            >
                                              <X size={10} />
                                            </button>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  MsgId :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Put Message ID Name"
                                    {...register("msgid")}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="fsock-mini-label">Total :</td>
                                <td style={{ width: "180px" }}>
                                  <input
                                    type="text"
                                    className={`fsock-mini-input ${errors.total_limit ? "invalid-input" : ""}`}
                                    placeholder="Put Total Sending Limit"
                                    {...register("total_limit")}
                                  />
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  Limit :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className={`fsock-mini-input ${errors.send_limit ? "invalid-input" : ""}`}
                                    placeholder="Put One Click limit"
                                    {...register("send_limit")}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="fsock-mini-label">Sleep :</td>
                                <td style={{ width: "180px" }}>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Put Sleep Time"
                                    {...register("sleep")}
                                  />
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  Wait :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Put Wait Time"
                                    {...register("wait")}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="fsock-mini-label">Inbox% :</td>
                                <td style={{ width: "180px" }}>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Put Inbox Percentage"
                                    {...register("inbox_percentage")}
                                  />
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  Test After :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Put Test After"
                                    {...register("test_after")}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={2}
                          style={{ textAlign: "center", padding: "20px 0" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="submit"
                              className="fsock-send-btn primary"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Send size={16} />
                              )}
                              <span>Send</span>
                            </button>
                            <button
                              type="button"
                              className="fsock-send-btn link-btn"
                              onClick={copyTrackLink}
                              disabled={isLoading}
                            >
                              <Link size={16} />
                              <span>Get Link</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="fsock-label"></td>
                        <td className="fsock-input-group">
                          <details className="fsock-space-sending" open>
                            <summary className="fsock-space-summary">
                              Space Sending
                            </summary>
                            <div className="fsock-space-body">
                              <table style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <td></td>
                                    <td className="tr-pr-5">
                                      <button
                                        type="button"
                                        className="fsock-send-btn start-btn"
                                        onClick={handleSubmit(onSend as any)}
                                        disabled={campaignStatus === "Running"}
                                      >
                                        <Play size={14} fill="currentColor" />
                                        <span>Start</span>
                                      </button>
                                    </td>
                                    <td className="tl">
                                      <button
                                        type="button"
                                        className="fsock-send-btn stop-btn"
                                        onClick={handleStop}
                                        disabled={campaignStatus !== "Running"}
                                      >
                                        <Square size={14} fill="currentColor" />
                                        <span>Stop</span>
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </details>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </fieldset>
    </div>
  );
};

export default FsockAutoSend;
