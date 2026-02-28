// @desc    Get all email tables from mailbox
// @route   GET /api/mailbox/emails
// NOTE: Mailbox data is now managed via MongoDB.
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
    // Now returns empty array as legacy data storage is not used.
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
