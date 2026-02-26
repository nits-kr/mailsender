// @desc    Get all email tables from mailbox
// @route   GET /api/mailbox/emails
// NOTE: Mailbox data was previously stored in MySQL imap_data_new tables.
// Since we are now fully MongoDB-based, this returns an empty array.
// IMAP email data can be migrated to a MongoDB collection in the future.
const getMailboxEmails = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Error fetching mailbox emails:", error);
    res
      .status(500)
      .json({ message: "Error fetching mailbox emails", error: error.message });
  }
};

// @desc    Get mailbox data for a specific email
// @route   GET /api/mailbox/data/:email
const getMailboxData = async (req, res) => {
  try {
    // Previously read from MySQL imap_data_new.<email> table.
    // Now returns empty array as data is no longer stored in MySQL.
    res.json([]);
  } catch (error) {
    console.error("Error fetching mailbox data:", error);
    res
      .status(500)
      .json({ message: "Error fetching mailbox data", error: error.message });
  }
};

module.exports = {
  getMailboxEmails,
  getMailboxData,
};
