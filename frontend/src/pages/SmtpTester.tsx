import React, { useState } from "react";
import { useTestSmtpMutation } from "../store/apiSlice";
import {
  Send,
  Server,
  Mail,
  Lock,
  Shield,
  AtSign,
  AlignLeft,
  Globe,
  Loader2,
} from "lucide-react";

const SmtpTester = () => {
  const [formData, setFormData] = useState({
    server: "",
    port: "587",
    usr: "",
    pass: "",
    tls: "No",
    ip: "", // From Email Address
    from: "", // From Name
    sub: "",
    emails: "", // Test Email addresses
    message: "",
  });

  const [testSmtp, { isLoading, data, error }] = useTestSmtpMutation();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await testSmtp(formData).unwrap();
    } catch (err) {
      console.error("Failed to send SMTP test:", err);
    }
  };

  return (
    <div className="smtp-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .smtp-wrapper {
          min-height: calc(100vh - 60px);
          background: linear-gradient(135deg, #f3f6f9 0%, #e5ebf1 100%);
          padding: 40px 20px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #2d3748;
          display: flex;
          justify-content: center;
        }

        .smtp-card {
          width: 100%;
          max-width: 1100px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .smtp-header {
          background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%);
          padding: 30px 40px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .smtp-header::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
          pointer-events: none;
        }

        .smtp-header-title {
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 1;
        }

        .smtp-header h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .icon-circle {
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }

        .ip-group {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 1;
          transition: all 0.3s ease;
        }

        .ip-group:focus-within {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.1);
        }

        .ip-label {
          font-size: 13px;
          color: #a0aec0;
          margin-right: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ip-input {
          background: transparent;
          border: none;
          color: white;
          font-size: 15px;
          outline: none;
          width: 250px;
          font-weight: 500;
        }
        
        .ip-input::placeholder { color: rgba(255,255,255,0.4); }

        .smtp-body {
          display: flex;
          padding: 40px;
          gap: 50px;
        }

        .smtp-sidebar {
          width: 340px;
          flex-shrink: 0;
        }

        .smtp-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::after {
          content: '';
          flex-grow: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }

        .form-label svg {
          color: #718096;
        }

        .inp-container {
          position: relative;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: #f7fafc;
          border: 1px solid #cbd5e0;
          border-radius: 10px;
          font-size: 15px;
          color: #2d3748;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3182ce;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.5;
        }
        
        .body-textarea {
          min-height: 250px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .btn-send {
          background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(49, 130, 206, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: auto;
        }

        .btn-send:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
        }

        .btn-send:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-send:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          box-shadow: none;
        }

        .log-container {
          margin-top: 30px;
          background: #1a202c;
          border-radius: 12px;
          padding: 20px;
          color: #68d391;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          max-height: 350px;
          overflow-y: auto;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
          border: 1px solid #2d3748;
          line-height: 1.6;
        }

        .log-error {
          color: #fc8181;
        }
        
        .log-success-msg {
          color: #48bb78;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #2d3748;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
        }
        
        .log-error-msg {
          color: #e53e3e;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #2d3748;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
        }

        /* Custom Scrollbar */
        .log-container::-webkit-scrollbar {
          width: 8px;
        }
        .log-container::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        .log-container::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        .log-container::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }

        @media (max-width: 900px) {
          .smtp-body { flex-direction: column; gap: 30px; }
          .smtp-sidebar { width: 100%; }
          .smtp-header { flex-direction: column; gap: 20px; align-items: flex-start; }
          .ip-group { width: 100%; box-sizing: border-box; }
          .ip-input { width: 100%; }
        }
      `}</style>

      <div className="smtp-card">
        <form onSubmit={handleSubmit}>
          <div className="smtp-header">
            <div className="smtp-header-title">
              <div className="icon-circle">
                <Send size={28} color="white" />
              </div>
              <h2>SMTP Tester Suite</h2>
            </div>

            <div className="ip-group">
              <span className="ip-label">
                <Globe size={16} /> Server IP
              </span>
              <input
                type="text"
                name="ip"
                value={formData.ip}
                onChange={handleInputChange}
                className="ip-input"
                placeholder="From Email Setup / IP Address"
              />
            </div>
          </div>

          <div className="smtp-body">
            {/* Sidebar Configurations */}
            <div className="smtp-sidebar">
              <div className="section-title">
                <Server size={20} /> Credentials
              </div>

              <div className="form-group">
                <label className="form-label">Server</label>
                <div className="inp-container">
                  <input
                    name="server"
                    type="text"
                    value={formData.server}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="mail.example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    name="port"
                    type="text"
                    value={formData.port}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="587"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">TLS/SSL</label>
                  <select
                    name="tls"
                    value={formData.tls}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} /> Username
                </label>
                <input
                  name="usr"
                  type="text"
                  value={formData.usr}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={16} /> Password
                </label>
                <input
                  name="pass"
                  type="password"
                  value={formData.pass}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="smtp-main">
              <div className="section-title">
                <Mail size={20} /> Email Content
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <AtSign size={16} /> From Name
                  </label>
                  <input
                    type="text"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Display Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="sub"
                    value={formData.sub}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Test Email Subject"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Test Emails (Recipients)</label>
                <textarea
                  name="emails"
                  value={formData.emails}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="recipient1@domain.com&#10;recipient2@domain.com"
                />
              </div>

              <div
                className="form-group"
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label className="form-label">
                  <AlignLeft size={16} /> Message Body
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea body-textarea"
                  placeholder="Write your email content here (HTML supported depending on mailer)..."
                />
              </div>

              <button type="submit" className="btn-send" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />{" "}
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send size={20} /> Dispatch Email
                  </>
                )}
              </button>

              {/* Execution Logs Area */}
              {(data || error) && (
                <div className="log-container">
                  {data && (
                    <>
                      <div className="log-success-msg">
                        ✓{" "}
                        {data.message ||
                          "SMTP Connection & Transmission Successful"}
                      </div>
                      <div>{data.logs}</div>
                    </>
                  )}
                  {error && (
                    <>
                      <div className="log-error-msg">
                        ⚠️ Failed to transmit email via SMTP
                      </div>
                      <div className="log-error">
                        {/* Ensure we safely render the error output */}
                        {typeof (error as any)?.data?.logs === "string"
                          ? (error as any).data.logs
                          : JSON.stringify(error, null, 2)}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmtpTester;
