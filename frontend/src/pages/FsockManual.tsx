import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Send, Link, Play, Square } from "lucide-react";
import {
  useSendFsockSmtpMutation,
  useSearchLegacyLinkMutation,
  useGetLegacyCampaignQuery,
  useLazyGetFileInfoQuery,
  useLazyValidateOfferQuery,
  useStartFsockAutoMutation,
  useStopFsockAutoMutation,
} from "../store/apiSlice";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import API_BASE_URL from "../config/api";
import "./FsockManual.css";

const fsockSchema = z.object({
  from_email: z.string().email("Invalid email").min(1, "Required"),
  mailing_ip: z.string().min(1, "SMTP details required"),
  headers: z.string().optional(),
  sub: z.string().min(1, "Subject required"),
  sencode: z.string().min(1, "Required"),
  from: z.string().min(1, "From name required"),
  fmencode: z.string().min(1, "Required"),
  emails: z.string().min(1, "Test emails required"),
  mode: z.enum(["Test", "Bulk"]),
  message_html: z.string().min(1, "HTML required"),
  message_plain: z.string().optional(),
  offerId: z.string().min(1, "Offer Id required"),
  domain: z.string().min(1, "Domain required"),
  datafile: z.string().min(1, "Datafile required"),
  message_id: z.string().optional(),
  total_limit: z.string().min(1, "Total limit required"),
  send_limit: z.string().min(1, "Limit required"),
  sleep: z.string().optional(),
  wait: z.string().optional(),
  inbox_percentage: z.string().optional(),
  test_after: z.string().optional(),
  interval: z.string().optional(),
});

type FsockFormData = z.infer<typeof fsockSchema>;

