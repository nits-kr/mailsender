const express = require("express");
const {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  fetchComplains,
  getFetchedFiles,
} = require("../controllers/complainController");

const router = express.Router();

router.get("/accounts", getAccounts);
router.post("/accounts", addAccount);
router.put("/accounts/:id", updateAccount);
router.delete("/accounts/:id", deleteAccount);
router.post("/fetch", fetchComplains);
router.get("/files", getFetchedFiles);

module.exports = router;
