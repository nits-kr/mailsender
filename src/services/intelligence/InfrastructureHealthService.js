const { NodeSSH } = require("node-ssh");
const dns = require("dns").promises;
const logger = require("../../utils/logger");
const ReputationScore = require("../../models/ReputationScore");

class InfrastructureHealthService {
  constructor() {
    this.ssh = new NodeSSH();
  }

  /**
   * Checks if an IP's rDNS (PTR) matches its expected hostname
   */
  async verifyPTR(ip, expectedHostname) {
    try {
      const hostnames = await dns.reverse(ip);
      const isMatch = hostnames.includes(expectedHostname);

      if (!isMatch) {
        logger.warn(
          `PTR Mismatch for ${ip}: Found ${hostnames.join(", ")}, Expected ${expectedHostname}`,
        );
        return { success: false, found: hostnames };
      }

      return { success: true };
    } catch (error) {
      logger.error(`DNS PTR Check Error for ${ip}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Attempts to repair hostname/PTR settings on a remote server via SSH
   * @param {Object} serverConfig - SSH credentials and target hostname
   */
  async repairHostname(serverConfig) {
    const { host, username, password, privateKey, newHostname } = serverConfig;

    try {
      await this.ssh.connect({
        host,
        username,
        password,
        privateKey,
      });

      logger.info(`Repairing hostname on ${host}...`);

      // Commands to update hostname and hosts file
      const commands = [
        `hostnamectl set-hostname ${newHostname}`,
        `echo "${host} ${newHostname}" >> /etc/hosts`,
        `systemctl restart systemd-hostnamed`,
      ];

      for (const cmd of commands) {
        await this.ssh.execCommand(cmd);
      }

      await ReputationScore.findOneAndUpdate(
        { assetType: "ip", assetValue: host },
        { status: "healthy", lastChecked: new Date() },
      );

      return { success: true };
    } catch (error) {
      logger.error(
        `Infrastructure Repair Failed for ${host}: ${error.message}`,
      );
      return { success: false, error: error.message };
    } finally {
      this.ssh.dispose();
    }
  }
}

module.exports = new InfrastructureHealthService();
