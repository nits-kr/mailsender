const express = require("express");
const {
  getMailboxEmails,
  getMailboxData,
} = require("../controllers/mailboxController");

const router = express.Router();

router.get("/emails", getMailboxEmails);
router.get("/data/:email", getMailboxData);

module.exports = router;
