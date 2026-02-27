import React from "react";
import "./FsockHelp.css";

const FsockHelp = () => {
  return (
    <div className="fsock-help-container">
      <div className="fsock-help-header">
        <h1>Fsock Send SMTP Documentation</h1>
        <p>Reference guide for variables, functions, and email formatting.</p>
      </div>

      <div className="fsock-help-section">
        <h2 className="fsock-help-title">VARIABLES</h2>
        <div className="fsock-help-grid">
          {[
            { tag: "{{SubjectLine}}", desc: "Subject replaced" },
            { tag: "{{FromEmail}}", desc: "From email replaced" },
            { tag: "{{FromName}}", desc: "From name replaced" },
            { tag: "{{Fromdomain}}", desc: "From domain replaced" },
            { tag: "{{Domain}}", desc: "Domain replaced" },
            { tag: "{{HtmlContent}}", desc: "HTML Content replaced" },
            { tag: "{{PlainContent}}", desc: "PLAIN Content replaced" },
            { tag: "{{HtmlContent_base64}}", desc: "Convert HTML to base64" },
            { tag: "{{PlainContent_base64}}", desc: "Convert PLAIN to base64" },
            { tag: "{{HtmlContent_uue}}", desc: "Convert HTML to UUENCODE" },
            { tag: "{{PlainContent_uue}}", desc: "Convert PLAIN to UUENCODE" },
            {
              tag: "{{HtmlContent_qp}}",
              desc: "Convert HTML to quoted-printable",
            },
            {
              tag: "{{PlainContent_qp}}",
              desc: "Convert PLAIN to quoted-printable",
            },
            { tag: "{{boundary}}", desc: "Replace Boundary with actual value" },
            { tag: "{{ToEmail}}", desc: "Replace To Email" },
            { tag: "{{MessageId}}", desc: "Replaced with Message id" },
            { tag: "{{ToName}}", desc: "Replaced With To email name" },
            { tag: "{{ToDomain}}", desc: "Replaced With To email Domain" },
            {
              tag: "((_track_))",
              desc: "Email converted into md5 HASH and replaced",
            },
          ].map((v, i) => (
            <div key={i} className="fsock-help-item">
              <code className="fsock-help-code">{v.tag}</code>
              <span className="fsock-help-desc">{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fsock-help-section">
        <h2 className="fsock-help-title">FUNCTIONS</h2>
        <p className="fsock-help-subtitle">
          (Note: X is arguments in functions)
        </p>
        <div className="fsock-help-grid">
          {[
            { func: "[[ascii2hex(X)]]", desc: "Convert Ascii to Hex" },
            { func: "[[RFC_Date_EST()]]", desc: "Generate EST date into RFC" },
            { func: "[[RFC_Date_UTC()]]", desc: "Generate UTC date into RFC" },
            { func: "[[RFC_Date_EDT()]]", desc: "Generate EDT date into RFC" },
            { func: "[[RFC_Date_IST()]]", desc: "Generate IST date into RFC" },
            { func: "[[num(X)]]", desc: "Generate Random numbers (0-9)" },
            {
              func: "[[smallchar(X)]]",
              desc: "Generate Random Small Char Alphabet",
            },
            {
              func: "[[bigchar(X)]]",
              desc: "Generate Random Big Char Alphabet",
            },
            {
              func: "[[mixsmallbigchar(X)]]",
              desc: "Generate mixed Small/Big Char Alphabet",
            },
            {
              func: "[[mixsmallalphanum(X)]]",
              desc: "Generate mixed Small Char/Numbers",
            },
            {
              func: "[[mixbigalphanum(X)]]",
              desc: "Generate mixed Big Char/Numbers",
            },
            { func: "[[mixall(X)]]", desc: "Generate mixed Small/Big/Numbers" },
            { func: "[[hexdigit(X)]]", desc: "Generate HEX digit" },
          ].map((f, i) => (
            <div key={i} className="fsock-help-item">
              <code className="fsock-help-code">{f.func}</code>
              <span className="fsock-help-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fsock-help-row">
        <div className="fsock-help-section half">
          <h2 className="fsock-help-title">Transfer Encoding</h2>
          <ul className="fsock-help-list">
            <li>1: 7bit</li>
            <li>2: x-uuencode (Comcast)</li>
            <li>3: quoted-printable</li>
            <li>4: base64</li>
            <li>5: 8bit</li>
            <li>6: binary</li>
          </ul>
        </div>
        <div className="fsock-help-section half">
          <h2 className="fsock-help-title">Charset</h2>
          <ul className="fsock-help-list">
            <li>1: UTF-8</li>
            <li>2: us-ascii</li>
            <li>3: windows-1251</li>
            <li>4: iso-8859-1</li>
          </ul>
        </div>
      </div>

      <div className="fsock-help-section">
        <h2 className="fsock-help-title">Content-Type</h2>
        <div className="fsock-help-grid">
          <div className="fsock-help-item">
            <code className="fsock-help-code">1: text/html</code>
          </div>
          <div className="fsock-help-item">
            <code className="fsock-help-code">2: multipart/alternative</code>
          </div>
        </div>
        <div className="fsock-example-card mini">
          <h3>EXAMPLE</h3>
          <pre className="fsock-example-pre mini">
            {`Content-Type: text/html;
Content-Type: multipart/alternative; boundary="--[[smallchar(X)]];`}
          </pre>
        </div>
      </div>

      <div className="fsock-help-section">
        <h2 className="fsock-help-title">Examples</h2>

        <div className="fsock-example-card">
          <h3>Example 1</h3>
          <pre className="fsock-example-pre">
            {`Received: by [[smallchar(3)]][[num(1)]].{{FromDomain}} id [[mixsmallalphanum(12)]] for <{{ToEmail}}>; [[RFC_Date_IST()]] (envelope-from )
Date: [[RFC_Date_IST()]]
From: {{FromName}} <{{FromEmail}}>
To: "{{ToName}}" <{{ToEmail}}>
Message-ID: {{MessageId}}
X-Sender: ((_track_))
Subject: {{SubjectLine}}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="--=_Part_[[num(7)]]_[[num(10)]].[[num(13)]]"
X-MC-Metadata: {"metadataId":"[[mixsmallalphanum(8)]]-[[mixsmallalphanum(4)]]-[[mixsmallalphanum(4)]]-[[mixsmallalphanum(4)]]-[[mixsmallalphanum(12)]]","stage":"prod","vendor":"powermta","recipients":"{{ToEmail}}"}
==--==
--{{boundary}}
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: quoted-printable

{{PlainContent_qp}}

--{{boundary}}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

{{HtmlContent_qp}}

--{{boundary}}--`}
          </pre>
        </div>

        <div className="fsock-help-info-card">
          <p>
            <strong>MESSAGE ID EXAMPLE :</strong>{" "}
            <code>{`<[[mixall(15)]]@91fulibao.com>`}</code>
          </p>
        </div>

        <div className="fsock-example-card">
          <h3>Example 2</h3>
          <pre className="fsock-example-pre">
            {`Content-Type: multipart/mixed; boundary="===============2819095487923153962=="
MIME-Version: 1.0
Subject: {{SubjectLine}}
From: {{FromName}} <{{FromEmail}}>
To: {{ToEmail}}
Reply-To: {{FromEmail}}
x-campaignid: [[mixsmallalphanum(24)]]
formatted_cid: [[mixsmallalphanum(24)]]_F_T_EM_AB_1_P_0_TIME_2025-07-26 08:55:41.239002_L_0
X-SMTPAPI: {"unique_args": {"cid": "[[mixsmallalphanum(24)]]", "user_id": "...","app_key": "...", "to_email": "{{ToEmail}}"}}
X-MC-Metadata: {"cid": "[[mixsmallalphanum(24)]]", "user_id": "...", "app_key": "...", "to_email": "{{ToEmail}}"}
X-MSYS-API: {"campaign_id": "[[mixsmallalphanum(24)]]", "metadata": {"cid": "...", "user_id": "...", "from": "{{FromEmail}}", "subject": "...", "to_email": "{{ToEmail}}"}}
Message-ID: {{MessageId}}
Date: [[RFC_Date_UTC()]]
Feedback-ID: [[mixall(37)]].[[mixall(21)]]...

==--==
--===============2819095487923153962==
Content-Type: text/html; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: base64

{{HtmlContent_base64}}
--===============2819095487923153962==--`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FsockHelp;
