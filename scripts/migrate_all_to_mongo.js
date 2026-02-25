const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/User");
const IP = require("../src/models/IP");
const Server = require("../src/models/Server");
const CampaignTemplate = require("../src/models/CampaignTemplate");

dotenv.config();

const migrateAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const mysqlConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "dvfersefag243435",
      database: "svml", // Main DB for campaigns and IPs
    };

    // We also need the 'login' DB for users
    const mysqlLoginConfig = { ...mysqlConfig, database: "login" };

    const conn = await mysql.createConnection(mysqlConfig);
    const loginConn = await mysql.createConnection(mysqlLoginConfig);
    console.log("Connected to MySQL");

    // 1. Migrate Users
    console.log("Migrating Users...");
    const [users] = await loginConn.execute("SELECT * FROM users");
    for (const u of users) {
      await User.findOneAndUpdate(
        { email: u.email },
        {
          name: u.name,
          password: u.password,
          designation: u.designation,
          status: u.status,
        },
        { upsert: true },
      );
    }
    console.log(`Migrated ${users.length} users`);

    // 2. Migrate IPs (mumara table)
    console.log("Migrating IPs...");
    const [ips] = await conn.execute("SELECT assignedip as ip FROM mumara");
    // Find or create a default server
    let server = await Server.findOne({ name: "Legacy MySQL Server" });
    if (!server) {
      server = await Server.create({
        name: "Legacy MySQL Server",
        ip: "127.0.0.1",
      });
    }

    for (const i of ips) {
      if (!i.ip) continue;
      await IP.findOneAndUpdate(
        { ip: i.ip },
        { server: server._id, status: "active" },
        { upsert: true },
      );
    }
    console.log(`Migrated ${ips.length} IPs`);

    // 3. Migrate Campaigns (svml_sendgrid table)
    console.log("Migrating Campaign Templates...");
    const [campaigns] = await conn.execute("SELECT * FROM svml_sendgrid");
    for (const c of campaigns) {
      await CampaignTemplate.findOneAndUpdate(
        { mysql_sno: c.sno },
        {
          name: c.tempname || "Untitled",
          accs: c.mutidomains || "",
          headers: c.headers
            ? Buffer.from(c.headers, "base64").toString("utf8")
            : "",
          from_email: c.ip || "",
          subject: c.subject || "",
          from_name: c.from_val || "",
          emails: c.emails || "",
          msg_type: c.type || "html",
          message_html: c.msg || "",
          message_plain: c.textm || "",
          search_replace: c.reason
            ? Buffer.from(c.reason, "base64").toString("utf8")
            : "",
          data_file: c.data || "",
          total_send: String(c.limits || ""),
          limit_to_send: c.limit_to_send || "",
          sleep_time: c.sleep_time || "",
          offer_id: c.offer || "",
          template_name: c.tempname || "",
          domain: c.domain || "",
          wait_time: String(c.wait || "2"),
          message_id: c.bcc || "",
          inb_pattern: c.inbpatt || "1",
          restart_choice: c.res_choice || "YES",
          script_choice: c.head || "",
          relay_percent: c.relay_per || "",
          inbox_percent: c.oid || "",
          times_to_send: String(c.times || "1"),
          mail_after: c.pwd || "",
          reply_to: c.reply_to || "0",
          xmailer: c.xmailer || "0",
          interval_time: String(c.interval_time || ""),
          charset: c.charen || "UTF-8",
          encoding: c.contend || "8bit",
          charset_alt: c.charen_alt || "UTF-8",
          encoding_alt: c.contend_alt || "8bit",
          mode: c.mode || "test",
          sen_t: c.sen_t || "manual",
          mysql_sno: c.sno,
        },
        { upsert: true },
      );
    }
    console.log(`Migrated ${campaigns.length} campaigns`);

    console.log("ALL DATA MIGRATED SUCCESSFULLY");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateAll();
