import React, { useState, useEffect } from "react";
import "./Interface.css";
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useSendEmailMutation,
} from "../store/apiSlice";

const Interface = () => {
  const [formData, setFormData] = useState({
    campaign_id: "",
    from_name: "",
    from_email: "",
    subject: "",
    body: "",
    smtp_id: "",
    data_file: "",
    send_count: 100,
    interval: 60,
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  // Fetch all campaigns
  const { data: campaigns = [] } = useGetCampaignsQuery();

  // Fetch campaign details when one is selected (skip when none selected)
  const { data: campaignDetail } = useGetCampaignByIdQuery(selectedCampaignId, {
    skip: !selectedCampaignId,
  });

  // When campaign detail loads, populate the form
  useEffect(() => {
    if (campaignDetail) {
      setFormData((prev) => ({
        ...prev,
        from_name: campaignDetail.from_name || "",
        from_email: campaignDetail.from_email || "",
        subject: campaignDetail.subject || "",
        body: campaignDetail.body || "",
        smtp_id: campaignDetail.smtp_id || "",
        data_file: campaignDetail.data_file || "",
      }));
    }
  }, [campaignDetail]);

  const [sendEmail] = useSendEmailMutation();

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const data = await sendEmail(formData).unwrap();
      if (!intervalId) alert("Success: " + data.message);
      setStatus("Last sent: " + new Date().toLocaleTimeString());
    } catch (error: any) {
      alert("Error: " + (error?.data?.message || "Send failed"));
      clearInterval(intervalId);
      setIntervalId(null);
      setSending(false);
    } finally {
      setSending(false);
    }
  };

  const handleStartInterval = () => {
    const ms = (formData.interval || 60) * 1000;
    const id = setInterval(handleSend, ms);
    setIntervalId(id);
    handleSend();
  };

  const handleStopInterval = () => {
    clearInterval(intervalId);
    setIntervalId(null);
    setSending(false);
    setStatus("Stopped");
  };

  return (
    <div className="interface-container">
      <div className="interface-header">
        <h2>Email Interface</h2>
        {status && <span className="status-badge">{status}</span>}
      </div>

      <div className="interface-grid">
        <div className="form-group">
          <label>Campaign</label>
          <select
            name="campaign_id"
            value={selectedCampaignId}
            onChange={(e) => {
              setSelectedCampaignId(e.target.value);
              setFormData((p) => ({ ...p, campaign_id: e.target.value }));
            }}
          >
            <option value="">-- Select Campaign --</option>
            {campaigns.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>From Name</label>
          <input
            name="from_name"
            value={formData.from_name}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>From Email</label>
          <input
            name="from_email"
            value={formData.from_email}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>Subject</label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleInput}
          />
        </div>

        <div className="form-group full-width">
          <label>Body</label>
          <textarea
            name="body"
            rows={8}
            value={formData.body}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>SMTP ID</label>
          <input
            name="smtp_id"
            value={formData.smtp_id}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>Data File</label>
          <input
            name="data_file"
            value={formData.data_file}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>Send Count</label>
          <input
            type="number"
            name="send_count"
            value={formData.send_count}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>Interval (seconds)</label>
          <input
            type="number"
            name="interval"
            value={formData.interval}
            onChange={handleInput}
          />
        </div>
      </div>

      <div className="interface-actions">
        <button onClick={handleSend} disabled={sending} className="btn-primary">
          {sending ? "Sending..." : "Send Now"}
        </button>
        {!intervalId ? (
          <button onClick={handleStartInterval} className="btn-success">
            Start Auto Send
          </button>
        ) : (
          <button onClick={handleStopInterval} className="btn-danger">
            Stop Auto Send
          </button>
        )}
      </div>
    </div>
  );
};

export default Interface;
