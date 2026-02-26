import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useSendFsockSmtpMutation,
  useSearchLegacyLinkMutation,
  useGetLegacyCampaignQuery,
} from "../store/apiSlice";

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
    datafile: "",
    msgid: "",
    total_limit: "",
    send_limit: "",
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

  return (
    <div className="fsock-container-parity">
      <style>{`
        .fsock-container-parity {
          background-color: white;
          color: black;
          font-family: "Trebuchet MS", verdana;
          padding: 10px;
        }
        .fsock-fieldset {
          border: 2px dotted #000000;
          padding: 0;
          margin: 0;
        }
        .fsock-main-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid black;
        }
        .fsock-header-row td {
          border-bottom: 2px solid black;
        }
        .fsock-blue-header {
          background-color: #000033;
          color: #fff;
          padding: 15px;
          width: 30%;
        }
        .fsock-blue-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }
        .fsock-top-center {
          border: 1px dotted #999;
          text-align: center;
          padding: 10px;
          font-size: 13px;
        }
        .fsock-top-center input {
          border: 1px dotted #999;
          width: 450px;
          margin-top: 5px;
        }
        .fsock-left-col {
          border-right: 2px solid black;
          vertical-align: top;
          padding: 15px;
          text-align: center;
        }
        .fsock-ip-textarea {
          width: 100%;
          height: 310px;
          font-family: monospace;
          font-size: 12px;
          padding: 5px;
        }
        .fsock-right-col {
          vertical-align: top;
          padding: 20px;
        }
        .fsock-content-table {
          font-size: 12px;
          width: 100%;
          border-collapse: collapse;
        }
        .fsock-content-table td {
          padding-bottom: 10px;
        }
        .fsock-label {
          width: 150px;
          font-weight: bold;
          text-align: left;
          padding-right: 20px;
        }
        .fsock-input-group {
          text-align: center;
        }
        .fsock-textarea-standard {
          width: 445px;
          height: 110px;
          font-family: monospace;
          font-size: 12px;
        }
        .fsock-input-standard {
          width: 445px;
          padding: 2px;
        }
        .fsock-body-html {
          width: 445px;
          height: 300px;
          font-family: monospace;
          font-size: 12px;
        }
        .fsock-body-plain {
          width: 445px;
          height: 71px;
          font-family: monospace;
          font-size: 12px;
        }
        .fsock-mini-table {
          width: 100%;
          margin-top: 10px;
        }
        .fsock-mini-input {
          width: 100%;
          font-size: 11px;
        }
        .fsock-loading-bar {
          background-color: #0479C0;
          color: white;
          font-family: tahoma;
          font-weight: bold;
          font-size: 10px;
          width: 148px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px auto;
        }
        .fsock-send-btn {
          background-color: #f0f0f0;
          border: 1px solid #999;
          padding: 2px 10px;
          cursor: pointer;
        }
        .fsock-space-sending {
          background-color: #269abc;
          border-radius: 4px;
          width: 50%;
          margin: 20px auto;
          color: white;
        }
        .fsock-space-summary {
          padding: 5px;
          cursor: pointer;
          font-weight: bold;
          text-align: center;
          list-style: none;
        }
        .fsock-space-body {
          padding: 10px;
        }
        .fsock-result-area {
          text-align: left;
          font-family: monospace;
          font-size: 12px;
          margin-top: 20px;
          word-break: break-all;
        }
      `}</style>

      <fieldset className="fsock-fieldset">
        <table className="fsock-main-table">
          <tbody>
            <tr className="fsock-header-row">
              <td className="fsock-blue-header">
                <h2>FAST MAILER (ESP/SERVER)</h2>
              </td>
              <td className="fsock-top-center">
                From Email Address
                <img
                  src="/help.png"
                  style={{ height: "25px", float: "right" }}
                  alt="help"
                />
                <br />
                <input
                  type="text"
                  name="from_email"
                  value={formData.from_email}
                  onChange={handleInputChange}
                />
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
                <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                  RESULT:
                </div>
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
                        <div style={{ marginTop: "5px" }}>
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
                        <div style={{ marginTop: "5px" }}>
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
                      <td
                        className="fsock-label"
                        style={{ verticalAlign: "top" }}
                      >
                        Body
                      </td>
                      <td className="fsock-input-group">
                        <textarea
                          name="message_html"
                          className="fsock-body-html"
                          placeholder="Put HTML here"
                          value={formData.message_html}
                          onChange={handleInputChange}
                        />
                        <br />
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
                      <td colSpan={2}>
                        <table className="fsock-mini-table">
                          <tbody>
                            <tr>
                              <td style={{ width: "80px" }}>
                                <b>Offer Id :</b>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="offerId"
                                  className="fsock-mini-input"
                                  placeholder="Put Offer Id"
                                  value={formData.offerId}
                                  onChange={handleInputChange}
                                />
                              </td>
                              <td style={{ width: "20px" }}></td>
                              <td colSpan={2}></td>
                            </tr>
                            <tr>
                              <td colSpan={5} style={{ height: "5px" }}></td>
                            </tr>
                            <tr>
                              <td>
                                <b>Datafile :</b>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="datafile"
                                  className="fsock-mini-input"
                                  placeholder="Put DataFile Name"
                                  value={formData.datafile}
                                  onChange={handleInputChange}
                                />
                              </td>
                              <td></td>
                              <td
                                style={{
                                  width: "60px",
                                  textAlign: "right",
                                  paddingRight: "5px",
                                }}
                              >
                                <b>MsgId :</b>
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
                              <td colSpan={5} style={{ height: "5px" }}></td>
                            </tr>
                            <tr>
                              <td>
                                <b>Total :</b>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="total_limit"
                                  className="fsock-mini-input"
                                  placeholder="Put Total Sending Limit"
                                  value={formData.total_limit}
                                  onChange={handleInputChange}
                                />
                              </td>
                              <td></td>
                              <td
                                style={{
                                  textAlign: "right",
                                  paddingRight: "5px",
                                }}
                              >
                                <b>Limit :</b>
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
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center" }}>
                        {isLoading && (
                          <div className="fsock-loading-bar">Sending ...</div>
                        )}
                        <div style={{ marginTop: "10px" }}>
                          <button
                            className="fsock-send-btn"
                            style={{ padding: "4px 20px" }}
                            onClick={() => handleAction("send")}
                            disabled={isLoading}
                          >
                            Send
                          </button>
                          &nbsp;&nbsp;
                          <button
                            className="fsock-send-btn"
                            style={{ padding: "4px 20px" }}
                            onClick={() => handleAction("get_link")}
                            disabled={isLoading}
                          >
                            Get Link
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

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
                              style={{ width: "100%" }}
                              placeholder="Interval Time"
                              value={formData.interval}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="fsock-send-btn"
                              onClick={displayStart}
                              disabled={!!intervalId}
                            >
                              Start
                            </button>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <button
                              className="fsock-send-btn"
                              style={{
                                backgroundColor: "#d9534f",
                                color: "white",
                                borderColor: "#d43f3a",
                              }}
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
      </fieldset>
    </div>
  );
};

export default FsockManual;
