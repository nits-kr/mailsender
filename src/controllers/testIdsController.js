const TestId = require("../models/TestId");
const pool = require("../config/mysql");

const getTestIds = async (req, res) => {
  try {
    const testIds = await TestId.find({}).sort({ createdAt: -1 });
    res.json(testIds);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching test IDs", error: error.message });
  }
};

const addTestId = async (req, res) => {
  const { domain, email, password, inboxhostname, spamhostname, port, status } =
    req.body;
  try {
    // Legacy filename parity logic
    const dataemail = email.split("@");
    const dataemails = (dataemail[0] || "").trim().replace(/[._-]/g, "");
    const filenameinbox = `${domain}_${dataemails}_INBOX.php`;
    const filenamespam = `${domain}_${dataemails}_SPAM.php`;

    const newTestId = new TestId({
      domain,
      email,
      password,
      inboxhostname,
      spamhostname,
      port,
      status,
      filenameinbox,
      filenamespam,
    });
    await newTestId.save();

    // Legacy Side Effect: Create MySQL Table in imap_data_new
    try {
      const querytable = `
        CREATE TABLE IF NOT EXISTS \`${email}\` (
          \`sno\` int(10) NOT NULL AUTO_INCREMENT,
          \`subject\` varchar(512) NOT NULL,
          \`from\` varchar(512) NOT NULL,
          \`to\` varchar(255) NOT NULL,
          \`date\` varchar(255) NOT NULL,
          \`message_id\` varchar(255) NOT NULL,
          \`uid\` varchar(100) NOT NULL,
          \`ip\` varchar(255) NOT NULL,
          \`status\` varchar(255) NOT NULL,
          \`last_update_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`sno\`),
          UNIQUE KEY \`uid\` (\`uid\`),
          KEY \`message_id\` (\`message_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

      // Select imap_data_new database or use qualified name
      await pool.query("CREATE DATABASE IF NOT EXISTS imap_data_new");
      await pool.query(`USE imap_data_new`);
      await pool.query(querytable);
    } catch (mysqlError) {
      console.error("MySQL Side Effect Failed:", mysqlError.message);
      // We don't fail the whole request if MySQL fails, as primary storage is Mongo
    }

    res.status(201).json(newTestId);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding test ID", error: error.message });
  }
};

const updateTestId = async (req, res) => {
  const { domain, email, password, inboxhostname, spamhostname, port, status } =
    req.body;
  try {
    // Generate filenames again in case domain/email changed
    const dataemail = email.split("@");
    const dataemails = (dataemail[0] || "").trim().replace(/[._-]/g, "");
    const filenameinbox = `${domain}_${dataemails}_INBOX.php`;
    const filenamespam = `${domain}_${dataemails}_SPAM.php`;

    const updatedTestId = await TestId.findByIdAndUpdate(
      req.params.id,
      {
        domain,
        email,
        password,
        inboxhostname,
        spamhostname,
        port,
        status,
        filenameinbox,
        filenamespam,
      },
      { new: true },
    );
    if (!updatedTestId) {
      return res.status(404).json({ message: "Test ID not found" });
    }
    res.json(updatedTestId);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating test ID", error: error.message });
  }
};

const deleteTestId = async (req, res) => {
  try {
    const deletedTestId = await TestId.findByIdAndDelete(req.params.id);
    if (!deletedTestId) {
      return res.status(404).json({ message: "Test ID not found" });
    }
    res.json({ message: "Test ID deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting test ID", error: error.message });
  }
};

module.exports = {
  getTestIds,
  addTestId,
  updateTestId,
  deleteTestId,
};
