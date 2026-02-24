const net = require("net");

class RawEmailService {
  async sendRawEmail(config) {
    const { host, port, user, pass, from, to, body } = config;

    return new Promise((resolve, reject) => {
      const socket = net.createConnection(port, host);
      let response = "";

      socket.on("connect", () => {
        socket.write(`EHLO localhost\r\n`);
      });

      socket.on("data", (data) => {
        const step = data.toString();
        response += step;

        if (step.startsWith("220")) {
          // Connected
        } else if (step.startsWith("250")) {
          if (response.includes("EHLO")) {
            socket.write("AUTH LOGIN\r\n");
          } else if (response.includes("334")) {
            // Handled in next blocks
          }
        } else if (step.startsWith("334")) {
          if (!response.includes(Buffer.from(user).toString("base64"))) {
            socket.write(Buffer.from(user).toString("base64") + "\r\n");
          } else {
            socket.write(Buffer.from(pass).toString("base64") + "\r\n");
          }
        } else if (step.startsWith("235")) {
          socket.write(`MAIL FROM: <${from}>\r\n`);
        } else if (step.startsWith("250") && response.includes("MAIL FROM")) {
          socket.write(`RCPT TO: <${to}>\r\n`);
        } else if (step.startsWith("250") && response.includes("RCPT TO")) {
          socket.write("DATA\r\n");
        } else if (step.startsWith("354")) {
          socket.write(body + "\r\n.\r\n");
        } else if (step.startsWith("250") && response.includes("DATA")) {
          socket.write("QUIT\r\n");
          resolve({ success: true, response });
        }
      });

      socket.on("error", (err) => {
        reject(err);
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error("Timeout"));
      });
    });
  }
}

module.exports = new RawEmailService();
