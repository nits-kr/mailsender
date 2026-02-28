import React from "react";
import "./SmtpTester.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Eye,
} from "lucide-react";

const smtpTesterSchema = z.object({
  ip: z
    .string()
    .min(1, "Server IP / Setup is required")
    .regex(
      /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid format (Requires IP, Domain, or Email)",
    ),
  server: z.string().min(1, "Server is required"),
  port: z.string().min(1, "Port is required"),
  tls: z.enum(["No", "Yes"]),
  usr: z.string().optional(),
  pass: z.string().optional(),
  from: z.string().min(1, "From Name is required"),
  sub: z.string().min(1, "Subject is required"),
  emails: z.string().min(1, "At least one test email is required"),
  message: z.string().min(1, "Message body cannot be empty"),
});

type SmtpTesterFormData = z.infer<typeof smtpTesterSchema>;

const SmtpTester = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SmtpTesterFormData>({
    resolver: zodResolver(smtpTesterSchema),
    defaultValues: {
      port: "587",
      tls: "No",
      usr: "",
      pass: "",
      ip: "",
      from: "",
      sub: "",
      emails: "",
      message: "",
      server: "",
    },
  });

  const [testSmtp, { isLoading, data, error }] = useTestSmtpMutation();

  const handlePreview = () => {
    const htmlContent = getValues("message");
    const newWindow = window.open("", "Preview", "width=800,height=600");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const onSend: SubmitHandler<SmtpTesterFormData> = async (formData) => {
    try {
      await testSmtp(formData).unwrap();
    } catch (err) {
      console.error("Failed to send SMTP test:", err);
    }
  };

  return (
    <div className="smtp-wrapper">
      <div className="smtp-card">
        <form onSubmit={handleSubmit(onSend)}>
          <div className="smtp-header">
            <div className="smtp-header-title">
              <div className="icon-circle">
                <Send size={28} color="white" />
              </div>
              <h2>SMTP Tester Suite</h2>
            </div>

            <div className={`ip-group ${errors.ip ? "has-error" : ""}`}>
              <span className="ip-label">
                <Globe size={16} /> Server IP
              </span>
              <input
                type="text"
                className="ip-input"
                placeholder="From Email Setup / IP Address"
                {...register("ip")}
              />
              {errors.ip && (
                <div className="ip-error-tooltip">{errors.ip.message}</div>
              )}
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
                    type="text"
                    className={`form-input ${errors.server ? "invalid-input" : ""}`}
                    placeholder="mail.example.com"
                    {...register("server")}
                  />
                  {errors.server && (
                    <div className="smtp-error-msg">
                      {errors.server.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    type="text"
                    className={`form-input ${errors.port ? "invalid-input" : ""}`}
                    placeholder="587"
                    {...register("port")}
                  />
                  {errors.port && (
                    <div className="smtp-error-msg">{errors.port.message}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">TLS/SSL</label>
                  <select className="form-select" {...register("tls")}>
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
                  type="text"
                  className={`form-input ${errors.usr ? "invalid-input" : ""}`}
                  placeholder="user@example.com"
                  {...register("usr")}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={16} /> Password
                </label>
                <input
                  type="password"
                  className={`form-input ${errors.pass ? "invalid-input" : ""}`}
                  placeholder="••••••••"
                  {...register("pass")}
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
                    className={`form-input ${errors.from ? "invalid-input" : ""}`}
                    placeholder="Display Name"
                    {...register("from")}
                  />
                  {errors.from && (
                    <div className="smtp-error-msg">{errors.from.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className={`form-input ${errors.sub ? "invalid-input" : ""}`}
                    placeholder="Test Email Subject"
                    {...register("sub")}
                  />
                  {errors.sub && (
                    <div className="smtp-error-msg">{errors.sub.message}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Test Emails (Recipients)</label>
                <textarea
                  className={`form-textarea ${errors.emails ? "invalid-input" : ""}`}
                  placeholder="recipient1@domain.com&#10;recipient2@domain.com"
                  {...register("emails")}
                />
                {errors.emails && (
                  <div className="smtp-error-msg">{errors.emails.message}</div>
                )}
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
                  className={`form-textarea body-textarea ${errors.message ? "invalid-input" : ""}`}
                  placeholder="Write your email content here (HTML supported depending on mailer)..."
                  {...register("message")}
                />
                {errors.message && (
                  <div className="smtp-error-msg">{errors.message.message}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: "15px", marginTop: "auto" }}>
                <button
                  type="button"
                  className="btn-send btn-preview"
                  onClick={handlePreview}
                >
                  <Eye size={20} /> Preview
                </button>
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
              </div>

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
