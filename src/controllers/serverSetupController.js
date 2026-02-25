const { serverSetupSchema } = require("../utils/validators");
const { NodeSSH } = require("node-ssh");
const pool = require("../config/mysql");
const ssh = new NodeSSH();

const setupServer = async (req, res) => {
  try {
    serverSetupSchema.parse(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: error.errors });
  }

  const { ip, pass, dev_name, ips_text, actions, type, mode } = req.body;
  const isUbuntu = type === "ubuntu";
  const isSendingIp = type === "sending_ip";
  const centralIp = process.env.PUBLIC_API_URL || req.headers.host;

  // Determine the base protocol/URL for downloads
  let downloadUrlBase = `http://${centralIp}`;
  if (centralIp.includes("ngrok")) {
    downloadUrlBase = `https://${centralIp}`;
  }

  console.log(
    `[SETUP] IP: ${ip}, Type: ${type}, CentralIP: ${centralIp}, isSendingIp: ${isSendingIp}`,
  );

  const downloadHeaders =
    '-H "bypass-tunnel-reminder: true" -H "ngrok-skip-browser-warning: true" -H "User-Agent: Mozilla/5.0"';

  try {
    if (isSendingIp && mode === "remove") {
      await ssh.connect({ host: ip, username: "root", password: pass });
      const cleanCmd =
        "cd /var/www/html/; rm -rf *; echo '\nALL INTERFACE REMOVED SUCESSFULLY'; ";
      const result = await ssh.execCommand(cleanCmd);
      return res.json({
        message: "Sending IP removal tasks completed",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    await ssh.connect({
      host: ip,
      username: "root",
      password: pass,
    });

    let fullCommand = "";

    if (actions.install_http) {
      if (isUbuntu || isSendingIp) {
        // For MERN, we skip Apache for sending IPs and install Node.js
        fullCommand +=
          "export DEBIAN_FRONTEND=noninteractive; curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -; sudo apt-get install -y nodejs; sudo npm install -g pm2; ";
      } else {
        fullCommand +=
          "yum -y -q install httpd php php-mysql; service httpd restart; ";
      }
    }

    if (actions.install_php && (isUbuntu || isSendingIp)) {
      if (isSendingIp) {
        // In MERN mode, "Install PHP" for sending IPs is a no-op as we use Node.js
        fullCommand +=
          "echo 'Node.js already installed as replacement for PHP'; ";
      } else {
        fullCommand +=
          "export DEBIAN_FRONTEND=noninteractive; sudo apt-get purge php7.* -y; sudo apt update -y; cd /opt/; sudo apt install git dpkg-dev -y; ";
        fullCommand +=
          "git clone https://github.com/Karan06/php56-localrepo.git; cd /opt/php56-localrepo; dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz; ";
        fullCommand +=
          "echo 'deb [trusted=yes] file:/opt/php56-localrepo ./' | sudo tee /etc/apt/sources.list.d/php56-localrepo.list; sudo apt update -y; ";
        fullCommand +=
          "sudo apt install php5.6 php5.6-mcrypt php5.6-cli php5.6-gd php5.6-curl php5.6-mysql php5.6-ldap php5.6-zip php5.6-fileinfo php5.6-imap php5.6-xml php5.6-mbstring -y; service apache2 restart; ";
      }
    }

    if (actions.install_pmta && !isSendingIp) {
      if (isUbuntu) {
        fullCommand += `curl -s ${downloadHeaders} ${downloadUrlBase}/all_tar/pmta_setup_ubuntu.tar.gz -o pmta_setup_ubuntu.tar.gz; tar -zxf pmta_setup_ubuntu.tar.gz; sh setup_pmta_ubuntu.sh; `;
      } else {
        fullCommand +=
          "yum -y remove PowerMTA-*; cd /opt/; wget -q http://13.58.74.46/pmta_rpm.tar.gz; tar -xvf pmta_rpm.tar.gz; ";
        fullCommand += "cd PMTA\\=CONFIG/; rpm -ivh PowerMTA-*.rpm; ";
        fullCommand +=
          "mkdir -p /etc/pmta/files /etc/pmta/log /var/spool/pmtaPickup/Pickup; pmta /etc/pmta/config; ";
      }
    }

    if (isSendingIp) {
      if (actions.install_interfaces) {
        fullCommand += `mkdir -p /opt/mailer-agent; cd /opt/mailer-agent; curl -s ${downloadHeaders} ${downloadUrlBase}/all_tar/node_mailer_agent.tar.gz -o node_mailer_agent.tar.gz; tar -zxf node_mailer_agent.tar.gz; npm install; `;
        fullCommand +=
          "pm2 start mailerAgent.js --name mailer-agent; pm2 save; ";
      }
      if (actions.set_crontabs) {
        fullCommand +=
          'echo "01 * * * * rm -rf /tmp/*" >> /var/spool/cron/crontabs/root; chmod 600 /var/spool/cron/crontabs/root; ';
      }
      // No MySQL needed for sending IP servers in MongoDB mode
    }

    if (actions.install_ntp) {
      if (isUbuntu || isSendingIp) {
        fullCommand +=
          "export DEBIAN_FRONTEND=noninteractive; sudo apt-get install ntp ntpdate -y; sudo systemctl stop ntp; sudo ntpdate be.pool.ntp.org; sudo systemctl enable ntp; sudo systemctl start ntp; ";
      } else {
        fullCommand +=
          "yum -y install ntp; systemctl enable ntpdate; ntpdate be.pool.ntp.org; ";
      }
    }

    if (actions.flush_iptables) {
      fullCommand += "iptables -F; iptables-save; ";
    }

    if (actions.reboot_server) {
      fullCommand += "reboot; ";
    }

    if (actions.restart_services) {
      if (isUbuntu || isSendingIp) {
        fullCommand +=
          "service apache2 restart; service cron restart; service pmta restart; ";
      } else {
        fullCommand +=
          "service httpd restart; service crond restart; service pmta restart; ";
      }
    }

    if (actions.update_upgrade && (isUbuntu || isSendingIp)) {
      fullCommand +=
        'export DEBIAN_FRONTEND=noninteractive; sudo apt update -y && sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade; sudo apt-get remove nano -y; sudo apt-get install vim -y; ';
    }

    if (!fullCommand) {
      // Fallback or specific single command if no boxed actions selected
      fullCommand = "/sbin/ip addr";
    }

    console.log(`[SSH_CMD] Executing on ${ip}: ${fullCommand}`);

    const result = await ssh.execCommand(fullCommand);

    res.json({
      message: `${type.toUpperCase()} server setup tasks completed`,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "SSH Operation failed", error: error.message });
  }
};

const fs = require("fs");
const path = require("path");

const getSqlFiles = async (req, res) => {
  try {
    const sqlFilesPath = path.join(__dirname, "../../server_setup/sql_files");
    if (!fs.existsSync(sqlFilesPath)) {
      return res.json([]);
    }
    const files = fs
      .readdirSync(sqlFilesPath)
      .filter((file) => file.endsWith(".sql"));
    res.json(files);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching SQL files", error: error.message });
  }
};

module.exports = { setupServer, getSqlFiles };
