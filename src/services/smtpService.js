const net = require("net");

/**
 * Custom SMTP Client that performs raw handshake for precise control
 * Mirrors legacy PHP fsockopen logic
 */
class RawSmtpClient {
  constructor(options) {
    this.host = options.host;
    this.port = options.port || 25;
    this.timeout = options.timeout || 15000;
  }

  async send(params) {
    const { user, pass, from, to, body, returnPath } = params;
    let transcript = "";
    let success = false;
    let response = "";

    return new Promise((resolve, reject) => {
      const client = net.createConnection({
        host: this.host,
        port: this.port,
      });

      client.setTimeout(this.timeout);

      let step = 0;
      const commands = [
        () => `EHLO ${returnPath || from}\r\n`,
        () => `AUTH LOGIN\r\n`,
        () => `${Buffer.from(user).toString("base64")}\r\n`,
        () => `${Buffer.from(pass).toString("base64")}\r\n`,
        () => `MAIL FROM: <${returnPath || from}>\r\n`,
        () => `RCPT TO: <${to}>\r\n`,
        () => `DATA\r\n`,
        () => {
          const bodyWithRN = body.replace(/\r?\n/g, "\r\n");
          const bodyWithDots = bodyWithRN.replace(/^\./gm, "..");
          return `${bodyWithDots}\r\n.\r\n`;
        },
        () => `QUIT\r\n`,
      ];

      client.on("data", (data) => {
        const line = data.toString();
        transcript += line;

        // Process step by step based on SMTP numeric codes
        const code = line.substring(0, 3);

        switch (step) {
          case 0: // Banner received, send EHLO
            if (code === "220") {
              client.write(commands[0]());
              step++;
            }
            break;
          case 1: // EHLO response received, send AUTH LOGIN or MAIL FROM
            if (code === "250") {
              if (user && pass) {
                client.write(commands[1]());
                step = 2; // Jump to AUTH
              } else {
                client.write(commands[4]()); // Skip directly to MAIL FROM
                step = 5; // Jump to MAIL FROM state
              }
            }
            break;
          case 2: // AUTH LOGIN response, send User
            if (code === "334") {
              client.write(commands[2]());
              step++;
            }
            break;
          case 3: // User response, send Pass
            if (code === "334") {
              client.write(commands[3]());
              step++;
            }
            break;
          case 4: // Pass response, send MAIL FROM
            if (code === "235") {
              client.write(commands[4]());
              step++;
            } else {
              client.destroy();
              resolve({ success: false, transcript, error: "Auth Failed" });
            }
            break;
          case 5: // MAIL FROM response, send RCPT TO
            if (code === "250") {
              client.write(commands[5]());
              step++;
            }
            break;
          case 6: // RCPT TO response, send DATA
            if (code === "250") {
              client.write(commands[6]());
              step++;
            }
            break;
          case 7: // DATA response, send Body
            if (code === "354") {
              client.write(commands[7]());
              step++;
            }
            break;
          case 8: // Body sent, get response and send QUIT
            response = line;
            if (code === "250") success = true;
            client.write(commands[8]());
            step++;
            break;
          case 9: // QUIT accepted
            client.destroy();
            resolve({ success, transcript, response });
            break;
        }
      });

      client.on("error", (err) => {
        resolve({ success: false, transcript, error: err.message });
      });

      client.on("timeout", () => {
        client.destroy();
        resolve({ success: false, transcript, error: "Socket Timeout" });
      });
    });
  }
}

module.exports = RawSmtpClient;
