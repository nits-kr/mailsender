import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useSendFsockSmtpMutation,
  useSearchLegacyLinkMutation,
  useGetLegacyCampaignQuery,
} from "../store/apiSlice";
import "./FsockManual.css";

const FsockManual = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("c");

  const [formData, setFormData] = useState({
    session_id: "Admin",
    from_email: "",
    mailing_ip:
      "ESP (SMTP)    : (IP|Return@Path)\nNote : You can use all functions in Return Path",
    headers: "",
    sub: "",
    sencode: "reset",
    from: "",
    fmencode: "reset",
    emails: "",
    mode: "Test",
    message_html: "",
    message_plain: "",
    offerId: "",
    domain: "",
    datafile: "",
    msgid: "",
    total_limit: "",
    send_limit: "",
    sleep: "",
    wait: "",
    inbox_percentage: "",
    test_after: "",
    interval: "",
  });

  const [sendFsock] = useSendFsockSmtpMutation();
  const [searchLink] = useSearchLegacyLinkMutation();
  const { data: campaignData, isSuccess: isCampaignSuccess } =
    useGetLegacyCampaignQuery(campaignId || "", {
      skip: !campaignId,
    });

  const [isLoading, setIsLoading] = useState(false);
  const [logOutput, setLogOutput] = useState("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Populate form if campaignId is present and fetched
  useEffect(() => {
    if (isCampaignSuccess && campaignData) {
      // Logic from index.php parity
      // Note: Backend getLegacyCampaign maps mysql_sno or _id
      setFormData((prev) => ({
        ...prev,
        from_email: campaignData.from_email
          ? atob(campaignData.from_email)
          : "", // Assuming base64 from legacy parity
        headers: campaignData.headers ? atob(campaignData.headers) : "",
        sub: campaignData.subject ? atob(campaignData.subject) : "",
        from: campaignData.from_name ? atob(campaignData.from_name) : "",
        message_html: campaignData.message_html
          ? atob(campaignData.message_html)
          : "",
        message_plain: campaignData.message_plain
          ? atob(campaignData.message_plain)
          : "",
        // ... other fields if needed
      }));
    }
  }, [isCampaignSuccess, campaignData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDisplayHTML = () => {
    const inf = formData.message_html + formData.message_plain;
    const win = window.open(
      "",
      "popup",
      "toolbar=no, status=no, scrollbars=yes",
    );
    win?.document.write("" + inf + "");
  };

  const handleAction = async (actionType: "send" | "get_link") => {
    setIsLoading(true);
    try {
      let response;
      if (actionType === "send") {
        response = await sendFsock(formData).unwrap();
      } else {
        response = await searchLink(formData).unwrap();
      }
      setLogOutput(
        typeof response === "string"
          ? response
          : JSON.stringify(response, null, 2),
      );
    } catch (error: any) {
      setLogOutput(
        `<font color='red'>Error: ${error.data || error.message}</font>`,
      );
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
      // In a real scenario, this would trigger the actual send
      handleAction("send");
    }, timeInMicroSec);
    setIntervalId(id);
  };

  const displayStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleHelpClick = () => {
    window.open("/fsock-help", "_blank");
  };

  return (
    <div className="fsock-container-parity">
      <fieldset className="fsock-fieldset">
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
                          name="from_email"
                          placeholder="Enter From Email..."
                          value={formData.from_email}
                          onChange={handleInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="fsock-left-col">
                <textarea
                  name="mailing_ip"
                  className="fsock-ip-textarea"
                  value={formData.mailing_ip}
                  onChange={handleInputChange}
                />
                <div className="mt-20-fw-b">RESULT:</div>
                <div
                  className="fsock-result-area"
                  dangerouslySetInnerHTML={{ __html: logOutput }}
                />
              </td>
              <td className="fsock-right-col">
                <table className="fsock-content-table">
                  <tbody>
                    <tr>
                      <td className="fsock-label">Headers</td>
                      <td className="fsock-input-group">
                        <textarea
                          name="headers"
                          className="fsock-textarea-standard"
                          placeholder="Put Headers Here..!"
                          value={formData.headers}
                          onChange={handleInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="fsock-label">Subject</td>
                      <td className="fsock-input-group">
                        <input
                          type="text"
                          name="sub"
                          className="fsock-input-standard"
                          value={formData.sub}
                          onChange={handleInputChange}
                        />
                        <div className="mt-5">
                          <input
                            type="radio"
                            name="sencode"
                            value="ascii"
                            checked={formData.sencode === "ascii"}
                            onChange={handleInputChange}
                          />{" "}
                          UTF8-Q &nbsp;
                          <input
                            type="radio"
                            name="sencode"
                            value="base64"
                            checked={formData.sencode === "base64"}
                            onChange={handleInputChange}
                          />{" "}
                          UTF8-B &nbsp;
                          <input
                            type="radio"
                            name="sencode"
                            value="reset"
                            checked={formData.sencode === "reset"}
                            onChange={handleInputChange}
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
                          name="from"
                          className="fsock-input-standard"
                          value={formData.from}
                          onChange={handleInputChange}
                        />
                        <div className="mt-5">
                          <input
                            type="radio"
                            name="fmencode"
                            value="ascii"
                            checked={formData.fmencode === "ascii"}
                            onChange={handleInputChange}
                          />{" "}
                          UTF8-Q &nbsp;
                          <input
                            type="radio"
                            name="fmencode"
                            value="base64"
                            checked={formData.fmencode === "base64"}
                            onChange={handleInputChange}
                          />{" "}
                          UTF8-B &nbsp;
                          <input
                            type="radio"
                            name="fmencode"
                            value="reset"
                            checked={formData.fmencode === "reset"}
                            onChange={handleInputChange}
                          />{" "}
                          RESET
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fsock-label">Test Email</td>
                      <td className="fsock-input-group">
                        <textarea
                          name="emails"
                          className="fsock-textarea-standard"
                          placeholder="Put Test Email Id here (Max 100 Allowed)"
                          value={formData.emails}
                          onChange={handleInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="fsock-label">Send Mode</td>
                      <td className="fsock-input-group">
                        <input
                          type="radio"
                          name="mode"
                          value="Test"
                          checked={formData.mode === "Test"}
                          onChange={handleInputChange}
                        />{" "}
                        <b>Test</b> &nbsp;&nbsp;
                        <input
                          type="radio"
                          name="mode"
                          value="Bulk"
                          checked={formData.mode === "Bulk"}
                          onChange={handleInputChange}
                        />{" "}
                        <b>Bulk</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="fsock-label">Preview</td>
                      <td className="fsock-input-group">
                        <button
                          className="fsock-send-btn"
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
                          name="message_html"
                          className="fsock-body-html"
                          placeholder="Put HTML here"
                          value={formData.message_html}
                          onChange={handleInputChange}
                        />
                        <textarea
                          name="message_plain"
                          className="fsock-body-plain"
                          placeholder="Put Plain here"
                          value={formData.message_plain}
                          onChange={handleInputChange}
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
                                <input
                                  type="text"
                                  name="offerId"
                                  className="fsock-mini-input"
                                  placeholder="Put Offer Id"
                                  value={formData.offerId}
                                  onChange={handleInputChange}
                                />
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
                                  name="domain"
                                  className="fsock-mini-input"
                                  placeholder="Put Domain Name"
                                  value={formData.domain}
                                  onChange={handleInputChange}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="fsock-mini-label">Datafile :</td>
                              <td style={{ width: "180px" }}>
                                <input
                                  type="text"
                                  name="datafile"
                                  className="fsock-mini-input"
                                  placeholder="Put DataFile Name"
                                  value={formData.datafile}
                                  onChange={handleInputChange}
                                />
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
                                  name="msgid"
                                  className="fsock-mini-input"
                                  placeholder="Put Message ID Name"
                                  value={formData.msgid}
                                  onChange={handleInputChange}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="fsock-mini-label">Total :</td>
                              <td style={{ width: "180px" }}>
                                <input
                                  type="text"
                                  name="total_limit"
                                  className="fsock-mini-input"
                                  placeholder="Put Total Sending Limit"
                                  value={formData.total_limit}
                                  onChange={handleInputChange}
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
                                  name="send_limit"
                                  className="fsock-mini-input"
                                  placeholder="Put One Click limit"
                                  value={formData.send_limit}
                                  onChange={handleInputChange}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="fsock-mini-label">Sleep :</td>
                              <td style={{ width: "180px" }}>
                                <input
                                  type="text"
                                  name="sleep"
                                  className="fsock-mini-input"
                                  placeholder="Put Sleep Time"
                                  value={formData.sleep}
                                  onChange={handleInputChange}
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
                                  name="wait"
                                  className="fsock-mini-input"
                                  placeholder="Put Wait Time"
                                  value={formData.wait}
                                  onChange={handleInputChange}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="fsock-mini-label">Inbox% :</td>
                              <td style={{ width: "180px" }}>
                                <input
                                  type="text"
                                  name="inbox_percentage"
                                  className="fsock-mini-input"
                                  placeholder="Put Inbox Percentage"
                                  value={formData.inbox_percentage}
                                  onChange={handleInputChange}
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
                                  name="test_after"
                                  className="fsock-mini-input"
                                  placeholder="Put Test After"
                                  value={formData.test_after}
                                  onChange={handleInputChange}
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
                        {isLoading && (
                          <div className="fsock-loading-bar">Sending ...</div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            className="fsock-send-btn primary"
                            onClick={() => handleAction("send")}
                            disabled={isLoading}
                          >
                            Send Message
                          </button>
                          <button
                            className="fsock-send-btn"
                            onClick={() => handleAction("get_link")}
                            disabled={isLoading}
                          >
                            Get Track Link
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fsock-label"></td>
                      <td className="fsock-input-group">
                        <details className="fsock-space-sending">
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
                                      name="interval"
                                      className="w-100"
                                      placeholder="Interval Time"
                                      value={formData.interval}
                                      onChange={handleInputChange}
                                    />
                                  </td>
                                  <td className="tr-pr-5">
                                    <button
                                      className="fsock-send-btn"
                                      onClick={displayStart}
                                      disabled={!!intervalId}
                                    >
                                      Start
                                    </button>
                                  </td>
                                  <td className="tl">
                                    <button
                                      className="fsock-send-btn btn-stop"
                                      onClick={displayStop}
                                    >
                                      Stop
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
      </fieldset>
    </div>
  );
};

export default FsockManual;