const FsockManual = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const campaignId = searchParams.get("c");
  const isAutoMode = location.pathname === "/fsock-send-smtp-auto";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FsockFormData>({
    resolver: zodResolver(fsockSchema),
    defaultValues: {
      sencode: "reset",
      fmencode: "reset",
      mode: "Test",
      mailing_ip:
        "ESP (SMTP)    : (IP|Return@Path)\nNote : You can use all functions in Return Path",
      headers: "",
      message_plain: "",
      message_id: "",
      sleep: "",
      wait: "",
      inbox_percentage: "",
      test_after: "",
      interval: "",
    },
  });

  const formData = watch();

  const [sendFsock] = useSendFsockSmtpMutation();
  const [searchLink] = useSearchLegacyLinkMutation();
  const { data: campaignData, isSuccess: isCampaignSuccess } =
    useGetLegacyCampaignQuery(campaignId || "", {
      skip: !campaignId,
    });

  const [triggerGetFileInfo, { isFetching: isFetchingFileInfo }] =
    useLazyGetFileInfoQuery();
  const [triggerValidateOffer, { isFetching: isValidatingOffer }] =
    useLazyValidateOfferQuery();

  const [isLoading, setIsLoading] = useState(false);
  const [logOutput, setLogOutput] = useState("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Status Indicators
  const [dataFileCount, setDataFileCount] = useState<number | null>(null);
  const [offerValid, setOfferValid] = useState<boolean | null>(null);

  // Auto Mode State
  const [startFsockAuto] = useStartFsockAutoMutation();
  const [stopFsockAuto] = useStopFsockAutoMutation();
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [testSeeds, setTestSeeds] = useState<
    Record<string, { status: string; msgId: string }>
  >({});
  const [socket, setSocket] = useState<any>(null);

  // Safe base64 decode for legacy parity
  const safeAtob = (str: string) => {
    try {
      return str ? atob(str) : "";
    } catch {
      return str || "";
    }
  };

  // Populate form if campaignId is present (Legacy Parity)
  useEffect(() => {
    if (isCampaignSuccess && campaignData) {
      reset({
        from_email: safeAtob(campaignData.from_email),
        headers: safeAtob(campaignData.headers),
        sub: safeAtob(campaignData.subject),
        from: safeAtob(campaignData.from_name),
        message_html: safeAtob(campaignData.message_html),
        message_plain: safeAtob(campaignData.message_plain),
        mailing_ip: campaignData.smtp || formData.mailing_ip,
        offerId: safeAtob(campaignData.offerIdenc) || campaignData.offer_id,
        domain: campaignData.domain || "",
        datafile: campaignData.data_file || "",
        message_id: safeAtob(campaignData.msgid),
        total_limit: String(campaignData.total_limit || ""),
        send_limit: String(campaignData.send_limit || ""),
        sleep: campaignData.sleep_time || "",
        wait: campaignData.wait_time || "",
        inbox_percentage: campaignData.inbox_percent || "",
        test_after: campaignData.mail_after || "",
        sencode: "reset",
        fmencode: "reset",
        mode: "Test",
      });
    }
  }, [isCampaignSuccess, campaignData, formData.mailing_ip, reset]);

  // Auto-fetch Datafile Info
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

  // Auto-validate Offer Id
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

  // Socket.io Connection for Auto Mode
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && activeCampaignId) {
      socket.emit("join_campaign", activeCampaignId);

      socket.on("campaign_log", (data: any) => {
        const logText = data.log?.log_text || "";
        setLogOutput((prev) => prev + `<br>${logText}`);
      });

      socket.on("test_seed_update", (data: any) => {
        setTestSeeds((prev) => ({
          ...prev,
          [data.email]: { status: data.status, msgId: data.msgId },
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off("campaign_log");
        socket.off("test_seed_update");
      }
    };
  }, [socket, activeCampaignId]);

  const onSend: SubmitHandler<FsockFormData> = async (data) => {
    setIsLoading(true);
    setLogOutput("Processing...");
    try {
      if (isAutoMode) {
        const response = await startFsockAuto(data).unwrap();
        setActiveCampaignId(response.campaignId);
        setLogOutput(
          `<div style='color: white; background: #2563eb; padding: 10px; border-radius: 4px;'>Auto Campaign Started. ID: ${response.campaignId}</div>`,
        );
      } else {
        const response = await sendFsock(data).unwrap();
        setLogOutput(
          typeof response === "string"
            ? response
            : JSON.stringify(response, null, 2),
        );
      }
    } catch (error: any) {
      setLogOutput(
        `<font color='red'>Error: ${error.data?.message || error.message}</font>`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAuto = async () => {
    if (!activeCampaignId) return;
    try {
      await stopFsockAuto(activeCampaignId).unwrap();
      setActiveCampaignId(null);
      setLogOutput(
        (prev) =>
          prev + "<br><font color='orange'>Campaign Stop Requested...</font>",
      );
    } catch (error: any) {
      alert("Error stopping campaign");
    }
  };

  const handleDisplayHTML = () => {
    const inf = formData.message_html + (formData.message_plain || "");
    const win = window.open(
      "",
      "popup",
      "toolbar=no, status=no, scrollbars=yes, width=800, height=600",
    );
    if (win) {
      win.document.write(inf);
      win.document.close();
    }
  };

  const handleGetLink = async () => {
    if (
      !formData.sub ||
      !formData.domain ||
      !formData.offerId ||
      formData.sub.toLowerCase().includes("subject") ||
      formData.domain.toLowerCase().includes("domain")
    ) {
      alert("Please fill Subject, Domain, and Offer Id first");
      setLogOutput(
        "<div style='color: orange;'>Metadata missing for link search</div>",
      );
      return;
    }
    setIsLoading(true);
    setLogOutput("Searching for link...");
    try {
      const payload = {
        subject: formData.sub,
        ip: formData.mailing_ip.split("\n")[0]?.split("|")[0] || "",
        domain: formData.domain,
        offer: formData.offerId,
      };
      const response = await searchLink(payload).unwrap();
      if (response.in_link) {
        setLogOutput(
          `<div style='color: green; font-weight: bold;'>Link found: ${response.in_link}</div>`,
        );
        alert(`Link found: ${response.in_link}`);
      } else {
        setLogOutput("<div style='color: red;'>Link not found</div>");
      }
    } catch (error: any) {
      setLogOutput("<div style='color: red;'>Error fetching link</div>");
    } finally {
      setIsLoading(false);
    }
  };

  const displayStart = () => {
    if (!formData.interval) {
      alert("Provide Interval Time");
      return;
    }
    const timeInMicroSec = Number(formData.interval) * 1000;
    const id = setInterval(() => {
      handleSubmit(onSend)();
    }, timeInMicroSec);
    setIntervalId(id);
    setLogOutput("<div style='color: blue;'>Space sending started...</div>");
  };

  const displayStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setLogOutput("<div style='color: orange;'>Space sending stopped</div>");
    }
  };

  const handleHelpClick = () => {
    window.open("/fsock-help", "_blank");
  };

  return (
    <div className="fsock-container-parity">
      <fieldset className="fsock-fieldset">
        <form onSubmit={handleSubmit(onSend)}>
          <table className="fsock-main-table">
            <tbody>
              <tr className="fsock-header-row">
                <td className="fsock-blue-header">
                  <h2>FAST MAILER (ESP/SERVER)</h2>
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
                            onClick={handleHelpClick}
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
                  <div className="mt-20-fw-b">RESULT:</div>
                  <div
                    className="fsock-result-area"
                    dangerouslySetInnerHTML={{ __html: logOutput }}
                  />
                  {isAutoMode && Object.keys(testSeeds).length > 0 && (
                    <div className="fsock-seed-monitor">
                      <h3>Seed Response Monitor</h3>
                      <table className="fsock-seed-table">
                        <thead>
                          <tr>
                            <th>Seed Email</th>
                            <th>Status (INBOX/SPAM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(testSeeds).map(([email, info]) => (
                            <tr key={email}>
                              <td>{email}</td>
                              <td
                                className={`seed-status-${info.status.toLowerCase()}`}
                              >
                                {info.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </td>
                <td className="fsock-right-col">
                  <table className="fsock-content-table">
                    <tbody>
                      <tr>
                        <td className="fsock-label">Headers</td>
                        <td className="fsock-input-group">
                          <textarea
                            className="fsock-textarea-standard"
                            placeholder="Put Headers Here..!"
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
                        <td className="fsock-label">From</td>
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
                        <td className="fsock-label">Test Email</td>
                        <td className="fsock-input-group">
                          <textarea
                            className={`fsock-textarea-standard ${errors.emails ? "invalid-input" : ""}`}
                            placeholder="Put Test Email Id here (Max 100 Allowed)"
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
                            className="fsock-send-btn preview-btn"
                            onClick={handleDisplayHTML}
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
                            placeholder="Put HTML here"
                            {...register("message_html")}
                          />
                          {errors.message_html && (
                            <div className="fsock-error">
                              {errors.message_html.message}
                            </div>
                          )}
                          <textarea
                            className="fsock-body-plain"
                            placeholder="Put Plain here"
                            {...register("message_plain")}
                          />
                        </td>
                      </tr>
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
                                      placeholder="Offer Id"
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
                                      placeholder="Datafile"
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
                                    placeholder="Message ID"
                                    {...register("message_id")}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td className="fsock-mini-label">Total :</td>
                                <td style={{ width: "180px" }}>
                                  <input
                                    type="text"
                                    className={`fsock-mini-input ${errors.total_limit ? "invalid-input" : ""}`}
                                    placeholder="Total Limit"
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
                                    placeholder="One Click limit"
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
                                    placeholder="Sleep"
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
                                    placeholder="Wait"
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
                                    placeholder="Inbox %"
                                    {...register("inbox_percentage")}
                                  />
                                </td>
                                <td style={{ width: "30px" }}></td>
                                <td
                                  className="fsock-mini-label"
                                  style={{ width: "80px" }}
                                >
                                  After :
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="fsock-mini-input"
                                    placeholder="Test After"
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
                              className={`fsock-send-btn primary ${activeCampaignId ? "running" : ""}`}
                              disabled={isLoading || !!activeCampaignId}
                            >
                              {isLoading ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Send size={16} />
                              )}
                              <span>
                                {isLoading
                                  ? "Processing..."
                                  : isAutoMode
                                    ? "Start Auto Campaign"
                                    : "Send Message"}
                              </span>
                            </button>
                            {isAutoMode && activeCampaignId && (
                              <button
                                type="button"
                                className="fsock-send-btn stop-btn"
                                onClick={handleStopAuto}
                              >
                                <Square size={16} />
                                <span>Stop Auto Campaign</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="fsock-send-btn link-btn"
                              onClick={handleGetLink}
                              disabled={isLoading}
                            >
                              <Link size={16} />
                              <span>Get Track Link</span>
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
                                    <td>
                                      <input
                                        type="number"
                                        className="fsock-interval-input"
                                        placeholder="Interval Time (Sec)"
                                        {...register("interval")}
                                      />
                                    </td>
                                    <td className="tr-pr-5">
                                      <button
                                        type="button"
                                        className="fsock-send-btn start-btn"
                                        onClick={displayStart}
                                        disabled={!!intervalId}
                                      >
                                        <Play size={14} fill="currentColor" />
                                        <span>Start</span>
                                      </button>
                                    </td>
                                    <td className="tl">
                                      <button
                                        type="button"
                                        className="fsock-send-btn stop-btn"
                                        onClick={displayStop}
                                        disabled={!intervalId}
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

export default FsockManual;
