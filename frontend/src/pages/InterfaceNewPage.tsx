import React, { useState, useEffect } from "react";
import "./InterfaceNewPage.css";
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetDefaultIpsQuery,
  useSendEmailMutation,
  useGetCampaignLogsQuery,
} from "../store/apiSlice";

export const InterfaceNewPage = () => {
  const [formData, setFormData] = useState({
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
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [pollLogs, setPollLogs] = useState(false);

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
      setFormData((prev) => ({ ...prev, accs: defaultIpsData.ips }));
    }
  }, [defaultIpsData]);

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

    setFormData((prev) => ({
      ...prev,
      accs: campaignDetail.accs || prev.accs,
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
    }));

    setActiveCampaignId(selectedCampaignId);
    setPollLogs(false);
  };

  const [sendEmailMutation] = useSendEmailMutation();

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async () => {
    setSending(true);
    setStatus("Sending...");
    try {
      const payload = {
        ...formData,
        mailing_ip: formData.accs,
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
          <button className="btn-nav-new guide">Guide</button>
          <button className="btn-nav-new logout">Logout</button>
        </div>
      </div>

      <div className="register-main">
        {/* Left Sidebar */}
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
              className="ips-textarea-new"
              name="accs"
              style={{ height: "200px", margin: 0 }}
              placeholder=""
              value={formData.accs}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Right Content */}
        <div className="register-right">
          {/* Floating Right Panel (Toggles & Settings) */}
          <div className="floating-right-panel-new">
            <div className="toggle-group-new-con">
              <div className="toggle-group-new">
                <input
                  type="radio"
                  id="test-mode"
                  name="mode"
                  value="test"
                  className="mode-test"
                  checked={formData.mode === "test"}
                  onChange={handleInput}
                />
                <label htmlFor="test-mode">Test</label>
                <input
                  type="radio"
                  id="bulk-mode"
                  name="mode"
                  value="bulk"
                  className="mode-bulk"
                  checked={formData.mode === "bulk"}
                  onChange={handleInput}
                />
                <label htmlFor="bulk-mode">Bulk</label>
              </div>

              <div className="toggle-group-new">
                <input
                  type="radio"
                  id="manual-sen"
                  name="sen_t"
                  value="manual"
                  className="sen-manual"
                  checked={formData.sen_t === "manual"}
                  onChange={handleInput}
                />
                <label htmlFor="manual-sen">Manual</label>
                <input
                  type="radio"
                  id="auto-sen"
                  name="sen_t"
                  value="auto"
                  className="sen-auto"
                  checked={formData.sen_t === "auto"}
                  onChange={handleInput}
                />
                <label htmlFor="auto-sen">Auto</label>
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="settings-panel-new">
              <details className="legacy-details-new">
                <summary className="settings-header-new">▼ Settings</summary>
                <div className="settings-grid-new">
                  <div className="settings-row-new">
                    <input
                      name="data_file"
                      placeholder="Data File"
                      title="Data File"
                      value={formData.data_file}
                      onChange={handleInput}
                    />
                    <input
                      name="total_send"
                      placeholder="Total Send"
                      title="Total Send"
                      value={formData.total_send}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="limit_to_send"
                      placeholder="Limit_to_Send"
                      title="Limit_to_Send"
                      value={formData.limit_to_send}
                      onChange={handleInput}
                    />
                    <input
                      name="sleep_time"
                      placeholder="Sleep Time"
                      title="Sleep Time"
                      value={formData.sleep_time}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="offer_id"
                      placeholder="Offer ID"
                      title="Offer ID"
                      value={formData.offer_id}
                      onChange={handleInput}
                    />
                    <input
                      name="template_name"
                      placeholder="Template"
                      title="Template Name"
                      value={formData.template_name}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="domain"
                      placeholder="Domain"
                      title="Domain"
                      value={formData.domain}
                      onChange={handleInput}
                    />
                    <select
                      name="wait_time"
                      title="Wait Time"
                      value={formData.wait_time}
                      onChange={handleInput}
                    >
                      <option value="2">Wait Time</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="message_id"
                      placeholder="Msg ID"
                      title="Message ID"
                      value={formData.message_id}
                      onChange={handleInput}
                    />
                    <select
                      name="inb_pattern"
                      title="Inbox Pattern"
                      value={formData.inb_pattern}
                      onChange={handleInput}
                    >
                      <option value="1">Inbox Pattern</option>
                      <option value="1">Pattern 1</option>
                      <option value="2">Pattern 2</option>
                    </select>
                  </div>
                  <div className="settings-row-new">
                    <select
                      name="restart_choice"
                      title="Restart_Choice"
                      value={formData.restart_choice}
                      onChange={handleInput}
                    >
                      <option value="YES">Restart_Choice</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                    <input
                      name="script_choice"
                      placeholder="Script_Mail_Choice"
                      title="Script_Mail_Choice"
                      value={formData.script_choice}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="relay_percent"
                      placeholder="Relay Percent"
                      title="Relay Percent"
                      value={formData.relay_percent}
                      onChange={handleInput}
                    />
                    <input
                      name="inbox_percent"
                      placeholder="Inbox Percent"
                      title="Inbox Percent"
                      value={formData.inbox_percent}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <input
                      name="times_to_send"
                      placeholder="Times_To_Send"
                      title="Times_To_Send"
                      value={formData.times_to_send}
                      onChange={handleInput}
                    />
                    <input
                      name="mail_after"
                      placeholder="Mail_After_Every"
                      title="Mail_After_Every"
                      value={formData.mail_after}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="settings-row-new">
                    <select
                      name="reply_to"
                      title="Reply to"
                      value={formData.reply_to}
                      onChange={handleInput}
                    >
                      <option value="0">Reply to</option>
                      <option value="1">YES</option>
                      <option value="0">NO</option>
                    </select>
                    <select
                      name="xmailer"
                      title="XMAILER"
                      value={formData.xmailer}
                      onChange={handleInput}
                    >
                      <option value="0">XMAILER</option>
                      <option value="1">YES</option>
                      <option value="0">NO</option>
                    </select>
                  </div>
                </div>
              </details>

              <details className="legacy-details-new">
                <summary className="settings-header-new">
                  ▼ Space Sending
                </summary>
                <div className="space-sending-box-new">
                  <div className="interval-control-new">
                    <input
                      type="number"
                      name="interval_time"
                      placeholder="Interval Time"
                      title="Interval Time"
                      value={formData.interval_time}
                      onChange={handleInput}
                    />
                    <button className="btn-start-new">Start</button>
                    <button className="btn-stop-new">Stop</button>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Main Form Fields */}
          <div className="main-form-content-new">
            <textarea
              className="input-field-new"
              name="headers"
              placeholder="Additional Header"
              rows={3}
              value={formData.headers}
              onChange={handleInput}
            />

            <input
              className="input-field-new"
              name="from_email"
              placeholder="From Email Address"
              value={formData.from_email}
              onChange={handleInput}
            />

            <div className="field-row-enc-new">
              <input
                className="input-field-new"
                name="subject"
                style={{ marginBottom: "5px" }}
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInput}
              />
              <div className="enc-radios-new">
                <label>
                  <input
                    type="radio"
                    name="subject_enc"
                    value="ascii"
                    checked={formData.subject_enc === "ascii"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-Q
                </label>
                <label>
                  <input
                    type="radio"
                    name="subject_enc"
                    value="base64"
                    checked={formData.subject_enc === "base64"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-B
                </label>
                <label>
                  <input
                    type="radio"
                    name="subject_enc"
                    value="reset"
                    checked={formData.subject_enc === "reset"}
                    onChange={handleInput}
                  />{" "}
                  RESET
                </label>
              </div>
            </div>

            <div className="field-row-enc-new">
              <input
                className="input-field-new"
                name="from_name"
                style={{ marginBottom: "5px" }}
                placeholder="From Name"
                value={formData.from_name}
                onChange={handleInput}
              />
              <div className="enc-radios-new">
                <label>
                  <input
                    type="radio"
                    name="from_enc"
                    value="ascii"
                    checked={formData.from_enc === "ascii"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-Q
                </label>
                <label>
                  <input
                    type="radio"
                    name="from_enc"
                    value="base64"
                    checked={formData.from_enc === "base64"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-B
                </label>
                <label>
                  <input
                    type="radio"
                    name="from_enc"
                    value="reset"
                    checked={formData.from_enc === "reset"}
                    onChange={handleInput}
                  />{" "}
                  RESET
                </label>
              </div>
            </div>

            <textarea
              className="input-field-new"
              name="emails"
              rows={4}
              placeholder="demo@demo.com"
              value={formData.emails}
              onChange={handleInput}
            />

            <div className="msg-type-row-new">
              <div className="type-radios-new">
                <label>
                  <input
                    type="radio"
                    name="msg_type"
                    value="plain"
                    checked={formData.msg_type === "plain"}
                    onChange={handleInput}
                  />{" "}
                  Plain
                </label>
                <label>
                  <input
                    type="radio"
                    name="msg_type"
                    value="html"
                    checked={formData.msg_type === "html"}
                    onChange={handleInput}
                  />{" "}
                  Html
                </label>
                <label>
                  <input
                    type="radio"
                    name="msg_type"
                    value="mime"
                    checked={formData.msg_type === "mime"}
                    onChange={handleInput}
                  />{" "}
                  MIME
                </label>
              </div>
              <div className="action-btns-new">
                <button
                  className="btn-action-new preview"
                  onClick={handlePreview}
                >
                  Preview
                </button>
                <button className="btn-action-new editor">EDITOR</button>
              </div>
            </div>

            <div className="charset-row-new">
              <select
                name="charset"
                value={formData.charset}
                onChange={handleInput}
              >
                <option value="UTF-8">UTF-8</option>
              </select>
              <span> ; </span>
              <select
                name="encoding"
                value={formData.encoding}
                onChange={handleInput}
              >
                <option value="8bit">8bit</option>
                <option value="base64">base64</option>
              </select>
            </div>

            <textarea
              className="input-field-new"
              name="message_html"
              rows={6}
              placeholder="Message"
              value={formData.message_html}
              onChange={handleInput}
            />

            <div className="charset-row-new">
              <select
                name="charset_alt"
                value={formData.charset_alt}
                onChange={handleInput}
              >
                <option value="UTF-8">UTF-8</option>
              </select>
              <span> ; </span>
              <select
                name="encoding_alt"
                value={formData.encoding_alt}
                onChange={handleInput}
              >
                <option value="8bit">8bit</option>
              </select>
            </div>

            <textarea
              className="input-field-new"
              name="message_plain"
              rows={3}
              placeholder="MIME Messsage"
              value={formData.message_plain}
              onChange={handleInput}
            />

            <textarea
              className="input-field-new"
              name="search_replace"
              placeholder="Search@|replace"
              value={formData.search_replace}
              onChange={handleInput}
            />

            <div className="send-btn-container-new">
              <button
                className="main-send-btn-new"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "SENDING..." : "SEND"}
              </button>
            </div>
            {status && <div className="send-status-new">{status}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// No default export needed
