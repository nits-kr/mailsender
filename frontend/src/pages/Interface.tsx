import React, { useState, useEffect } from "react";
import "./Interface.css";
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetDefaultIpsQuery,
  useSendEmailMutation,
} from "../store/apiSlice";

const Interface = () => {
  const [formData, setFormData] = useState({
    // Main Headers
    accs: "", // IPs in sidebar (maps to mutidomains)
    headers: "", // Additional Header
    from_email: "", // From Email Address (PHP: ip)
    subject: "", // Subject
    subject_enc: "reset", // Subject Encoding (UTF8-Q/B)
    from_name: "", // From Name (PHP: from_val)
    from_enc: "reset", // From Name Encoding
    emails: "", // Test Emails
    msg_type: "html", // Plain/Html/MIME (PHP: type)

    // Config group (Settings)
    data_file: "", // Data File
    total_send: "", // Total Send (limit)
    limit_to_send: "", // Limit to Send (ls)
    sleep_time: "", // Sleep Time (sp)
    offer_id: "", // Offer ID
    template_name: "", // Template Name (name)
    domain: "", // Domain
    wait_time: "2", // Wait Time
    message_id: "", // Message ID (msid)
    inb_pattern: "1", // Inbox Pattern (inbpatt)
    restart_choice: "YES", // Restart Choice (res_choice)
    script_choice: "", // Script Mail Choice (mail_ch)
    relay_percent: "", // Relay Percent (relayp)
    inbox_percent: "", // Inbox Percent (inb)
    times_to_send: "1", // Times to Send (times)
    mail_after: "", // Mail After Every (mail_per)
    reply_to: "0", // Reply To
    xmailer: "0", // X-Mailer
    interval_time: "", // Space Sending interval (PHP: interval_time)

    // Content
    charset: "UTF-8",
    encoding: "8bit",
    message_html: "", // Main Message
    charset_alt: "UTF-8",
    encoding_alt: "8bit",
    message_plain: "", // MIME Message (textm)
    search_replace: "", // Search/Replace

    // Modes
    mode: "test", // test/bulk
    sen_t: "manual", // manual/auto
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>("");

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

  // Fetch default IPs from MySQL (mumara table) on mount
  const { data: defaultIpsData } = useGetDefaultIpsQuery();

  useEffect(() => {
    if (defaultIpsData?.ips && !formData.accs) {
      setFormData((prev) => ({ ...prev, accs: defaultIpsData.ips }));
    }
  }, [defaultIpsData]);

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

    // Map campaign fields to our detailed form state with 100% parity
    setFormData((prev) => ({
      ...prev,
      // Main Headers & Content
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

      // Settings Grid
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
      relay_percent: campaignDetail.relay_percent || "",
      inbox_percent: campaignDetail.inbox_percent || "",
      times_to_send: campaignDetail.times_to_send || "1",
      mail_after: campaignDetail.mail_after || "",
      reply_to: campaignDetail.reply_to || "0",
      xmailer: campaignDetail.xmailer || "0",
      interval_time: campaignDetail.interval_time || "",

      // Charsets / Encodings
      charset: campaignDetail.charset || "UTF-8",
      encoding: campaignDetail.encoding || "8bit",
      charset_alt: campaignDetail.charset_alt || "UTF-8",
      encoding_alt: campaignDetail.encoding_alt || "8bit",

      // Modes
      mode: campaignDetail.mode || "test",
      sen_t: campaignDetail.sen_t || "manual",
    }));
  };

  const [sendEmailMutation] = useSendEmailMutation();

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    // Handle radio buttons and strings
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // Map our detailed state to what the backend expects
      const payload = {
        ...formData,
        mailing_ip: formData.accs, // Backend expects mailing_ip
      };

      const result = await sendEmailMutation(payload).unwrap();
      alert("Success: " + (result.message || "Email queued"));
      setStatus("Last sent: " + new Date().toLocaleTimeString());
    } catch (error: any) {
      alert("Error: " + (error?.data?.message || "Send failed"));
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
        </div>
        <div className="nav-right-btns">
          <button className="guide-btn">Guide</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Main Interface Form */}
      <div className="legacy-form-container">
        {/* Left Sidebar (Curvy) */}
        <div className="sidebar-left">
          <h3>ADMIN</h3>
          <textarea
            name="accs"
            className="ips-textarea"
            placeholder="Put IP's Here (IP|From-Email)"
            value={formData.accs}
            onChange={handleInput}
          />
        </div>

        {/* Content Right */}
        <div className="content-right">
          {/* Floating Right Panel (Toggles & Settings) */}
          <div className="floating-right-panel">
            <div className="toggle-group">
              <button
                className={`toggle-btn blue-toggle ${formData.mode === "test" ? "active" : ""}`}
                onClick={() => setFormData((p) => ({ ...p, mode: "test" }))}
              >
                Test
              </button>
              <button
                className={`toggle-btn blue-toggle ${formData.mode === "bulk" ? "active" : ""}`}
                onClick={() => setFormData((p) => ({ ...p, mode: "bulk" }))}
              >
                Bulk
              </button>
            </div>

            <div className="toggle-group">
              <button
                className={`toggle-btn ${formData.sen_t === "manual" ? "active" : ""}`}
                onClick={() => setFormData((p) => ({ ...p, sen_t: "manual" }))}
              >
                Manual
              </button>
              <button
                className={`toggle-btn blue-toggle ${formData.sen_t === "auto" ? "active" : ""}`}
                onClick={() => setFormData((p) => ({ ...p, sen_t: "auto" }))}
              >
                Auto
              </button>
            </div>

            {/* Settings Section */}
            <details className="legacy-details">
              <summary className="menu-btn">▼ Settings</summary>
              <div className="settings-grid">
                <div className="settings-row">
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
                <div className="settings-row">
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
                <div className="settings-row">
                  <input
                    name="offer_id"
                    placeholder="Offer ID"
                    title="Offer ID"
                    value={formData.offer_id}
                    onChange={handleInput}
                  />
                  <input
                    name="template_name"
                    placeholder="Template Name"
                    title="Template Name"
                    value={formData.template_name}
                    onChange={handleInput}
                  />
                </div>
                <div className="settings-row">
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
                <div className="settings-row">
                  <input
                    name="message_id"
                    placeholder="Message ID"
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
                <div className="settings-row">
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
                <div className="settings-row">
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
                <div className="settings-row">
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
                <div className="settings-row">
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

            {/* Space Sending Section */}
            <details className="legacy-details">
              <summary className="menu-btn">▼ Space Sending</summary>
              <div className="space-sending-box">
                <div className="interval-control">
                  <input
                    name="interval_time"
                    placeholder="Interval Time"
                    title="Interval Time"
                    type="number"
                    value={formData.interval_time}
                    onChange={handleInput}
                  />
                  <button className="start-btn">Start</button>
                  <button className="stop-btn">Stop</button>
                </div>
              </div>
            </details>
          </div>

          {/* Main Form Content */}
          <div style={{ maxWidth: "650px" }}>
            <div className="legacy-form-group">
              <textarea
                name="headers"
                className="legacy-textarea"
                rows={4}
                placeholder="Additional Header"
                value={formData.headers}
                onChange={handleInput}
              />
            </div>

            <div className="legacy-form-group" style={{ maxWidth: "300px" }}>
              <input
                name="from_email"
                className="legacy-input"
                placeholder="From Email Address"
                value={formData.from_email}
                onChange={handleInput}
              />
            </div>

            <div className="legacy-form-group">
              <input
                name="subject"
                className="legacy-input"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInput}
              />
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="subject_enc"
                    value="ascii"
                    checked={formData.subject_enc === "ascii"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-Q
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="subject_enc"
                    value="base64"
                    checked={formData.subject_enc === "base64"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-B
                </label>
                <label className="radio-item">
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

            <div className="legacy-form-group">
              <input
                name="from_name"
                className="legacy-input"
                placeholder="From Name"
                value={formData.from_name}
                onChange={handleInput}
              />
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="from_enc"
                    value="ascii"
                    checked={formData.from_enc === "ascii"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-Q
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="from_enc"
                    value="base64"
                    checked={formData.from_enc === "base64"}
                    onChange={handleInput}
                  />{" "}
                  UTF8-B
                </label>
                <label className="radio-item">
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

            <div className="legacy-form-group">
              <textarea
                name="emails"
                className="legacy-textarea"
                rows={5}
                placeholder="demo@demo.com"
                value={formData.emails}
                onChange={handleInput}
              />
            </div>

            <div
              className="legacy-form-group"
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              <div className="radio-group" style={{ marginTop: 0 }}>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="msg_type"
                    value="plain"
                    checked={formData.msg_type === "plain"}
                    onChange={handleInput}
                  />{" "}
                  Plain
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="msg_type"
                    value="html"
                    checked={formData.msg_type === "html"}
                    onChange={handleInput}
                  />{" "}
                  Html
                </label>
                <label className="radio-item">
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
              <div className="action-row">
                <button className="preview-btn" onClick={handlePreview}>
                  Preview
                </button>
                <button className="editor-btn" onClick={handleEditor}>
                  EDITOR
                </button>
              </div>
            </div>

            <div className="select-row">
              <select
                name="charset"
                className="legacy-select"
                value={formData.charset}
                onChange={handleInput}
              >
                <option value="UTF-8">UTF-8</option>
                <option value="us-ascii">US-ASCII</option>
                <option value="iso-8859-1">ISO-8859-1</option>
                <option value="windows-1251">WINDOWS-1251</option>
              </select>
              <span>;</span>
              <select
                name="encoding"
                className="legacy-select"
                value={formData.encoding}
                onChange={handleInput}
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
                name="message_html"
                className="legacy-textarea"
                rows={10}
                placeholder="Message"
                value={formData.message_html}
                onChange={handleInput}
              />
            </div>

            <div className="select-row">
              <select
                name="charset_alt"
                className="legacy-select"
                value={formData.charset_alt}
                onChange={handleInput}
              >
                <option value="UTF-8">UTF-8</option>
                <option value="us-ascii">US-ASCII</option>
                <option value="iso-8859-1">ISO-8859-1</option>
                <option value="windows-1251">WINDOWS-1251</option>
              </select>
              <span>;</span>
              <select
                name="encoding_alt"
                className="legacy-select"
                value={formData.encoding_alt}
                onChange={handleInput}
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
                name="message_plain"
                className="legacy-textarea"
                rows={4}
                placeholder="MIME Message"
                value={formData.message_plain}
                onChange={handleInput}
              />
            </div>

            <div className="legacy-form-group">
              <textarea
                name="search_replace"
                className="legacy-textarea"
                rows={4}
                placeholder="Search@|replace"
                value={formData.search_replace}
                onChange={handleInput}
              />
            </div>

            <div className="send-container">
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "SENDING..." : "SEND"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interface;
