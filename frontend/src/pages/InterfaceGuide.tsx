import React from "react";
import "./InterfaceGuide.css";

const InterfaceGuide = () => {
  const guideData = [
    {
      syntax: "{{email}}",
      replace: "Client email id",
      example: "testid@mydomain.com",
    },
    {
      syntax: "{{name}}",
      replace: "Client name",
      example: "testid name (fetch from test id )",
    },
    {
      syntax: "{{fromid}}",
      replace: "From email id",
      example: "fromtestid@sendingdomain.com",
    },
    { syntax: "{{fromname}}", replace: "From name", example: "fromtestid" },
    { syntax: "{{date}}", replace: "DATE", example: "08-07-2021" },
    {
      syntax: "{{datetime}}",
      replace: "DATE TIME",
      example: "Sun, 05 Sep 2021 14:01:44 +0000",
    },
    { syntax: "{{domain}}", replace: "Domain", example: "freehelping.com" },
    {
      syntax: "{{msgid}}",
      replace: "Message id (Dynamic)",
      example:
        "<[[mixsmallalphanum(12)]]@mydomain.com> (Supports tags in settings)",
    },
    { type: "separator" },
    {
      syntax: "{{base_trk}}",
      replace: "Base64 encoded",
      example: "Open tracking / Offer link / Unsub link",
    },
    {
      syntax: "{{hex_trk}}",
      replace: "Hex encoding",
      example: "Open tracking / Offer link / Unsub link",
    },
    { syntax: "{{unsl}}", replace: "simple encoding", example: "Unsub link" },
    { syntax: "{{oln}}", replace: "simple encoding", example: "Offer link" },
    {
      syntax: "{{ourl}}",
      replace: "simple encoding",
      example: "Open tracking link",
    },
    { type: "separator" },
    { syntax: "[[num(10)]]", replace: "Only Number", example: "0123456789" },
    {
      syntax: "[[smallchar(10)]]",
      replace: "Only Small character",
      example: "abcdefghijklmnopqrstuvwxyz",
    },
    {
      syntax: "[[bigchar(10)]]",
      replace: "Only Big character",
      example: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    },
    {
      syntax: "[[mixsmallalphanum(10)]]",
      replace: "Mix Small + numbers character",
      example: "0123456789abcdefghijklmnopqrstuvwxyz",
    },
    {
      syntax: "[[mixbigalphanum(10)]]",
      replace: "Mix Big + Numbers character",
      example: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    },
    {
      syntax: "[[mixall(10)]]",
      replace: "Mix All (Numbers + Small + Big)",
      example: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    },
    {
      syntax: "[[hexdigit(10)]]",
      replace: "Only Hex digit",
      example: "0123456789abcdef",
    },
    { type: "separator" },
    { syntax: "[[RFC_Date_EST]]", replace: "EST Date Format", example: "" },
    { syntax: "[[RFC_Date_UTC]]", replace: "UTC Date Format", example: "" },
    { syntax: "[[RFC_Date_EDT]]", replace: "EDT Date Format", example: "" },
    { syntax: "[[RFC_Date_IST]]", replace: "IST Date Format", example: "" },
  ];

  return (
    <div className="interface-guide-page">
      <div className="guide-header-main">
        <h1>GUIDE TABLE</h1>
      </div>

      <div className="guide-table-container">
        <table className="guide-table">
          <thead>
            <tr>
              <th className="th-syntax">Syantax</th>
              <th className="th-replace">Replace by</th>
              <th className="th-example">Example</th>
            </tr>
          </thead>
          <tbody>
            {guideData.map((item, idx) => {
              if (item.type === "separator") {
                return (
                  <tr key={idx} className="separator-row">
                    <td colSpan={3}>
                      <div className="separator-line">
                        <span>=============================</span>
                        <span>=============================</span>
                        <span>=============================</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={idx}>
                  <td className="syntax-cell">{item.syntax}</td>
                  <td className="replace-cell">{item.replace}</td>
                  <td className="example-cell">{item.example}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="guide-examples-container">
        <div className="guide-example-box">
          <h3 className="example-title">Example 1 :</h3>
          <pre className="example-code">
            {`Received: from {{domain}} for <{{email}}>; [[RFC_Date_EST]]
Precedence: bulk
X-BeenThere: {{fromid}}
X-Mailman-Version: 2.1.33
X-List-Administrivia: yes
Sender: "{{fromid}}" <{{fromid}}>`}
          </pre>
        </div>

        <div className="guide-example-box">
          <h3 className="example-title">Example 2 :</h3>
          <pre className="example-code">
            {`X-Message-ID: {{msgid}}
X-Date: [[RFC_Date_UTC]]
x-idnv: [[num(1)]]-[[mixsmallalphanum(32)]]
x-job: [[num(5)]]-[[num(8)]]
List-Unsubscribe: <mailto:unsub@{{domain}}?subject=unsubscribe>
Sender: {{fromname}} <{{fromid}}>
X-From: {{fromname}} <{{fromid}}>
X-To: {{name}} <{{email}}>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InterfaceGuide;
